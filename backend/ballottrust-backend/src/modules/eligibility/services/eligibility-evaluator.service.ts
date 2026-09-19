import { Injectable } from '@nestjs/common';

import {
  EligibilityCondition,
  EvaluationResult,
  ExplanationNode,
  RuleNode,
  VoterAttributes,
} from '../types';

/**
 * Pure evaluation logic for the eligibility rule tree (Sec4). No I/O, no
 * DB access — takes a rule tree and a voter's whitelisted attributes and
 * returns both the boolean result and a full explanation tree, so callers
 * can show/store *why* a voter passed or failed, not just whether they
 * did.
 */
@Injectable()
export class EligibilityEvaluatorService {
  evaluate(rule: RuleNode, voter: VoterAttributes): EvaluationResult {
    const explanation = this.evaluateNode(rule, voter);
    return {
      eligible: explanation.passed,
      explanation,
    };
  }

  private evaluateNode(
    node: RuleNode,
    voter: VoterAttributes,
  ): ExplanationNode {
    switch (node.type) {
      case 'CONDITION': {
        const actualValue = voter[node.condition.field];
        const passed = this.evaluateCondition(node.condition, actualValue);

        return {
          type: 'CONDITION',
          condition: node.condition,
          actualValue,
          passed,
        };
      }

      case 'AND': {
        const rules = node.rules.map((child) =>
          this.evaluateNode(child, voter),
        );

        return {
          type: 'AND',
          passed: rules.every((r) => r.passed),
          rules,
        };
      }

      case 'OR': {
        const rules = node.rules.map((child) =>
          this.evaluateNode(child, voter),
        );

        return {
          type: 'OR',
          passed: rules.some((r) => r.passed),
          rules,
        };
      }

      case 'NOT': {
        const inner = this.evaluateNode(node.rule, voter);

        return {
          type: 'NOT',
          passed: !inner.passed,
          rule: inner,
        };
      }
    }
  }

  private evaluateCondition(
    condition: EligibilityCondition,
    actualValue: unknown,
  ): boolean {
    switch (condition.operator) {
      case 'exists':
        return actualValue !== null && actualValue !== undefined;

      case 'eq':
        return actualValue === condition.value;

      case 'neq':
        return actualValue !== condition.value;

      case 'in':
        return (
          Array.isArray(condition.value) &&
          condition.value.includes(actualValue)
        );

      case 'nin':
        return (
          Array.isArray(condition.value) &&
          !condition.value.includes(actualValue)
        );

      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte':
        return this.evaluateComparison(
          condition.operator,
          actualValue,
          condition.value,
        );

      default:
        return false;
    }
  }

  private evaluateComparison(
    operator: 'gt' | 'gte' | 'lt' | 'lte',
    actualValue: unknown,
    target: unknown,
  ): boolean {
    // Numeric-only comparisons — a non-numeric actual/target value (e.g.
    // the field is null, or a rule was authored against the wrong field
    // type) never coerces into a surprising truthy/falsy comparison; it
    // simply fails the condition.
    if (typeof actualValue !== 'number' || typeof target !== 'number') {
      return false;
    }

    switch (operator) {
      case 'gt':
        return actualValue > target;
      case 'gte':
        return actualValue >= target;
      case 'lt':
        return actualValue < target;
      case 'lte':
        return actualValue <= target;
    }
  }
}

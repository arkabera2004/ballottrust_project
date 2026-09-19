import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  ELIGIBILITY_FIELDS,
  ELIGIBILITY_OPERATORS,
  EligibilityField,
  EligibilityOperator,
  RuleNode,
} from '../types';

const MAX_DEPTH = 8;
const MAX_OR_AND_BRANCHES = 20;

const FIELD_SET = new Set<string>(ELIGIBILITY_FIELDS);
const OPERATOR_SET = new Set<string>(ELIGIBILITY_OPERATORS);

const NUMERIC_OPERATORS = new Set(['gt', 'gte', 'lt', 'lte']);
const LIST_OPERATORS = new Set(['in', 'nin']);

/**
 * Validates a rule tree submitted by an admin before it's persisted as a
 * new EligibilityRuleSet version. Rejects anything referencing a
 * non-whitelisted field/operator, malformed condition shapes, or
 * unbounded nesting/branching — the rule tree is untrusted input from an
 * HTTP request, same as any other DTO.
 */
@Injectable()
export class EligibilityRuleValidator {
  validate(rule: unknown): RuleNode {
    const validated = this.validateNode(rule, 1);
    return validated;
  }

  private validateNode(node: unknown, depth: number): RuleNode {
    if (depth > MAX_DEPTH) {
      throw new BadRequestException(
        `Rule tree exceeds maximum nesting depth of ${MAX_DEPTH}.`,
      );
    }

    if (
      typeof node !== 'object' ||
      node === null ||
      !('type' in node)
    ) {
      throw new BadRequestException(
        'Each rule node must be an object with a "type" field.',
      );
    }

    const { type } = node as { type: unknown };

    switch (type) {
      case 'CONDITION':
        return this.validateCondition(node);

      case 'AND':
      case 'OR':
        return this.validateCombinator(
          type,
          node,
          depth,
        );

      case 'NOT':
        return this.validateNot(node, depth);

      default:
        throw new BadRequestException(
          `Unknown rule node type: "${String(type)}". Expected one of AND, OR, NOT, CONDITION.`,
        );
    }
  }

  private validateCondition(node: object): RuleNode {
    const condition = (node as { condition?: unknown }).condition;

    if (typeof condition !== 'object' || condition === null) {
      throw new BadRequestException(
        'CONDITION node requires a "condition" object.',
      );
    }

    const { field, operator, value } = condition as {
      field?: unknown;
      operator?: unknown;
      value?: unknown;
    };

    if (typeof field !== 'string' || !FIELD_SET.has(field)) {
      throw new BadRequestException(
        `Unknown or disallowed eligibility field: "${String(field)}". Allowed fields: ${ELIGIBILITY_FIELDS.join(', ')}.`,
      );
    }

    if (
      typeof operator !== 'string' ||
      !OPERATOR_SET.has(operator)
    ) {
      throw new BadRequestException(
        `Unknown eligibility operator: "${String(operator)}". Allowed operators: ${ELIGIBILITY_OPERATORS.join(', ')}.`,
      );
    }

    if (
      NUMERIC_OPERATORS.has(operator) &&
      typeof value !== 'number'
    ) {
      throw new BadRequestException(
        `Operator "${operator}" on field "${field}" requires a numeric value.`,
      );
    }

    if (LIST_OPERATORS.has(operator) && !Array.isArray(value)) {
      throw new BadRequestException(
        `Operator "${operator}" on field "${field}" requires an array value.`,
      );
    }

    if (
      operator !== 'exists' &&
      !NUMERIC_OPERATORS.has(operator) &&
      !LIST_OPERATORS.has(operator) &&
      value === undefined
    ) {
      throw new BadRequestException(
        `Operator "${operator}" on field "${field}" requires a value.`,
      );
    }

    return {
      type: 'CONDITION',
      condition: {
        field: field as EligibilityField,
        operator: operator as EligibilityOperator,
        value,
      },
    };
  }

  private validateCombinator(
    type: 'AND' | 'OR',
    node: object,
    depth: number,
  ): RuleNode {
    const rules = (node as { rules?: unknown }).rules;

    if (!Array.isArray(rules) || rules.length === 0) {
      throw new BadRequestException(
        `${type} node requires a non-empty "rules" array.`,
      );
    }

    if (rules.length > MAX_OR_AND_BRANCHES) {
      throw new BadRequestException(
        `${type} node exceeds maximum branch count of ${MAX_OR_AND_BRANCHES}.`,
      );
    }

    return {
      type,
      rules: rules.map((child) =>
        this.validateNode(child, depth + 1),
      ),
    } as RuleNode;
  }

  private validateNot(node: object, depth: number): RuleNode {
    const inner = (node as { rule?: unknown }).rule;

    if (typeof inner !== 'object' || inner === null) {
      throw new BadRequestException(
        'NOT node requires a "rule" object.',
      );
    }

    return {
      type: 'NOT',
      rule: this.validateNode(inner, depth + 1),
    };
  }
}

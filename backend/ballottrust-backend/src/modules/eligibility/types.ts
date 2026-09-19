/**
 * Sec4 — Dynamic Voter Eligibility Engine.
 *
 * A rule is a tree of AND/OR/NOT combinators over leaf CONDITION nodes.
 * Example: (Department = CSE OR ECE) AND Year >= 2 AND Status = APPROVED
 *
 * {
 *   type: 'AND',
 *   rules: [
 *     { type: 'OR', rules: [
 *       { type: 'CONDITION', condition: { field: 'department', operator: 'eq', value: 'CSE' } },
 *       { type: 'CONDITION', condition: { field: 'department', operator: 'eq', value: 'ECE' } },
 *     ] },
 *     { type: 'CONDITION', condition: { field: 'year', operator: 'gte', value: 2 } },
 *     { type: 'CONDITION', condition: { field: 'status', operator: 'eq', value: 'APPROVED' } },
 *   ],
 * }
 */

// Whitelisted voter attributes a rule may reference. Deliberately narrow —
// evaluating arbitrary User fields (password, tokens, etc.) is never
// allowed. Extending this list is the only way to expose a new attribute
// to the rule engine.
export const ELIGIBILITY_FIELDS = [
  'department',
  'course',
  'year',
  'semester',
  'role',
  'status',
] as const;

export type EligibilityField = (typeof ELIGIBILITY_FIELDS)[number];

export const ELIGIBILITY_OPERATORS = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'nin',
  'exists',
] as const;

export type EligibilityOperator = (typeof ELIGIBILITY_OPERATORS)[number];

export interface EligibilityCondition {
  field: EligibilityField;
  operator: EligibilityOperator;
  value?: unknown;
}

export interface ConditionNode {
  type: 'CONDITION';
  condition: EligibilityCondition;
}

export interface AndNode {
  type: 'AND';
  rules: RuleNode[];
}

export interface OrNode {
  type: 'OR';
  rules: RuleNode[];
}

export interface NotNode {
  type: 'NOT';
  rule: RuleNode;
}

export type RuleNode = ConditionNode | AndNode | OrNode | NotNode;

// Attributes pulled off User at evaluation time. Kept as a separate,
// narrow shape (rather than passing the whole User row around) so the
// evaluator can never accidentally reach a field outside the whitelist.
export type VoterAttributes = {
  [K in EligibilityField]: unknown;
};

// One node of the explanation tree returned alongside every evaluation —
// mirrors the rule tree shape so "why was this voter eligible/ineligible"
// is answerable node-by-node, not just as a final boolean.
export type ExplanationNode =
  | {
      type: 'CONDITION';
      condition: EligibilityCondition;
      actualValue: unknown;
      passed: boolean;
    }
  | {
      type: 'AND' | 'OR';
      passed: boolean;
      rules: ExplanationNode[];
    }
  | {
      type: 'NOT';
      passed: boolean;
      rule: ExplanationNode;
    };

export interface EvaluationResult {
  eligible: boolean;
  explanation: ExplanationNode;
}

export const DEFAULT_RULE: RuleNode = {
  type: 'AND',
  rules: [
    {
      type: 'CONDITION',
      condition: { field: 'role', operator: 'eq', value: 'VOTER' },
    },
    {
      type: 'CONDITION',
      condition: { field: 'status', operator: 'eq', value: 'APPROVED' },
    },
  ],
};

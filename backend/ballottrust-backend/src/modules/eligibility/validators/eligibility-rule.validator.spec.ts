import { BadRequestException } from '@nestjs/common';

import { EligibilityRuleValidator } from './eligibility-rule.validator';

describe('EligibilityRuleValidator', () => {
  let validator: EligibilityRuleValidator;

  beforeEach(() => {
    validator = new EligibilityRuleValidator();
  });

  it('accepts a well-formed AND/OR tree', () => {
    const rule = {
      type: 'AND',
      rules: [
        {
          type: 'OR',
          rules: [
            {
              type: 'CONDITION',
              condition: { field: 'department', operator: 'eq', value: 'CSE' },
            },
            {
              type: 'CONDITION',
              condition: { field: 'department', operator: 'eq', value: 'ECE' },
            },
          ],
        },
        {
          type: 'CONDITION',
          condition: { field: 'year', operator: 'gte', value: 2 },
        },
      ],
    };

    expect(() => validator.validate(rule)).not.toThrow();
  });

  it('accepts NOT nodes', () => {
    const rule = {
      type: 'NOT',
      rule: {
        type: 'CONDITION',
        condition: { field: 'status', operator: 'eq', value: 'REJECTED' },
      },
    };

    expect(() => validator.validate(rule)).not.toThrow();
  });

  it('rejects an unknown field', () => {
    const rule = {
      type: 'CONDITION',
      condition: { field: 'password', operator: 'eq', value: 'x' },
    };

    expect(() => validator.validate(rule)).toThrow(BadRequestException);
    expect(() => validator.validate(rule)).toThrow(
      /disallowed eligibility field/,
    );
  });

  it('rejects an unknown operator', () => {
    const rule = {
      type: 'CONDITION',
      condition: { field: 'department', operator: 'regex', value: '.*' },
    };

    expect(() => validator.validate(rule)).toThrow(BadRequestException);
  });

  it('rejects an unknown node type', () => {
    const rule = { type: 'XOR', rules: [] };

    expect(() => validator.validate(rule)).toThrow(BadRequestException);
  });

  it('rejects a numeric operator with a non-numeric value', () => {
    const rule = {
      type: 'CONDITION',
      condition: { field: 'year', operator: 'gte', value: 'two' },
    };

    expect(() => validator.validate(rule)).toThrow(/requires a numeric value/);
  });

  it('rejects a list operator with a non-array value', () => {
    const rule = {
      type: 'CONDITION',
      condition: { field: 'department', operator: 'in', value: 'CSE' },
    };

    expect(() => validator.validate(rule)).toThrow(/requires an array value/);
  });

  it('rejects an empty AND/OR rules array', () => {
    const rule = { type: 'AND', rules: [] };

    expect(() => validator.validate(rule)).toThrow(/non-empty "rules" array/);
  });

  it('rejects a rule tree deeper than the maximum nesting depth', () => {
    let rule: any = {
      type: 'CONDITION',
      condition: { field: 'status', operator: 'eq', value: 'APPROVED' },
    };

    for (let i = 0; i < 10; i++) {
      rule = { type: 'NOT', rule };
    }

    expect(() => validator.validate(rule)).toThrow(/maximum nesting depth/);
  });

  it('rejects an AND/OR node with more branches than the maximum', () => {
    const rules = Array.from({ length: 21 }, (_, i) => ({
      type: 'CONDITION',
      condition: { field: 'department', operator: 'eq', value: `D${i}` },
    }));

    const rule = { type: 'OR', rules };

    expect(() => validator.validate(rule)).toThrow(/maximum branch count/);
  });

  it('rejects a non-object node', () => {
    expect(() => validator.validate('not-a-rule')).toThrow(BadRequestException);
    expect(() => validator.validate(null)).toThrow(BadRequestException);
  });
});

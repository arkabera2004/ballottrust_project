import { EligibilityEvaluatorService } from './eligibility-evaluator.service';
import { RuleNode, VoterAttributes } from '../types';

describe('EligibilityEvaluatorService', () => {
  let service: EligibilityEvaluatorService;

  beforeEach(() => {
    service = new EligibilityEvaluatorService();
  });

  const voter = (
    overrides: Partial<VoterAttributes> = {},
  ): VoterAttributes => ({
    department: 'CSE',
    course: 'B.Tech',
    year: 2,
    semester: 3,
    role: 'VOTER',
    status: 'APPROVED',
    ...overrides,
  });

  it('evaluates a single CONDITION node', () => {
    const rule: RuleNode = {
      type: 'CONDITION',
      condition: { field: 'department', operator: 'eq', value: 'CSE' },
    };

    expect(service.evaluate(rule, voter()).eligible).toBe(true);
    expect(service.evaluate(rule, voter({ department: 'ECE' })).eligible).toBe(
      false,
    );
  });

  it('evaluates the worked example from the spec: (dept = CSE OR ECE) AND year >= 2 AND status = APPROVED', () => {
    const rule: RuleNode = {
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
        {
          type: 'CONDITION',
          condition: { field: 'status', operator: 'eq', value: 'APPROVED' },
        },
      ],
    };

    expect(service.evaluate(rule, voter()).eligible).toBe(true);
    expect(service.evaluate(rule, voter({ department: 'MECH' })).eligible).toBe(
      false,
    );
    expect(service.evaluate(rule, voter({ year: 1 })).eligible).toBe(false);
    expect(service.evaluate(rule, voter({ status: 'PENDING' })).eligible).toBe(
      false,
    );
    // ECE branch of the OR should also satisfy the rule.
    expect(service.evaluate(rule, voter({ department: 'ECE' })).eligible).toBe(
      true,
    );
  });

  it('evaluates NOT', () => {
    const rule: RuleNode = {
      type: 'NOT',
      rule: {
        type: 'CONDITION',
        condition: { field: 'department', operator: 'eq', value: 'CSE' },
      },
    };

    expect(service.evaluate(rule, voter()).eligible).toBe(false);
    expect(service.evaluate(rule, voter({ department: 'ECE' })).eligible).toBe(
      true,
    );
  });

  it('produces an explanation tree mirroring the rule structure', () => {
    const rule: RuleNode = {
      type: 'AND',
      rules: [
        {
          type: 'CONDITION',
          condition: { field: 'department', operator: 'eq', value: 'CSE' },
        },
        {
          type: 'CONDITION',
          condition: { field: 'year', operator: 'gte', value: 2 },
        },
      ],
    };

    const { explanation } = service.evaluate(rule, voter({ year: 1 }));

    expect(explanation).toEqual({
      type: 'AND',
      passed: false,
      rules: [
        {
          type: 'CONDITION',
          condition: { field: 'department', operator: 'eq', value: 'CSE' },
          actualValue: 'CSE',
          passed: true,
        },
        {
          type: 'CONDITION',
          condition: { field: 'year', operator: 'gte', value: 2 },
          actualValue: 1,
          passed: false,
        },
      ],
    });
  });

  it('treats a non-numeric actual value as failing numeric comparisons rather than throwing', () => {
    const rule: RuleNode = {
      type: 'CONDITION',
      condition: { field: 'year', operator: 'gte', value: 2 },
    };

    expect(service.evaluate(rule, voter({ year: null })).eligible).toBe(false);
  });

  it('evaluates in/nin against an array of values', () => {
    const rule: RuleNode = {
      type: 'CONDITION',
      condition: {
        field: 'department',
        operator: 'in',
        value: ['CSE', 'ECE'],
      },
    };

    expect(service.evaluate(rule, voter()).eligible).toBe(true);
    expect(service.evaluate(rule, voter({ department: 'MECH' })).eligible).toBe(
      false,
    );
  });

  it('evaluates exists', () => {
    const rule: RuleNode = {
      type: 'CONDITION',
      condition: { field: 'course', operator: 'exists' },
    };

    expect(service.evaluate(rule, voter()).eligible).toBe(true);
    expect(service.evaluate(rule, voter({ course: null })).eligible).toBe(
      false,
    );
  });
});

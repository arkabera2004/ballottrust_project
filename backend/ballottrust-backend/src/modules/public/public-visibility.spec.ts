import { ElectionStatus, ResultVisibility } from '@prisma/client';

import {
  PUBLIC_ELECTION_STATUSES,
  areResultsPublic,
} from './public-visibility';

describe('PUBLIC_ELECTION_STATUSES', () => {
  it.each([
    ElectionStatus.DRAFT,
    ElectionStatus.PENDING_APPROVAL,
    ElectionStatus.APPROVED,
    ElectionStatus.ARCHIVED,
  ])('excludes %s from the public portal', (status) => {
    expect(PUBLIC_ELECTION_STATUSES).not.toContain(status);
  });

  it.each([
    ElectionStatus.PUBLISHED,
    ElectionStatus.ACTIVE,
    ElectionStatus.VOTING_CLOSED,
    ElectionStatus.RESULT_PUBLISHED,
  ])('includes %s', (status) => {
    expect(PUBLIC_ELECTION_STATUSES).toContain(status);
  });
});

describe('areResultsPublic', () => {
  it('never exposes results for an unpublished election', () => {
    for (const visibility of Object.values(ResultVisibility)) {
      expect(areResultsPublic(ElectionStatus.DRAFT, visibility)).toBe(false);
      expect(areResultsPublic(ElectionStatus.APPROVED, visibility)).toBe(false);
    }
  });

  describe('IMMEDIATE', () => {
    it('exposes results once voting is under way', () => {
      expect(
        areResultsPublic(ElectionStatus.ACTIVE, ResultVisibility.IMMEDIATE),
      ).toBe(true);
    });

    it('does not expose results before voting opens', () => {
      expect(
        areResultsPublic(ElectionStatus.PUBLISHED, ResultVisibility.IMMEDIATE),
      ).toBe(false);
    });
  });

  describe('AFTER_CLOSURE', () => {
    it('withholds a running tally during an open election', () => {
      // Publishing partial counts mid-election would influence it.
      expect(
        areResultsPublic(ElectionStatus.ACTIVE, ResultVisibility.AFTER_CLOSURE),
      ).toBe(false);
    });

    it('exposes results once voting has closed', () => {
      expect(
        areResultsPublic(
          ElectionStatus.VOTING_CLOSED,
          ResultVisibility.AFTER_CLOSURE,
        ),
      ).toBe(true);
    });
  });

  describe('MANUAL', () => {
    it('withholds results until a commissioner publishes them', () => {
      expect(
        areResultsPublic(ElectionStatus.ACTIVE, ResultVisibility.MANUAL),
      ).toBe(false);
      expect(
        areResultsPublic(ElectionStatus.VOTING_CLOSED, ResultVisibility.MANUAL),
      ).toBe(false);
    });

    it('exposes results once published', () => {
      expect(
        areResultsPublic(
          ElectionStatus.RESULT_PUBLISHED,
          ResultVisibility.MANUAL,
        ),
      ).toBe(true);
    });
  });

  it('always exposes results once explicitly published, whatever the policy', () => {
    for (const visibility of Object.values(ResultVisibility)) {
      expect(
        areResultsPublic(ElectionStatus.RESULT_PUBLISHED, visibility),
      ).toBe(true);
    }
  });
});

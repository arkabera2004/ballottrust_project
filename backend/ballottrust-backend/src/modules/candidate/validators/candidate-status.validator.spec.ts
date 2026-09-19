import { BadRequestException } from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import { CandidateStatusValidator } from './candidate-status.validator';

describe('CandidateStatusValidator', () => {
  let validator: CandidateStatusValidator;

  beforeEach(() => {
    validator = new CandidateStatusValidator();
  });

  // ============================================================
  // VALID LIFECYCLE TRANSITIONS
  // ============================================================

  it('should allow PENDING → VERIFIED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.PENDING,
        CandidateStatus.VERIFIED,
      ),
    ).not.toThrow();
  });

  it('should allow PENDING → REJECTED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.PENDING,
        CandidateStatus.REJECTED,
      ),
    ).not.toThrow();
  });

  it('should allow VERIFIED → APPROVED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.VERIFIED,
        CandidateStatus.APPROVED,
      ),
    ).not.toThrow();
  });

  it('should allow VERIFIED → REJECTED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.VERIFIED,
        CandidateStatus.REJECTED,
      ),
    ).not.toThrow();
  });

  it('should allow APPROVED → WITHDRAWN', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.APPROVED,
        CandidateStatus.WITHDRAWN,
      ),
    ).not.toThrow();
  });

  it('should allow APPROVED → DISQUALIFIED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.APPROVED,
        CandidateStatus.DISQUALIFIED,
      ),
    ).not.toThrow();
  });

  // ============================================================
  // INVALID LIFECYCLE TRANSITIONS
  // ============================================================

  it('should reject PENDING → APPROVED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.PENDING,
        CandidateStatus.APPROVED,
      ),
    ).toThrow(BadRequestException);
  });

  it('should reject PENDING → WITHDRAWN', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.PENDING,
        CandidateStatus.WITHDRAWN,
      ),
    ).toThrow(BadRequestException);
  });

  it('should reject PENDING → DISQUALIFIED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.PENDING,
        CandidateStatus.DISQUALIFIED,
      ),
    ).toThrow(BadRequestException);
  });

  it('should reject VERIFIED → WITHDRAWN', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.VERIFIED,
        CandidateStatus.WITHDRAWN,
      ),
    ).toThrow(BadRequestException);
  });

  it('should reject VERIFIED → DISQUALIFIED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.VERIFIED,
        CandidateStatus.DISQUALIFIED,
      ),
    ).toThrow(BadRequestException);
  });

  it('should reject APPROVED → REJECTED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.APPROVED,
        CandidateStatus.REJECTED,
      ),
    ).toThrow(BadRequestException);
  });

  it('should reject APPROVED → VERIFIED', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.APPROVED,
        CandidateStatus.VERIFIED,
      ),
    ).toThrow(BadRequestException);
  });

  // ============================================================
  // REPEATED TRANSITIONS
  // ============================================================

  it('should reject transition to the same status', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.PENDING,
        CandidateStatus.PENDING,
      ),
    ).toThrow('Candidate is already in PENDING status.');
  });

  it('should reject repeated VERIFIED status', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.VERIFIED,
        CandidateStatus.VERIFIED,
      ),
    ).toThrow('Candidate is already in VERIFIED status.');
  });

  it('should reject repeated APPROVED status', () => {
    expect(() =>
      validator.validateTransition(
        CandidateStatus.APPROVED,
        CandidateStatus.APPROVED,
      ),
    ).toThrow('Candidate is already in APPROVED status.');
  });

  // ============================================================
  // TERMINAL STATES
  // ============================================================

  it('should identify REJECTED as a final status', () => {
    expect(validator.isFinalStatus(CandidateStatus.REJECTED)).toBe(true);
  });

  it('should identify WITHDRAWN as a final status', () => {
    expect(validator.isFinalStatus(CandidateStatus.WITHDRAWN)).toBe(true);
  });

  it('should identify DISQUALIFIED as a final status', () => {
    expect(validator.isFinalStatus(CandidateStatus.DISQUALIFIED)).toBe(true);
  });

  it('should identify PENDING as a non-final status', () => {
    expect(validator.isFinalStatus(CandidateStatus.PENDING)).toBe(false);
  });

  it('should identify VERIFIED as a non-final status', () => {
    expect(validator.isFinalStatus(CandidateStatus.VERIFIED)).toBe(false);
  });

  it('should identify APPROVED as a non-final status', () => {
    expect(validator.isFinalStatus(CandidateStatus.APPROVED)).toBe(false);
  });

  // ============================================================
  // CANDIDATE PROFILE EDITING
  // ============================================================

  it('should allow candidate editing while PENDING', () => {
    expect(() =>
      validator.validateEditable(CandidateStatus.PENDING),
    ).not.toThrow();
  });

  it('should reject candidate editing while VERIFIED', () => {
    expect(() => validator.validateEditable(CandidateStatus.VERIFIED)).toThrow(
      BadRequestException,
    );
  });

  it('should reject candidate editing while APPROVED', () => {
    expect(() => validator.validateEditable(CandidateStatus.APPROVED)).toThrow(
      BadRequestException,
    );
  });

  it('should reject candidate editing after REJECTED', () => {
    expect(() => validator.validateEditable(CandidateStatus.REJECTED)).toThrow(
      BadRequestException,
    );
  });

  // ============================================================
  // CAMPAIGN EDITING
  // ============================================================

  it('should allow campaign editing while APPROVED', () => {
    expect(() =>
      validator.validateCampaignEditable(CandidateStatus.APPROVED),
    ).not.toThrow();
  });

  it('should reject campaign editing while PENDING', () => {
    expect(() =>
      validator.validateCampaignEditable(CandidateStatus.PENDING),
    ).toThrow(BadRequestException);
  });

  it('should reject campaign editing while VERIFIED', () => {
    expect(() =>
      validator.validateCampaignEditable(CandidateStatus.VERIFIED),
    ).toThrow(BadRequestException);
  });

  it('should reject campaign editing after REJECTED', () => {
    expect(() =>
      validator.validateCampaignEditable(CandidateStatus.REJECTED),
    ).toThrow(BadRequestException);
  });
});

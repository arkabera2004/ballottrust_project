import { BadRequestException } from '@nestjs/common';
import { VoterRegistrationStatus } from '@prisma/client';

import { VoterRegistrationStatusValidator } from './voter-registration-status.validator';

describe('VoterRegistrationStatusValidator', () => {
  let validator: VoterRegistrationStatusValidator;

  beforeEach(() => {
    validator = new VoterRegistrationStatusValidator();
  });

  describe('validateTransition', () => {
    it.each([
      [VoterRegistrationStatus.PENDING, VoterRegistrationStatus.VERIFIED],
      [VoterRegistrationStatus.PENDING, VoterRegistrationStatus.REJECTED],
      [VoterRegistrationStatus.VERIFIED, VoterRegistrationStatus.APPROVED],
      [VoterRegistrationStatus.VERIFIED, VoterRegistrationStatus.REJECTED],
    ])('allows %s -> %s', (from, to) => {
      expect(() => validator.validateTransition(from, to)).not.toThrow();
    });

    it('rejects approving a registration that was never verified', () => {
      expect(() =>
        validator.validateTransition(
          VoterRegistrationStatus.PENDING,
          VoterRegistrationStatus.APPROVED,
        ),
      ).toThrow(BadRequestException);
    });

    it('rejects any transition out of a final status', () => {
      expect(() =>
        validator.validateTransition(
          VoterRegistrationStatus.APPROVED,
          VoterRegistrationStatus.REJECTED,
        ),
      ).toThrow(BadRequestException);

      expect(() =>
        validator.validateTransition(
          VoterRegistrationStatus.REJECTED,
          VoterRegistrationStatus.APPROVED,
        ),
      ).toThrow(BadRequestException);
    });

    it('rejects a no-op transition', () => {
      expect(() =>
        validator.validateTransition(
          VoterRegistrationStatus.PENDING,
          VoterRegistrationStatus.PENDING,
        ),
      ).toThrow(/already in PENDING/);
    });
  });

  describe('isFinalStatus', () => {
    it('treats APPROVED and REJECTED as final', () => {
      expect(validator.isFinalStatus(VoterRegistrationStatus.APPROVED)).toBe(
        true,
      );
      expect(validator.isFinalStatus(VoterRegistrationStatus.REJECTED)).toBe(
        true,
      );
    });

    it('treats PENDING and VERIFIED as non-final', () => {
      expect(validator.isFinalStatus(VoterRegistrationStatus.PENDING)).toBe(
        false,
      );
      expect(validator.isFinalStatus(VoterRegistrationStatus.VERIFIED)).toBe(
        false,
      );
    });
  });

  describe('validateEditable', () => {
    it('permits edits before a final decision', () => {
      expect(() =>
        validator.validateEditable(VoterRegistrationStatus.PENDING),
      ).not.toThrow();
    });

    it('blocks edits once a final decision is recorded', () => {
      expect(() =>
        validator.validateEditable(VoterRegistrationStatus.APPROVED),
      ).toThrow(BadRequestException);
    });
  });
});

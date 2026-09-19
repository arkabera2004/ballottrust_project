import { BadRequestException } from '@nestjs/common';
import { ManifestoStatus } from '@prisma/client';

import { ManifestoStatusValidator } from './manifesto-status.validator';

describe('ManifestoStatusValidator', () => {
  let validator: ManifestoStatusValidator;

  beforeEach(() => {
    validator = new ManifestoStatusValidator();
  });

  it.each([
    [ManifestoStatus.DRAFT, ManifestoStatus.SUBMITTED],
    [ManifestoStatus.SUBMITTED, ManifestoStatus.APPROVED],
    [ManifestoStatus.SUBMITTED, ManifestoStatus.REJECTED],
  ])('allows %s -> %s', (from, to) => {
    expect(() => validator.validateTransition(from, to)).not.toThrow();
  });

  it('refuses to approve a manifesto that was never submitted', () => {
    expect(() =>
      validator.validateTransition(
        ManifestoStatus.DRAFT,
        ManifestoStatus.APPROVED,
      ),
    ).toThrow(BadRequestException);
  });

  it('treats approved and rejected versions as immutable', () => {
    expect(() =>
      validator.validateTransition(
        ManifestoStatus.APPROVED,
        ManifestoStatus.REJECTED,
      ),
    ).toThrow(BadRequestException);

    expect(() =>
      validator.validateTransition(
        ManifestoStatus.REJECTED,
        ManifestoStatus.SUBMITTED,
      ),
    ).toThrow(BadRequestException);
  });

  describe('validateEditable', () => {
    it('allows editing a draft', () => {
      expect(() =>
        validator.validateEditable(ManifestoStatus.DRAFT),
      ).not.toThrow();
    });

    it.each([
      ManifestoStatus.SUBMITTED,
      ManifestoStatus.APPROVED,
      ManifestoStatus.REJECTED,
    ])('refuses to edit a %s manifesto in place', (status) => {
      expect(() => validator.validateEditable(status)).toThrow(
        /Create a new version instead/,
      );
    });
  });

  describe('validateDeletable', () => {
    it('allows deleting a draft', () => {
      expect(() =>
        validator.validateDeletable(ManifestoStatus.DRAFT),
      ).not.toThrow();
    });

    it('refuses to delete submitted history', () => {
      expect(() =>
        validator.validateDeletable(ManifestoStatus.APPROVED),
      ).toThrow(BadRequestException);
    });
  });
});

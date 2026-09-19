import { BadRequestException } from '@nestjs/common';
import { ElectionStatus } from '@prisma/client';

import { RegistrationWindowValidator } from './registration-window.validator';

describe('RegistrationWindowValidator', () => {
  let validator: RegistrationWindowValidator;

  const start = new Date('2026-01-10T00:00:00.000Z');
  const end = new Date('2026-01-20T00:00:00.000Z');
  const during = new Date('2026-01-15T00:00:00.000Z');

  beforeEach(() => {
    validator = new RegistrationWindowValidator();
  });

  it('accepts a registration inside the window on a published election', () => {
    expect(() =>
      validator.validate(ElectionStatus.PUBLISHED, start, end, during),
    ).not.toThrow();
  });

  it('rejects registration once the election is active', () => {
    expect(() =>
      validator.validate(ElectionStatus.ACTIVE, start, end, during),
    ).toThrow(/not accepting voter registrations/);
  });

  it('rejects registration when no window is configured', () => {
    expect(() =>
      validator.validate(ElectionStatus.PUBLISHED, null, null, during),
    ).toThrow(/has not been configured/);
  });

  it('rejects an inverted window', () => {
    expect(() =>
      validator.validate(ElectionStatus.PUBLISHED, end, start, during),
    ).toThrow(BadRequestException);
  });

  it('rejects registration before the window opens', () => {
    expect(() =>
      validator.validate(
        ElectionStatus.PUBLISHED,
        start,
        end,
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ).toThrow(/has not started yet/);
  });

  it('rejects registration after the window closes', () => {
    expect(() =>
      validator.validate(
        ElectionStatus.PUBLISHED,
        start,
        end,
        new Date('2026-02-01T00:00:00.000Z'),
      ),
    ).toThrow(/has ended/);
  });

  it('treats the window boundaries as inclusive', () => {
    expect(validator.isOpen(ElectionStatus.PUBLISHED, start, end, start)).toBe(
      true,
    );
    expect(validator.isOpen(ElectionStatus.PUBLISHED, start, end, end)).toBe(
      true,
    );
  });

  describe('getStatus', () => {
    it.each([
      [ElectionStatus.ACTIVE, start, end, during, 'CLOSED'],
      [ElectionStatus.PUBLISHED, null, null, during, 'NOT_CONFIGURED'],
      [
        ElectionStatus.PUBLISHED,
        start,
        end,
        new Date('2026-01-01T00:00:00.000Z'),
        'NOT_STARTED',
      ],
      [ElectionStatus.PUBLISHED, start, end, during, 'OPEN'],
      [
        ElectionStatus.PUBLISHED,
        start,
        end,
        new Date('2026-02-01T00:00:00.000Z'),
        'ENDED',
      ],
    ])('reports %s window as %s', (status, s, e, now, expected) => {
      expect(validator.getStatus(status, s, e, now)).toBe(expected);
    });
  });
});

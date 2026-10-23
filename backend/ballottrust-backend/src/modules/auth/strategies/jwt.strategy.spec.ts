import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    // The strategy now takes the secret from ConfigService instead of reading
    // process.env directly, so the environment no longer has to be primed.
    const config = new ConfigService({
      JWT_SECRET: 'ballottrust-test-secret',
    });

    strategy = new JwtStrategy(config);
  });

  // ============================================================
  // SECRET RESOLUTION
  // ============================================================

  it('fails fast when no JWT secret is configured', () => {
    // ConfigService#get() falls back to process.env when a key is absent
    // from the object passed to its constructor. Importing the real
    // `Role` enum above (a runtime value, not a type) loads @prisma/client,
    // whose generated runtime loads .env on import as a documented side
    // effect - populating process.env.JWT_SECRET from the real dev .env
    // file and defeating this test's "nothing is configured" premise.
    // Isolated here rather than left to accidentally pass or fail based on
    // whatever else ran first in the same Jest worker.
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    try {
      expect(() => new JwtStrategy(new ConfigService({}))).toThrow(
        /JWT_SECRET/,
      );
    } finally {
      if (original === undefined) {
        delete process.env.JWT_SECRET;
      } else {
        process.env.JWT_SECRET = original;
      }
    }
  });

  // ============================================================
  // STRATEGY INITIALIZATION
  // ============================================================

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  // ============================================================
  // JWT PAYLOAD VALIDATION
  // ============================================================

  it('should transform JWT payload into authenticated user data', async () => {
    const payload = {
      sub: 'user-123',
      email: 'user@example.com',
      role: Role.VOTER,
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-123',
      email: 'user@example.com',
      role: 'VOTER',
    });
  });

  // ============================================================
  // SUPER ADMIN PAYLOAD
  // ============================================================

  it('should preserve SUPER_ADMIN role from JWT payload', async () => {
    const payload = {
      sub: 'admin-123',
      email: 'admin@ballottrust.com',
      role: Role.SUPER_ADMIN,
    };

    const result = strategy.validate(payload);

    expect(result.userId).toBe('admin-123');

    expect(result.email).toBe('admin@ballottrust.com');

    expect(result.role).toBe('SUPER_ADMIN');
  });

  // ============================================================
  // ELECTION COMMISSIONER PAYLOAD
  // ============================================================

  it('should preserve ELECTION_COMMISSIONER role from JWT payload', async () => {
    const payload = {
      sub: 'commissioner-123',
      email: 'commissioner@ballottrust.com',
      role: Role.ELECTION_COMMISSIONER,
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      userId: 'commissioner-123',
      email: 'commissioner@ballottrust.com',
      role: 'ELECTION_COMMISSIONER',
    });
  });

  // ============================================================
  // CANDIDATE PAYLOAD
  // ============================================================

  it('should preserve CANDIDATE role from JWT payload', async () => {
    const payload = {
      sub: 'candidate-123',
      email: 'candidate@ballottrust.com',
      role: Role.CANDIDATE,
    };

    const result = strategy.validate(payload);

    expect(result.role).toBe('CANDIDATE');
  });

  // ============================================================
  // VOTER PAYLOAD
  // ============================================================

  it('should preserve VOTER role from JWT payload', async () => {
    const payload = {
      sub: 'voter-123',
      email: 'voter@ballottrust.com',
      role: Role.VOTER,
    };

    const result = strategy.validate(payload);

    expect(result.role).toBe('VOTER');
  });
});

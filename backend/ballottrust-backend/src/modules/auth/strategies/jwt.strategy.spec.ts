import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET =
      'ballottrust-test-secret';

    strategy = new JwtStrategy();
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
      role: 'VOTER',
    };

    const result =
      await strategy.validate(payload);

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
      role: 'SUPER_ADMIN',
    };

    const result =
      await strategy.validate(payload);

    expect(result.userId).toBe(
      'admin-123',
    );

    expect(result.email).toBe(
      'admin@ballottrust.com',
    );

    expect(result.role).toBe(
      'SUPER_ADMIN',
    );
  });

  // ============================================================
  // ELECTION COMMISSIONER PAYLOAD
  // ============================================================

  it('should preserve ELECTION_COMMISSIONER role from JWT payload', async () => {
    const payload = {
      sub: 'commissioner-123',
      email: 'commissioner@ballottrust.com',
      role: 'ELECTION_COMMISSIONER',
    };

    const result =
      await strategy.validate(payload);

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
      role: 'CANDIDATE',
    };

    const result =
      await strategy.validate(payload);

    expect(result.role).toBe(
      'CANDIDATE',
    );
  });

  // ============================================================
  // VOTER PAYLOAD
  // ============================================================

  it('should preserve VOTER role from JWT payload', async () => {
    const payload = {
      sub: 'voter-123',
      email: 'voter@ballottrust.com',
      role: 'VOTER',
    };

    const result =
      await strategy.validate(payload);

    expect(result.role).toBe(
      'VOTER',
    );
  });
});
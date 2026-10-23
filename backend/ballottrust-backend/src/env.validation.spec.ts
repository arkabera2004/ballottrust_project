import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const validConfig = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    JWT_SECRET: 'a-very-long-random-secret',
    GOOGLE_CLIENT_ID: 'client-id',
    GOOGLE_CLIENT_SECRET: 'client-secret',
    GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/v1/auth/google/callback',
    MAIL_HOST: 'localhost',
    MAIL_PORT: '1025',
    MAIL_FROM: 'BallotTrust <no-reply@ballottrust.local>',
  };

  it('accepts a config with every required variable set', () => {
    expect(() => validateEnv({ ...validConfig })).not.toThrow();
  });

  it('passes unrelated env vars through untouched (e.g. PATH, CI)', () => {
    const result = validateEnv({
      ...validConfig,
      PATH: '/usr/bin',
      CI: 'true',
    });

    expect(result.PATH).toBe('/usr/bin');
    expect(result.CI).toBe('true');
  });

  it.each([
    'DATABASE_URL',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_FROM',
  ])('rejects a config missing %s', (missingKey) => {
    const config = { ...validConfig };
    delete (config as Record<string, unknown>)[missingKey];

    expect(() => validateEnv(config)).toThrow(missingKey);
  });

  it('rejects a non-numeric MAIL_PORT', () => {
    expect(() =>
      validateEnv({ ...validConfig, MAIL_PORT: 'not-a-number' }),
    ).toThrow('MAIL_PORT must be numeric');
  });

  it('rejects a non-numeric PORT when PORT is set', () => {
    expect(() => validateEnv({ ...validConfig, PORT: 'not-a-number' })).toThrow(
      'PORT must be numeric',
    );
  });

  it('allows PORT, NODE_ENV, FRONTEND_URL, CORS_ORIGINS, and TRUST_PROXY to be omitted', () => {
    expect(() => validateEnv({ ...validConfig })).not.toThrow();
  });

  it('accepts TRUST_PROXY when set', () => {
    expect(() =>
      validateEnv({ ...validConfig, TRUST_PROXY: '1' }),
    ).not.toThrow();
  });
});

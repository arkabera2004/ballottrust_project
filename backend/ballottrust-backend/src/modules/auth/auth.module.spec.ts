import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { jwtModuleOptionsFactory } from './auth.module';

/**
 * Regression cover for the JwtModule env-loading order.
 *
 * The original code read `process.env.JWT_SECRET` inside
 * `JwtModule.register({ ... })`, which Node evaluates when auth.module.ts is
 * first imported — before `ConfigModule.forRoot()` has run dotenv. The secret
 * was therefore `undefined`, the app still booted cleanly, and the failure
 * only surfaced as a 500 on the first login:
 *
 *     Error: secretOrPrivateKey must have a value
 *
 * These tests pin the lazy behaviour so a future edit back to the eager form
 * fails here instead of in production.
 */
describe('AuthModule JWT registration', () => {
  const ORIGINAL_SECRET = process.env.JWT_SECRET;

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = ORIGINAL_SECRET;
    }
  });

  // ============================================================
  // LAZY RESOLUTION
  // ============================================================

  it('reads the secret from ConfigService rather than the ambient environment', () => {
    delete process.env.JWT_SECRET;

    const config = {
      getOrThrow: jest.fn().mockReturnValue('secret-from-config'),
    } as unknown as ConfigService;

    const options = jwtModuleOptionsFactory(config);

    expect(config.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');

    expect(options.secret).toBe('secret-from-config');
  });

  it('keeps the one-day access token expiry', () => {
    const config = {
      getOrThrow: jest.fn().mockReturnValue('any-secret'),
    } as unknown as ConfigService;

    expect(jwtModuleOptionsFactory(config).signOptions).toEqual({
      expiresIn: '1d',
    });
  });

  // ============================================================
  // THE ACTUAL REGRESSION
  // ============================================================

  it('signs tokens when the secret only becomes available after import', async () => {
    // Reproduces the real startup order: nothing in the environment at the
    // point the module graph is built, the value arriving later via the
    // config layer. Under the old eager `register()` this compiled fine and
    // then threw "secretOrPrivateKey must have a value" on sign().
    delete process.env.JWT_SECRET;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'late-loaded-secret' })],
        }),

        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: jwtModuleOptionsFactory,
        }),
      ],
    }).compile();

    const jwtService = moduleRef.get(JwtService);

    const token = jwtService.sign({ sub: 'user-1' });

    expect(typeof token).toBe('string');

    expect(jwtService.verify(token, { secret: 'late-loaded-secret' })).toEqual(
      expect.objectContaining({ sub: 'user-1' }),
    );

    await moduleRef.close();
  });

  // ============================================================
  // FAIL LOUDLY WHEN GENUINELY MISSING
  // ============================================================

  it('throws at construction when JWT_SECRET is absent everywhere', () => {
    delete process.env.JWT_SECRET;

    const config = new ConfigService({});

    expect(() => jwtModuleOptionsFactory(config)).toThrow(/JWT_SECRET/);
  });
});

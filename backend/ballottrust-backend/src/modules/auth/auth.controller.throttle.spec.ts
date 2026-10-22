import 'reflect-metadata';
import {
  THROTTLER_LIMIT,
  THROTTLER_TTL,
} from '@nestjs/throttler/dist/throttler.constants';

import { AuthController } from './auth.controller';

// Regression guard for BT-SEC-001: these endpoints are prime targets for
// credential-stuffing, OTP brute-force, and admin-bootstrap abuse, so each
// must carry a @Throttle() limit tighter than the global default (100/min)
// applied in app.module.ts. This reads the reflection metadata the
// decorator actually writes, rather than asserting on decorator syntax.
describe('AuthController rate limiting', () => {
  const GLOBAL_DEFAULT_LIMIT = 100;

  const cases: Array<[methodName: keyof AuthController, maxLimit: number]> = [
    ['register', 5],
    ['verifyEmail', 10],
    ['resendOtp', 3],
    ['login', 5],
    ['bootstrapAdmin', 3],
    ['forgotPassword', 3],
    ['resetPassword', 5],
  ];

  it.each(cases)(
    '%s is throttled below the global default',
    (methodName, maxLimit) => {
      const handler = AuthController.prototype[methodName];
      const limit = Reflect.getMetadata(THROTTLER_LIMIT + 'default', handler);
      const ttl = Reflect.getMetadata(THROTTLER_TTL + 'default', handler);

      expect(limit).toBeDefined();
      expect(limit).toBeLessThanOrEqual(maxLimit);
      expect(limit).toBeLessThan(GLOBAL_DEFAULT_LIMIT);
      expect(ttl).toBe(60_000);
    },
  );
});

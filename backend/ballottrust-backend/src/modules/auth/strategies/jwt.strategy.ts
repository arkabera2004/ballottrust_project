import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Role } from '@prisma/client';

import type { AuthenticatedUser } from '../../../common/types';

/** The claims as they appear inside a signed access token. */
interface SignedJwtClaims {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Read through ConfigService for the same reason as jwtModuleOptionsFactory
  // in auth.module.ts: the environment is not guaranteed to be loaded when
  // this file is imported. getOrThrow also replaces the previous non-null
  // assertion, which would have silently handed `undefined` to passport-jwt.
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: SignedJwtClaims): AuthenticatedUser {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenService } from './refresh-token.service';
import { MailModule } from '../mail/mail.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuditModule } from '../audit/audit.module';

/**
 * Resolves the signing key when the JwtModule is instantiated, not when this
 * file is first imported.
 *
 * `JwtModule.register({ secret: process.env.JWT_SECRET })` read the variable
 * at import time. Node evaluates this module while app.module.ts is still
 * resolving its own imports — which happens before `ConfigModule.forRoot()`
 * gets a chance to run dotenv — so the secret was `undefined` and every
 * sign() failed at request time with "secretOrPrivateKey must have a value".
 * Going through ConfigService defers the lookup until the environment has
 * been loaded, and getOrThrow turns a genuinely missing secret into a loud
 * failure at boot instead of a 500 on the first login.
 */
export const jwtModuleOptionsFactory = (
  config: ConfigService,
): JwtModuleOptions => ({
  secret: config.getOrThrow<string>('JWT_SECRET'),

  signOptions: {
    expiresIn: '1d',
  },
});

@Module({
  imports: [
    PrismaModule,
    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtModuleOptionsFactory,
    }),

    MailModule, // <-- ADD THIS
    AuditModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    RefreshTokenService,
    GoogleStrategy,
    GoogleAuthGuard,
  ],
})
export class AuthModule {}

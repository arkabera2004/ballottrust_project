import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

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


@Module({
  imports: [
    PrismaModule,
    PassportModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),

    MailModule,   // <-- ADD THIS
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

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import { BadRequestException } from '@nestjs/common';

import { ChangePasswordDto } from './dto/change-password.dto';
// Add imports
import { MailService } from '../mail/mail.service';
import { generateOtp } from '../../common/utils/otp.util';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { createHash, timingSafeEqual } from 'crypto';
import { generatePasswordResetToken } from '../../common/utils/password-reset.util';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import type { GoogleOAuthUser } from '../../common/types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private mailService: MailService,
    private auditService: AuditService,
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashedPassword = await argon2.hash(data.password);

    const otp = generateOtp();

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,

        email: data.email,

        password: hashedPassword,

        role: data.role,

        status: 'PENDING',

        emailVerified: false,

        emailVerificationOtp: otp,

        emailVerificationOtpExpiresAt: otpExpiry,

        provider: 'LOCAL',
      },
    });

    await this.mailService.sendVerificationOtp(user.email, otp);

    await this.auditService.log({
      userId: user.id,
      action: 'REGISTER',
      module: 'auth',
      entityType: 'User',
      entityId: user.id,
      result: 'SUCCESS',
    });

    return {
      success: true,

      message:
        'Registration successful. Verification OTP has been sent to your email.',

      userId: user.id,
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      await this.auditService.log({
        action: 'LOGIN_FAILED',
        module: 'auth',
        entityType: 'User',
        result: 'FAILURE',
        description: 'Unknown email',
        metadata: { email: data.email },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        module: 'auth',
        entityType: 'User',
        entityId: user.id,
        result: 'FAILURE',
        description: 'Password login attempted on Google-only account',
      });

      throw new UnauthorizedException(
        'This account uses Google Sign-In. Please continue with Google.',
      );
    }

    const validPassword = await argon2.verify(user.password, data.password);

    if (!validPassword) {
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        module: 'auth',
        entityType: 'User',
        entityId: user.id,
        result: 'FAILURE',
        description: 'Invalid password',
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'APPROVED') {
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        module: 'auth',
        entityType: 'User',
        entityId: user.id,
        result: 'FAILURE',
        description: `Account status is ${user.status}`,
      });

      throw new UnauthorizedException('Account pending approval');
    }
    if (!user.emailVerified) {
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        module: 'auth',
        entityType: 'User',
        entityId: user.id,
        result: 'FAILURE',
        description: 'Email not verified',
      });

      throw new UnauthorizedException('Please verify your email first.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      module: 'auth',
      entityType: 'User',
      entityId: user.id,
      result: 'SUCCESS',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * Creates the very first SUPER_ADMIN so a fresh deployment has someone who
   * can sign in. This is a dangerous thing to expose, so it is fenced in four
   * ways:
   *
   *   1. It does nothing unless BOOTSTRAP_ADMIN_TOKEN is configured. An
   *      unconfigured deployment answers 404, the same as any unknown route,
   *      so the endpoint's existence is not advertised.
   *   2. The caller has to present that token, compared in constant time.
   *   3. It refuses once *any* SUPER_ADMIN exists, not merely when one
   *      specific address is taken, so it cannot be used to add a second
   *      administrator later.
   *   4. The credentials come from the environment. There is no default
   *      password.
   *
   * Previously this method was unauthenticated and created
   * superadmin@ballottrust.com with the hardcoded password "Admin@123",
   * which handed full control of the system to anyone who could reach the
   * API. It also returned the created row verbatim, including the argon2
   * hash.
   */
  async bootstrapAdmin(data: BootstrapAdminDto) {
    const expectedToken = process.env.BOOTSTRAP_ADMIN_TOKEN;

    if (!expectedToken) {
      throw new NotFoundException();
    }

    if (!this.matchesBootstrapToken(data.token, expectedToken)) {
      await this.auditService.log({
        action: 'BOOTSTRAP_ADMIN_DENIED',
        module: 'auth',
        entityType: 'User',
        result: 'FAILURE',
        description: 'Invalid bootstrap token',
      });

      throw new ForbiddenException('Invalid bootstrap token.');
    }

    const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new ForbiddenException(
        'BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must be configured.',
      );
    }

    const existingAdmin = await this.prisma.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN,
      },
      select: {
        id: true,
      },
    });

    if (existingAdmin) {
      throw new ForbiddenException('A super admin already exists.');
    }

    const user = await this.prisma.user.create({
      data: {
        fullName: 'Super Admin',
        email,
        password: await argon2.hash(password),
        role: Role.SUPER_ADMIN,
        status: UserStatus.APPROVED,
        emailVerified: true,
        provider: 'LOCAL',
      },

      // Never return the password hash.
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'BOOTSTRAP_ADMIN_CREATED',
      module: 'auth',
      entityType: 'User',
      entityId: user.id,
      result: 'SUCCESS',
    });

    return {
      message: 'Super Admin created',
      user,
    };
  }

  /**
   * Constant-time comparison. timingSafeEqual throws on length mismatch, so
   * the lengths are checked first and a mismatch short-circuits — the length
   * of a rejected token is not secret.
   */
  private matchesBootstrapToken(provided: string, expected: string): boolean {
    const providedBuffer = Buffer.from(provided, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  }

  async refreshToken(data: RefreshTokenDto) {
    const token = await this.refreshTokenService.validateRefreshToken(
      data.refreshToken,
    );

    const user = await this.prisma.user.findUnique({
      where: {
        id: token.userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Rotation: the presented token is revoked and replaced with a new
    // one on every use. validateRefreshToken() only matches non-revoked
    // tokens, so presenting an already-rotated token again lands here as
    // an "Invalid Refresh Token" rejection rather than succeeding.
    await this.refreshTokenService.revokeToken(token.id);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(data: RefreshTokenDto) {
    await this.refreshTokenService.revokeByRefreshToken(data.refreshToken);

    return {
      message: 'Logout Successful',
    };
  }
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password

    if (!user.password) {
      throw new BadRequestException('Google accounts cannot change password.');
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      dto.currentPassword,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Prevent password reuse

    const isSamePassword = await argon2.verify(user.password, dto.newPassword);

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash new password

    const hashedPassword = await argon2.hash(dto.newPassword);

    // Update password

    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        password: hashedPassword,

        lastPasswordChange: new Date(),
      },
    });

    return {
      success: true,

      message: 'Password changed successfully',
    };
  }
  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerificationOtp !== dto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (
      !user.emailVerificationOtpExpiresAt ||
      user.emailVerificationOtpExpiresAt < new Date()
    ) {
      throw new BadRequestException('OTP expired');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        emailVerified: true,

        emailVerificationOtp: null,

        emailVerificationOtpExpiresAt: null,
      },
    });

    return {
      success: true,

      message: 'Email verified successfully',
    };
  }
  async resendOtp(dto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = generateOtp();

    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        emailVerificationOtp: otp,

        emailVerificationOtpExpiresAt: expiry,
      },
    });

    await this.mailService.sendVerificationOtp(user.email, otp);

    return {
      success: true,

      message: 'OTP sent successfully',
    };
  }
  async forgotPassword(dto: ForgotPasswordDto) {
    const genericResponse = {
      success: true,

      message:
        'If an account with that email exists, a password reset link has been sent.',
    };

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // Never reveal whether the email exists

    if (!user) {
      return genericResponse;
    }

    // Generate secure token

    const token = generatePasswordResetToken();

    // Hash token before storing

    const tokenHash = createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordResetToken: tokenHash,

        passwordResetTokenExpiresAt: expiresAt,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailService.sendResetPasswordEmail(
      user.email,

      resetLink,
    );

    return genericResponse;
  }
  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid password reset token.');
    }

    if (
      !user.passwordResetTokenExpiresAt ||
      user.passwordResetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Password reset link has expired.');
    }

    const hashedPassword = await argon2.hash(dto.password);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password: hashedPassword,

        lastPasswordChange: new Date(),

        passwordResetToken: null,

        passwordResetTokenExpiresAt: null,
      },
    });

    return {
      success: true,

      message: 'Password reset successfully.',
    };
  }

  async googleLogin(googleUser: GoogleOAuthUser, res: Response) {
    // Google only returns an email when the account exposes one and the
    // `email` scope was granted. Every downstream branch keys off it, and
    // `email` is a required unique column, so reject early rather than
    // letting `findUnique({ where: { email: undefined } })` throw.
    const email = googleUser.email;

    if (!email) {
      throw new BadRequestException(
        'Your Google account did not provide an email address. Use email registration instead.',
      );
    }

    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    // =====================================================
    // CASE 1:
    // Existing LOCAL account -> Link Google Account
    // =====================================================

    if (user && user.provider === 'LOCAL' && !user.googleLinked) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          googleLinked: true,

          providerId: googleUser.providerId,

          avatar: googleUser.avatar,
        },
      });
    }

    // =====================================================
    // CASE 2:
    // Existing Google Linked Account
    // Keep avatar updated
    // =====================================================
    else if (user && user.googleLinked) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          avatar: googleUser.avatar,
        },
      });
    }

    // =====================================================
    // CASE 3:
    // First Google Login
    // Create Google Account
    // =====================================================

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          fullName: googleUser.fullName ?? email,

          email,

          password: null,

          provider: 'GOOGLE',

          providerId: googleUser.providerId,

          googleLinked: true,

          avatar: googleUser.avatar,

          role: Role.VOTER,

          status: UserStatus.APPROVED,

          emailVerified: true,
        },
      });
    }

    // =====================================================
    // Generate JWT
    // =====================================================

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,

      email: user.email,

      role: user.role,
    });

    // =====================================================
    // Generate Refresh Token
    // =====================================================

    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    // =====================================================
    // Redirect Frontend
    // =====================================================

    return res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?` +
        `accessToken=${accessToken}` +
        `&refreshToken=${refreshToken}`,
    );
  }
}

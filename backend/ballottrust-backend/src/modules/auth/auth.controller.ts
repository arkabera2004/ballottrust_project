import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { Response } from 'express';
import type {
  AuthenticatedRequest,
  GoogleOAuthRequest,
} from '../../common/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==========================
  // Register
  // ==========================

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  register(
    @Body()
    data: RegisterDto,
  ) {
    return this.authService.register(data);
  }

  // ==========================
  // Verify Email
  // ==========================

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-email')
  verifyEmail(
    @Body()
    dto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(dto);
  }

  // ==========================
  // Resend OTP
  // ==========================

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('resend-otp')
  resendOtp(
    @Body()
    dto: ResendOtpDto,
  ) {
    return this.authService.resendOtp(dto);
  }

  // ==========================
  // Login
  // ==========================

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  login(
    @Body()
    data: LoginDto,
  ) {
    return this.authService.login(data);
  }

  // ==========================
  // Profile
  // ==========================

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @Req()
    req: AuthenticatedRequest,
  ) {
    return req.user;
  }

  // ==========================
  // Bootstrap Super Admin
  // ==========================

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('bootstrap-admin')
  bootstrapAdmin(
    @Body()
    data: BootstrapAdminDto,
  ) {
    return this.authService.bootstrapAdmin(data);
  }

  // ==========================
  // Refresh Token
  // ==========================

  @Post('refresh')
  refresh(
    @Body()
    data: RefreshTokenDto,
  ) {
    return this.authService.refreshToken(data);
  }

  // ==========================
  // Logout
  // ==========================

  @Post('logout')
  logout(
    @Body()
    data: RefreshTokenDto,
  ) {
    return this.authService.logout(data);
  }

  // ==========================
  // Change Password
  // ==========================

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req()
    req: Request & {
      user: {
        userId: string;
        email: string;
        role: string;
      };
    },

    @Body()
    dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, dto);
  }
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  forgotPassword(
    @Body()
    dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  resetPassword(
    @Body()
    dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Redirects user to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: GoogleOAuthRequest, @Res() res: Response) {
    return this.authService.googleLogin(req.user, res);
  }
}

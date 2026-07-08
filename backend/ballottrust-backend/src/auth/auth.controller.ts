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

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ==========================
  // Register
  // ==========================

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
    req: any,
  ) {
    return req.user;
  }

  // ==========================
  // Bootstrap Super Admin
  // ==========================

  @Post('bootstrap-admin')
  bootstrapAdmin() {
    return this.authService.bootstrapAdmin();
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
    return this.authService.changePassword(
      req.user.userId,
      dto,
    );
  }
  @Post('forgot-password')
forgotPassword(
  @Body()
  dto: ForgotPasswordDto,
) {

  return this.authService.forgotPassword(
    dto,
  );

}

@Post('reset-password')
resetPassword(
  @Body()
  dto: ResetPasswordDto,
) {

  return this.authService.resetPassword(
    dto,
  );

}

@Get('google')
@UseGuards(GoogleAuthGuard)
googleLogin() {
  // Redirects user to Google
}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleCallback(
  @Req() req: any,
  @Res() res: Response,
) {

  return this.authService.googleLogin(
    req.user,
    res,
  );

}
}
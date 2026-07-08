import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import { BadRequestException,} from '@nestjs/common';

import { ChangePasswordDto } from './dto/change-password.dto';
// Add imports
import { MailService } from '../mail/mail.service';
import { generateOtp } from '../../common/utils/otp.util';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { createHash } from 'crypto';
import { generatePasswordResetToken } from '../../common/utils/password-reset.util';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';
import { Role, UserStatus } from '@prisma/client';



@Injectable()
export class AuthService {
       constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
  private refreshTokenService: RefreshTokenService,
  private mailService: MailService,
) {}

            
            async register(data: RegisterDto) {

            const existingUser =
              await this.prisma.user.findUnique({
                where: {
                  email: data.email,
                },
              });

            if (existingUser) {
              throw new UnauthorizedException(
                'Email already registered',
              );
            }

            const hashedPassword =
              await argon2.hash(data.password);

            const otp = generateOtp();

            const otpExpiry = new Date(
              Date.now() + 10 * 60 * 1000,
            );

            const user =
              await this.prisma.user.create({

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

            await this.mailService.sendVerificationOtp(
              user.email,
              otp,
            );

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
                throw new UnauthorizedException('Invalid credentials');
            }

            if (!user.password) {

              throw new UnauthorizedException(
                'This account uses Google Sign-In. Please continue with Google.',
              );

}

            const validPassword = await argon2.verify(
                user.password,
                data.password,
            );

            if (!validPassword) {
                throw new UnauthorizedException('Invalid credentials');
            }
            
            if (user.status !== 'APPROVED') {
            throw new UnauthorizedException('Account pending approval');
            }
            if (!user.emailVerified) {
            throw new UnauthorizedException(
              'Please verify your email first.',
            );

          }

         
            const accessToken =
        await this.jwtService.signAsync({
          sub: user.id,
          email: user.email,
          role: user.role,
        });

      const refreshToken =
        await this.refreshTokenService.generateRefreshToken(
          user.id,
        );

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

      async bootstrapAdmin() {
        const existingUser =
          await this.prisma.user.findUnique({
            where: {
              email: 'superadmin@ballottrust.com',
            },
          });

        if (existingUser) {
          return {
            message: 'Super Admin already exists',
          };
        }

        const hashedPassword =
          await argon2.hash('Admin@123');

        const user =
          await this.prisma.user.create({
            data: {
              fullName: 'Super Admin',
              email: 'superadmin@ballottrust.com',
              password: hashedPassword,
              role: 'SUPER_ADMIN',
              status: 'APPROVED',
              emailVerified: true,
              provider: 'LOCAL',
      },
          });

        return {
          message: 'Super Admin created',
          user,
        };
      }

      async refreshToken(
        data: RefreshTokenDto,
      ) {
        const token =
          await this.refreshTokenService.validateRefreshToken(
            data.refreshToken,
          );

        const user =
          await this.prisma.user.findUnique({
            where: {
              id: token.userId,
            },
          });

        if (!user) {
          throw new UnauthorizedException(
            'User not found',
          );
        }

        const accessToken =
          await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role,
          });

        return {
          access_token: accessToken,
        };
      }

      async logout(
        data: RefreshTokenDto,
      ) {
        await this.refreshTokenService.revokeByRefreshToken(
          data.refreshToken,
        );

        return {
          message: 'Logout Successful',
        };
      }
      async changePassword(
        userId: string,
        dto: ChangePasswordDto,
      ) {

        const user = await this.prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new UnauthorizedException(
            'User not found',
          );
        }

        

        // Verify current password

        if (!user.password) {

        throw new BadRequestException(
          'Google accounts cannot change password.',
        );

      }

      const isPasswordValid =
        await argon2.verify(
          user.password,
          dto.currentPassword,
        );

        if (!isPasswordValid) {

          throw new BadRequestException(
            'Current password is incorrect',
          );

        }

        // Prevent password reuse

        const isSamePassword =
          await argon2.verify(
            user.password,
            dto.newPassword,
          );

        if (isSamePassword) {

          throw new BadRequestException(
            'New password must be different from current password',
          );

        }

        // Hash new password

        const hashedPassword =
          await argon2.hash(
            dto.newPassword,
          );

        // Update password

        await this.prisma.user.update({

          where: {
            id: userId,
          },

          data: {

            password: hashedPassword,

            lastPasswordChange:
              new Date(),

          },

        });

        return {

          success: true,

          message:
            'Password changed successfully',

        };

      }
      async verifyEmail(
        dto: VerifyEmailDto,
      ) {

        const user =
          await this.prisma.user.findUnique({
            where: {
              email: dto.email,
            },
          });

        if (!user) {

          throw new BadRequestException(
            'User not found',
          );

        }

        if (user.emailVerificationOtp !== dto.otp) {

          throw new BadRequestException(
            'Invalid OTP',
          );

        }

        if (
          !user.emailVerificationOtpExpiresAt ||
          user.emailVerificationOtpExpiresAt < new Date()
        ) {

          throw new BadRequestException(
            'OTP expired',
          );

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

          message:
            'Email verified successfully',

        };

      }
      async resendOtp(
        dto: ResendOtpDto,
      ) {

        const user =
          await this.prisma.user.findUnique({
            where: {
              email: dto.email,
            },
          });

        if (!user) {

          throw new BadRequestException(
            'User not found',
          );

        }

        if (user.emailVerified) {

          throw new BadRequestException(
            'Email already verified',
          );

        }

        const otp = generateOtp();

        const expiry =
          new Date(
            Date.now() + 10 * 60 * 1000,
          );

        await this.prisma.user.update({

          where: {
            id: user.id,
          },

          data: {

            emailVerificationOtp: otp,

            emailVerificationOtpExpiresAt: expiry,

          },

        });

        await this.mailService.sendVerificationOtp(
          user.email,
          otp,
        );

        return {

          success: true,

          message:
            'OTP sent successfully',

        };

      }
      async forgotPassword(
        dto: ForgotPasswordDto,
      ) {

        const genericResponse = {

          success: true,

          message:
            'If an account with that email exists, a password reset link has been sent.',

        };

        const user =
          await this.prisma.user.findUnique({

            where: {

              email: dto.email,

            },

          });

        // Never reveal whether the email exists

        if (!user) {

          return genericResponse;

        }

        // Generate secure token

        const token =
          generatePasswordResetToken();

        // Hash token before storing

        const tokenHash =
          createHash('sha256')
            .update(token)
            .digest('hex');

        const expiresAt =
          new Date(
            Date.now() + 15 * 60 * 1000,
          );

        await this.prisma.user.update({

          where: {

            id: user.id,

          },

          data: {

            passwordResetToken:
              tokenHash,

            passwordResetTokenExpiresAt:
              expiresAt,

          },

        });

        const resetLink =
          `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await this.mailService.sendResetPasswordEmail(

          user.email,

          resetLink,

        );

        return genericResponse;

      }
      async resetPassword(
        dto: ResetPasswordDto,
      ) {

        const tokenHash =
          createHash('sha256')
            .update(dto.token)
            .digest('hex');

        const user =
          await this.prisma.user.findFirst({

            where: {

              passwordResetToken:
                tokenHash,

            },

          });

        if (!user) {

          throw new BadRequestException(
            'Invalid password reset token.',
          );

        }

        if (

          !user.passwordResetTokenExpiresAt ||

          user.passwordResetTokenExpiresAt <
            new Date()

        ) {

          throw new BadRequestException(
            'Password reset link has expired.',
          );

        }

        const hashedPassword =
          await argon2.hash(
            dto.password,
          );

        await this.prisma.user.update({

          where: {

            id: user.id,

          },

          data: {

            password: hashedPassword,

            lastPasswordChange:
              new Date(),

            passwordResetToken:
              null,

            passwordResetTokenExpiresAt:
              null,

          },

        });

        return {

          success: true,

          message:
            'Password reset successfully.',

        };

      }

      async googleLogin(
  googleUser: any,
  res: Response,
) {

  let user =
    await this.prisma.user.findUnique({

      where: {

        email: googleUser.email,

      },

    });

  // =====================================================
  // CASE 1:
  // Existing LOCAL account -> Link Google Account
  // =====================================================

  if (
    user &&
    user.provider === 'LOCAL' &&
    !user.googleLinked
  ) {

    user =
      await this.prisma.user.update({

        where: {

          id: user.id,

        },

        data: {

          googleLinked: true,

          providerId:
            googleUser.providerId,

          avatar:
            googleUser.avatar,

        },

      });

  }

  // =====================================================
  // CASE 2:
  // Existing Google Linked Account
  // Keep avatar updated
  // =====================================================

  else if (
    user &&
    user.googleLinked
  ) {

    user =
      await this.prisma.user.update({

        where: {

          id: user.id,

        },

        data: {

          avatar:
            googleUser.avatar,

        },

      });

  }

  // =====================================================
  // CASE 3:
  // First Google Login
  // Create Google Account
  // =====================================================

  if (!user) {

    user =
      await this.prisma.user.create({

        data: {

          fullName:
            googleUser.fullName,

          email:
            googleUser.email,

          password: null,

          provider: 'GOOGLE',

          providerId:
            googleUser.providerId,

          googleLinked: true,

          avatar:
            googleUser.avatar,

          role: Role.VOTER,

          status:
            UserStatus.APPROVED,

          emailVerified: true,

        },

      });

  }

  // =====================================================
  // Generate JWT
  // =====================================================

  const accessToken =
    await this.jwtService.signAsync({

      sub: user.id,

      email: user.email,

      role: user.role,

    });

  // =====================================================
  // Generate Refresh Token
  // =====================================================

  const refreshToken =
    await this.refreshTokenService.generateRefreshToken(
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

import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
  ) {}

  /*
   * Generate Refresh Token
   */
  async generateRefreshToken(
    userId: string,
  ) {
    const refreshToken =
      randomBytes(64).toString('hex');

    const tokenHash =
      await argon2.hash(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + 30,
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });

    return refreshToken;
  }

  /*
   * Validate Refresh Token
   */
  async validateRefreshToken(
    refreshToken: string,
  ) {
    const tokens =
      await this.prisma.refreshToken.findMany({
        where: {
          revoked: false,
        },
      });

    for (const token of tokens) {
      const valid =
        await argon2.verify(
          token.tokenHash,
          refreshToken,
        );

      if (!valid) continue;

      if (
        token.expiresAt < new Date()
      ) {
        throw new UnauthorizedException(
          'Refresh Token Expired',
        );
      }

      return token;
    }

    throw new UnauthorizedException(
      'Invalid Refresh Token',
    );
  }

  /*
   * Revoke Refresh Token
   */
  async revokeToken(
    id: string,
  ) {
    return this.prisma.refreshToken.update({
      where: {
        id,
      },
      data: {
        revoked: true,
      },
    });
  }
  async revokeByRefreshToken(
  refreshToken: string,
) {
  const token =
    await this.validateRefreshToken(
      refreshToken,
    );

  return this.prisma.refreshToken.update({
    where: {
      id: token.id,
    },
    data: {
      revoked: true,
    },
  });
}
}
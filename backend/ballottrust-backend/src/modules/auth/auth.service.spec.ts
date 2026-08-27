import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshTokenService } from './refresh-token.service';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockRefreshTokenService = {
    createRefreshToken: jest.fn(),
    refreshAccessToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllUserTokens: jest.fn(),
  };

  const mockMailService = {
    sendVerificationOtp: jest.fn(),
    sendPasswordResetOtp: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AuthService,

          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },

          {
            provide: JwtService,
            useValue: mockJwtService,
          },

          {
            provide: RefreshTokenService,
            useValue: mockRefreshTokenService,
          },

          {
            provide: MailService,
            useValue: mockMailService,
          },
        ],
      }).compile();

    service =
      module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
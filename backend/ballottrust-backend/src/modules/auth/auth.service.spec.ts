import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Role, UserStatus } from '@prisma/client';

import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshTokenService } from './refresh-token.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
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

        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // BOOTSTRAP SUPER ADMIN
  // ============================================================

  describe('bootstrapAdmin', () => {
    const ENV_KEYS = [
      'BOOTSTRAP_ADMIN_TOKEN',
      'BOOTSTRAP_ADMIN_EMAIL',
      'BOOTSTRAP_ADMIN_PASSWORD',
    ] as const;

    const originalEnv: Record<string, string | undefined> = {};

    beforeEach(() => {
      for (const key of ENV_KEYS) {
        originalEnv[key] = process.env[key];
        delete process.env[key];
      }
    });

    afterEach(() => {
      for (const key of ENV_KEYS) {
        if (originalEnv[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = originalEnv[key];
        }
      }
    });

    const enable = () => {
      process.env.BOOTSTRAP_ADMIN_TOKEN = 'correct-horse-battery-staple';
      process.env.BOOTSTRAP_ADMIN_EMAIL = 'admin@example.test';
      process.env.BOOTSTRAP_ADMIN_PASSWORD = 'a-real-password';
    };

    it('is invisible when no bootstrap token is configured', async () => {
      await expect(
        service.bootstrapAdmin({ token: 'anything' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('rejects a wrong token without creating anything', async () => {
      enable();

      await expect(
        service.bootstrapAdmin({ token: 'not-the-token' }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('rejects a token that is a prefix of the real one', async () => {
      enable();

      await expect(
        service.bootstrapAdmin({ token: 'correct-horse' }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('refuses when any super admin already exists', async () => {
      enable();

      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.bootstrapAdmin({ token: 'correct-horse-battery-staple' }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: Role.SUPER_ADMIN } }),
      );

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('refuses when the token is set but credentials are not', async () => {
      process.env.BOOTSTRAP_ADMIN_TOKEN = 'correct-horse-battery-staple';

      await expect(
        service.bootstrapAdmin({ token: 'correct-horse-battery-staple' }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('creates the admin from the environment and never returns the hash', async () => {
      enable();

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      mockPrismaService.user.create.mockResolvedValue({
        id: 'admin-1',
        fullName: 'Super Admin',
        email: 'admin@example.test',
        role: Role.SUPER_ADMIN,
        status: UserStatus.APPROVED,
      });

      const result = await service.bootstrapAdmin({
        token: 'correct-horse-battery-staple',
      });

      const createArg = mockPrismaService.user.create.mock.calls[0][0];

      expect(createArg.data.email).toBe('admin@example.test');

      expect(createArg.data.role).toBe(Role.SUPER_ADMIN);

      // The stored password must be a hash, not the plaintext from the env.
      expect(createArg.data.password).not.toBe('a-real-password');

      expect(createArg.data.password).toMatch(/^\$argon2/);

      // The projection must exclude the password column entirely.
      expect(Object.keys(createArg.select)).not.toContain('password');

      expect(result.user).not.toHaveProperty('password');
    });
  });
});

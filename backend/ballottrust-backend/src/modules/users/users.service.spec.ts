import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,

        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // ============================================================
  // DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // GET PENDING USERS
  // ============================================================

  it('should return pending users', async () => {
    const pendingUsers = [
      {
        id: 'user-1',
        fullName: 'Pending User One',
        email: 'user1@example.com',
        status: 'PENDING',
      },
      {
        id: 'user-2',
        fullName: 'Pending User Two',
        email: 'user2@example.com',
        status: 'PENDING',
      },
    ];

    mockPrismaService.user.findMany.mockResolvedValue(pendingUsers);

    const result = await service.getPendingUsers();

    expect(result).toEqual(pendingUsers);

    expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        status: 'PENDING',
      },
    });
  });

  // ============================================================
  // APPROVE USER
  // ============================================================

  it('should approve a user', async () => {
    const approvedUser = {
      id: 'user-1',
      fullName: 'Test User',
      email: 'user@example.com',
      status: 'APPROVED',
    };

    mockPrismaService.user.update.mockResolvedValue(approvedUser);

    const result = await service.approveUser('user-1');

    expect(result).toEqual(approvedUser);

    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      data: {
        status: 'APPROVED',
      },
    });
  });

  // ============================================================
  // REJECT USER
  // ============================================================

  it('should reject a user', async () => {
    const rejectedUser = {
      id: 'user-1',
      fullName: 'Test User',
      email: 'user@example.com',
      status: 'REJECTED',
    };

    mockPrismaService.user.update.mockResolvedValue(rejectedUser);

    const result = await service.rejectUser('user-1');

    expect(result).toEqual(rejectedUser);

    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      data: {
        status: 'REJECTED',
      },
    });
  });

  // ============================================================
  // CREATE STAFF
  // ============================================================

  it('should create a staff user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    const createdStaff = {
      id: 'staff-1',
      fullName: 'Staff Member',
      email: 'staff@example.com',
      role: 'ELECTION_COMMISSIONER',
      status: 'APPROVED',
    };

    mockPrismaService.user.create.mockResolvedValue(createdStaff);

    const data = {
      fullName: 'Staff Member',
      email: 'staff@example.com',
      password: 'StrongPassword123!',
      role: 'ELECTION_COMMISSIONER',
    };

    const result = await service.createStaff(data as any);

    expect(result).toEqual(createdStaff);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'staff@example.com',
      },
    });

    expect(mockPrismaService.user.create).toHaveBeenCalled();

    const createCall = mockPrismaService.user.create.mock.calls[0][0];

    expect(createCall.data).toEqual(
      expect.objectContaining({
        fullName: 'Staff Member',
        email: 'staff@example.com',
        role: 'ELECTION_COMMISSIONER',
        status: 'APPROVED',
      }),
    );

    expect(createCall.data.password).toEqual(expect.any(String));

    expect(createCall.data.password).not.toBe('StrongPassword123!');
  });

  // ============================================================
  // DUPLICATE EMAIL
  // ============================================================

  it('should reject staff creation when email already exists', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'existing-user',
      email: 'existing@example.com',
    });

    const data = {
      fullName: 'New Staff',
      email: 'existing@example.com',
      password: 'StrongPassword123!',
      role: 'ELECTION_COMMISSIONER',
    };

    await expect(service.createStaff(data as any)).rejects.toThrow(
      'Email already exists',
    );

    expect(mockPrismaService.user.create).not.toHaveBeenCalled();
  });
});

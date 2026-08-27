import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    getPendingUsers: jest.fn(),
    approveUser: jest.fn(),
    rejectUser: jest.fn(),
    createStaff: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [
          UsersController,
        ],

        providers: [
          {
            provide: UsersService,
            useValue: mockUsersService,
          },
        ],
      }).compile();

    controller =
      module.get<UsersController>(
        UsersController,
      );
  });

  // ============================================================
  // DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============================================================
  // GET PENDING USERS
  // ============================================================

  it('should get pending users', async () => {
    const users = [
      {
        id: 'user-1',
        fullName: 'Pending User',
        status: 'PENDING',
      },
    ];

    mockUsersService.getPendingUsers.mockResolvedValue(
      users,
    );

    const result =
      await controller.getPendingUsers();

    expect(result).toEqual(users);

    expect(
      mockUsersService.getPendingUsers,
    ).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // APPROVE USER
  // ============================================================

  it('should approve a user', async () => {
    const approvedUser = {
      id: 'user-1',
      status: 'APPROVED',
    };

    mockUsersService.approveUser.mockResolvedValue(
      approvedUser,
    );

    const result =
      await controller.approveUser(
        'user-1',
      );

    expect(result).toEqual(
      approvedUser,
    );

    expect(
      mockUsersService.approveUser,
    ).toHaveBeenCalledWith(
      'user-1',
    );
  });

  // ============================================================
  // REJECT USER
  // ============================================================

  it('should reject a user', async () => {
    const rejectedUser = {
      id: 'user-1',
      status: 'REJECTED',
    };

    mockUsersService.rejectUser.mockResolvedValue(
      rejectedUser,
    );

    const result =
      await controller.rejectUser(
        'user-1',
      );

    expect(result).toEqual(
      rejectedUser,
    );

    expect(
      mockUsersService.rejectUser,
    ).toHaveBeenCalledWith(
      'user-1',
    );
  });

  // ============================================================
  // CREATE STAFF
  // ============================================================

  it('should create a staff user', async () => {
    const data = {
      fullName: 'Staff Member',
      email: 'staff@example.com',
      password: 'StrongPassword123!',
      role: 'ELECTION_COMMISSIONER',
    };

    const createdStaff = {
      id: 'staff-1',
      fullName: 'Staff Member',
      email: 'staff@example.com',
      status: 'APPROVED',
    };

    mockUsersService.createStaff.mockResolvedValue(
      createdStaff,
    );

    const result =
      await controller.createStaff(
        data as any,
      );

    expect(result).toEqual(
      createdStaff,
    );

    expect(
      mockUsersService.createStaff,
    ).toHaveBeenCalledWith(
      data,
    );
  });
});
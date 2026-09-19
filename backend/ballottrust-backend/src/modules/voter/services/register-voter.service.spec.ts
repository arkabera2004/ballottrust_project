import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ElectionStatus, Role, VoterRegistrationSource } from '@prisma/client';

import { RegisterVoterService } from './register-voter.service';
import { RegistrationWindowValidator } from '../validators/registration-window.validator';

describe('RegisterVoterService', () => {
  let service: RegisterVoterService;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
    election: { findFirst: jest.fn() },
  };

  const mockRepository = {
    findByUserAndElectionIncludingDeleted: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockAudit = { log: jest.fn() };

  const dto = { electionId: 'election-1' };

  const openElection = {
    id: 'election-1',
    status: ElectionStatus.PUBLISHED,
    // Window deliberately spans "now" so the real validator passes.
    registrationStart: new Date(Date.now() - 86_400_000),
    registrationEnd: new Date(Date.now() + 86_400_000),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      role: Role.VOTER,
      emailVerified: true,
    });
    mockPrisma.election.findFirst.mockResolvedValue(openElection);
    mockRepository.findByUserAndElectionIncludingDeleted.mockResolvedValue(
      null,
    );
    mockRepository.create.mockResolvedValue({ id: 'reg-1' });
    mockRepository.update.mockResolvedValue({ id: 'reg-1' });

    service = new RegisterVoterService(
      mockPrisma as any,
      mockRepository as any,
      // The real validator — window rules are worth exercising here.
      new RegistrationWindowValidator(),
      mockAudit as any,
    );
  });

  it('registers an eligible voter', async () => {
    const result = await service.execute('user-1', dto);

    expect(result).toEqual({ id: 'reg-1' });
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: VoterRegistrationSource.SELF }),
    );
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'VOTER_REGISTERED' }),
    );
  });

  it('rejects an unknown user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(service.execute('ghost', dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects an account that is not a VOTER', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      role: Role.CANDIDATE,
      emailVerified: true,
    });

    await expect(service.execute('user-1', dto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects a voter who has not verified their email', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      role: Role.VOTER,
      emailVerified: false,
    });

    await expect(service.execute('user-1', dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects an unknown election', async () => {
    mockPrisma.election.findFirst.mockResolvedValue(null);

    await expect(service.execute('user-1', dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects registration outside the window', async () => {
    mockPrisma.election.findFirst.mockResolvedValue({
      ...openElection,
      registrationEnd: new Date(Date.now() - 1000),
    });

    await expect(service.execute('user-1', dto)).rejects.toThrow(/has ended/);
  });

  it('rejects a duplicate active registration', async () => {
    mockRepository.findByUserAndElectionIncludingDeleted.mockResolvedValue({
      id: 'reg-1',
      deletedAt: null,
    });

    await expect(service.execute('user-1', dto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('revives a soft-deleted registration and clears prior decisions', async () => {
    mockRepository.findByUserAndElectionIncludingDeleted.mockResolvedValue({
      id: 'reg-1',
      deletedAt: new Date(),
    });

    await service.execute('user-1', dto);

    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockRepository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({
        deletedAt: null,
        status: 'PENDING',
        rejectionReason: null,
        verifiedBy: { disconnect: true },
        approvedBy: { disconnect: true },
        rejectedBy: { disconnect: true },
      }),
    );
  });
});

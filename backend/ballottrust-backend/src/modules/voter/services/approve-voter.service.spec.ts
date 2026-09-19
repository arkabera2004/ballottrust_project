import { NotFoundException } from '@nestjs/common';
import { VoterRegistrationStatus } from '@prisma/client';

import { ApproveVoterService } from './approve-voter.service';
import { VoterRegistrationStatusValidator } from '../validators/voter-registration-status.validator';

describe('ApproveVoterService', () => {
  let service: ApproveVoterService;

  const mockRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockAudit = { log: jest.fn() };

  const mockEventEmitter = { emit: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.update.mockResolvedValue({ id: 'reg-1' });

    service = new ApproveVoterService(
      mockRepository as any,
      new VoterRegistrationStatusValidator(),
      mockAudit as any,
      mockEventEmitter as any,
    );
  });

  it('approves a verified registration', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'reg-1',
      status: VoterRegistrationStatus.VERIFIED,
      electionId: 'election-1',
      userId: 'voter-1',
      election: { title: 'Student Council 2026' },
    });

    await service.execute('reg-1', 'officer-1');

    expect(mockRepository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({
        status: VoterRegistrationStatus.APPROVED,
        approvedBy: { connect: { id: 'officer-1' } },
      }),
    );
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'VOTER_APPROVED' }),
    );
  });

  it('notifies the voter that they are on the roll', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'reg-1',
      status: VoterRegistrationStatus.VERIFIED,
      electionId: 'election-1',
      userId: 'voter-1',
      election: { title: 'Student Council 2026' },
    });

    await service.execute('reg-1', 'officer-1');

    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'notification.requested',
      expect.objectContaining({
        userId: 'voter-1',
        entityType: 'VoterRegistration',
        entityId: 'reg-1',
        sendEmail: true,
      }),
    );
  });

  it('does not notify when the transition is refused', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'reg-1',
      status: VoterRegistrationStatus.PENDING,
      electionId: 'election-1',
      userId: 'voter-1',
      election: { title: 'Student Council 2026' },
    });

    await expect(service.execute('reg-1', 'officer-1')).rejects.toThrow();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('refuses to approve a registration that was never verified', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'reg-1',
      status: VoterRegistrationStatus.PENDING,
      electionId: 'election-1',
    });

    await expect(service.execute('reg-1', 'officer-1')).rejects.toThrow(
      /cannot transition from PENDING to APPROVED/,
    );
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('rejects an unknown registration', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.execute('missing', 'officer-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});

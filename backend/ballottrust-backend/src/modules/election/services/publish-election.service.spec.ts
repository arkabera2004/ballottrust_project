import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ElectionStatus } from '@prisma/client';

import { PublishElectionService } from './publish-election.service';
import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';
import { AuditService } from '../../audit/audit.service';

describe('PublishElectionService', () => {
  let service: PublishElectionService;

  const mockRepository = {
    findByIdOrThrow: jest.fn(),
    publishElection: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishElectionService,
        ElectionWorkflowValidator,
        { provide: ElectionRepository, useValue: mockRepository },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<PublishElectionService>(PublishElectionService);
  });

  // ============================================================
  // WORKFLOW GUARD
  // ============================================================

  it('refuses to publish an election that is not approved', async () => {
    mockRepository.findByIdOrThrow.mockResolvedValue({
      id: 'election-1',
      status: ElectionStatus.DRAFT,
    });

    await expect(
      service.execute('election-1', 'user-1'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(mockRepository.publishElection).not.toHaveBeenCalled();
  });

  // ============================================================
  // HAPPY PATH
  // ============================================================

  it('publishes an approved election and records who did it', async () => {
    mockRepository.findByIdOrThrow.mockResolvedValue({
      id: 'election-1',
      status: ElectionStatus.APPROVED,
    });

    mockRepository.publishElection.mockResolvedValue({
      id: 'election-1',
      status: ElectionStatus.PUBLISHED,
    });

    const result = await service.execute('election-1', 'user-1');

    expect(mockRepository.publishElection).toHaveBeenCalledWith(
      'election-1',
      'user-1',
    );

    expect(result.data.status).toBe(ElectionStatus.PUBLISHED);
  });

  // ============================================================
  // AUDIT TRAIL
  // ============================================================

  it('writes an audit entry carrying the previous status', async () => {
    mockRepository.findByIdOrThrow.mockResolvedValue({
      id: 'election-1',
      status: ElectionStatus.APPROVED,
    });

    mockRepository.publishElection.mockResolvedValue({
      id: 'election-1',
      status: ElectionStatus.PUBLISHED,
    });

    await service.execute('election-1', 'user-1');

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'ELECTION_PUBLISHED',
        entityId: 'election-1',
        result: 'SUCCESS',
        metadata: { previousStatus: ElectionStatus.APPROVED },
      }),
    );
  });

  it('does not audit a publish that was rejected by the validator', async () => {
    mockRepository.findByIdOrThrow.mockResolvedValue({
      id: 'election-1',
      status: ElectionStatus.ARCHIVED,
    });

    await expect(service.execute('election-1', 'user-1')).rejects.toThrow();

    expect(mockAuditService.log).not.toHaveBeenCalled();
  });
});

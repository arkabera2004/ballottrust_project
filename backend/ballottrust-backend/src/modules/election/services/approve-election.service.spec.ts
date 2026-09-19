import { Test, TestingModule } from '@nestjs/testing';

import { ApproveElectionService } from './approve-election.service';
import { ElectionRepository } from '../repository';
import { ElectionWorkflowValidator } from '../validators';
import { AuditService } from '../../audit/audit.service';

describe('ApproveElectionService', () => {
  let service: ApproveElectionService;

  const mockRepository = {
    findByIdOrThrow: jest.fn(),
    approveElection: jest.fn(),
  };

  const mockWorkflowValidator = {
    ensureCanApprove: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveElectionService,
        {
          provide: ElectionRepository,
          useValue: mockRepository,
        },
        {
          provide: ElectionWorkflowValidator,
          useValue: mockWorkflowValidator,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<ApproveElectionService>(ApproveElectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('approves the election and records an audit entry', async () => {
    const election = {
      id: 'election-1',
      status: 'PENDING_APPROVAL',
    };

    mockRepository.findByIdOrThrow.mockResolvedValue(election);
    mockRepository.approveElection.mockResolvedValue({
      ...election,
      status: 'APPROVED',
    });

    const result = await service.execute('election-1', 'admin-1');

    expect(mockWorkflowValidator.ensureCanApprove).toHaveBeenCalledWith(
      'PENDING_APPROVAL',
    );

    expect(mockRepository.approveElection).toHaveBeenCalledWith(
      'election-1',
      'admin-1',
    );

    expect(result.status).toBe('APPROVED');

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'admin-1',
        action: 'ELECTION_APPROVED',
        module: 'election',
        entityType: 'Election',
        entityId: 'election-1',
        result: 'SUCCESS',
      }),
    );
  });

  it('propagates the workflow validator rejection and skips the audit log', async () => {
    mockRepository.findByIdOrThrow.mockResolvedValue({
      id: 'election-1',
      status: 'DRAFT',
    });

    mockWorkflowValidator.ensureCanApprove.mockImplementation(() => {
      throw new Error('Cannot approve from DRAFT');
    });

    await expect(service.execute('election-1', 'admin-1')).rejects.toThrow(
      'Cannot approve from DRAFT',
    );

    expect(mockRepository.approveElection).not.toHaveBeenCalled();
    expect(mockAuditService.log).not.toHaveBeenCalled();
  });
});

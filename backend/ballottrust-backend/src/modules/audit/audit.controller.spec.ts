import { Test, TestingModule } from '@nestjs/testing';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

describe('AuditController', () => {
  let controller: AuditController;

  const mockAuditService = {
    verifyChain: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AuditController],
        providers: [
          {
            provide: AuditService,
            useValue: mockAuditService,
          },
        ],
      }).compile();

    controller = module.get<AuditController>(AuditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns the audit chain verification result', async () => {
    const verificationResult = {
      valid: true,
      message: 'Audit chain integrity verified',
      totalRecords: 10,
    };

    mockAuditService.verifyChain.mockResolvedValue(verificationResult);

    const result = await controller.verify();

    expect(result).toEqual(verificationResult);
    expect(mockAuditService.verifyChain).toHaveBeenCalledTimes(1);
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';

describe('BlockchainController', () => {
  let controller: BlockchainController;

  const mockBlockchainService = {
    verifyChain: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [
          BlockchainController,
        ],

        providers: [
          {
            provide: BlockchainService,
            useValue: mockBlockchainService,
          },
        ],
      }).compile();

    controller =
      module.get<BlockchainController>(
        BlockchainController,
      );
  });

  // ============================================================
  // DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============================================================
  // VERIFY BLOCKCHAIN
  // ============================================================

  it('should return blockchain verification result', async () => {
    const verificationResult = {
      valid: true,
      message:
        'Blockchain integrity verified',
      totalVotes: 5,
    };

    mockBlockchainService.verifyChain
      .mockResolvedValue(
        verificationResult,
      );

    const result =
      await controller.verify();

    expect(result).toEqual(
      verificationResult,
    );

    expect(
      mockBlockchainService.verifyChain,
    ).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // INVALID BLOCKCHAIN
  // ============================================================

  it('should return an invalid blockchain result', async () => {
    const verificationResult = {
      valid: false,
      message:
        'Hash mismatch at vote vote-1',
    };

    mockBlockchainService.verifyChain
      .mockResolvedValue(
        verificationResult,
      );

    const result =
      await controller.verify();

    expect(result).toEqual(
      verificationResult,
    );

    expect(
      mockBlockchainService.verifyChain,
    ).toHaveBeenCalledTimes(1);
  });
});
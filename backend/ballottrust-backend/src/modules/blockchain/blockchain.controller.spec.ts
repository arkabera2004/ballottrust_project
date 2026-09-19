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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainController],

      providers: [
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
      ],
    }).compile();

    controller = module.get<BlockchainController>(BlockchainController);
  });

  // ============================================================
  // DEFINITION
  // ============================================================

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============================================================
  // VERIFY ALL ELECTIONS (no query param)
  // ============================================================

  it('should verify all elections when no electionId is given', async () => {
    const verificationResult = {
      valid: true,
      elections: [],
    };

    mockBlockchainService.verifyChain.mockResolvedValue(verificationResult);

    const result = await controller.verify(undefined);

    expect(result).toEqual(verificationResult);

    expect(mockBlockchainService.verifyChain).toHaveBeenCalledWith(undefined);
  });

  // ============================================================
  // VERIFY SINGLE ELECTION (electionId query param)
  // ============================================================

  it('should verify a single election when electionId is given', async () => {
    const verificationResult = {
      electionId: 'election-1',
      valid: true,
      message: 'Blockchain integrity verified',
      totalVotes: 5,
    };

    mockBlockchainService.verifyChain.mockResolvedValue(verificationResult);

    const result = await controller.verify('election-1');

    expect(result).toEqual(verificationResult);

    expect(mockBlockchainService.verifyChain).toHaveBeenCalledWith(
      'election-1',
    );
  });

  // ============================================================
  // INVALID BLOCKCHAIN
  // ============================================================

  it('should return an invalid blockchain result', async () => {
    const verificationResult = {
      electionId: 'election-1',
      valid: false,
      message: 'Hash mismatch at vote vote-1',
    };

    mockBlockchainService.verifyChain.mockResolvedValue(verificationResult);

    const result = await controller.verify('election-1');

    expect(result).toEqual(verificationResult);
  });
});

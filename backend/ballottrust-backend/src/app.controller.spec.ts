import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let controller: AppController;

  const mockAppService = {
    getHello: jest.fn(),
  };

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],

      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the response from AppService', () => {
    mockAppService.getHello.mockReturnValue('Hello World!');

    const result = controller.getHello();

    expect(result).toBe('Hello World!');

    expect(mockAppService.getHello).toHaveBeenCalledTimes(1);
  });

  // ============================================================
  // HEALTH CHECK
  // ============================================================

  it('reports healthy when the database responds', async () => {
    mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await controller.health();

    expect(result).toEqual({ status: 'ok', database: 'up' });
  });

  it('reports unavailable when the database query fails', async () => {
    mockPrismaService.$queryRaw.mockRejectedValue(
      new Error('connection refused'),
    );

    await expect(controller.health()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});

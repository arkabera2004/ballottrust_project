import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { beforeEach, describe, it } from 'node:test';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

function expect<T>(actual: T) {
  return {
    toBeDefined(): void {
      if (actual === undefined) {
        throw new Error('Expected value to be defined, but received undefined');
      }
    },
  };
}


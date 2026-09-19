import { BadRequestException } from '@nestjs/common';
import { ConfigValueType } from '@prisma/client';

import { UpsertConfigService } from './upsert-config.service';

describe('UpsertConfigService', () => {
  let service: UpsertConfigService;

  const mockRepository = {
    findByKey: jest.fn(),
    upsert: jest.fn(),
  };

  const mockAudit = { log: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.findByKey.mockResolvedValue(null);
    mockRepository.upsert.mockImplementation((_k, create) =>
      Promise.resolve({ id: 'cfg-1', ...create }),
    );

    service = new UpsertConfigService(mockRepository as any, mockAudit as any);
  });

  it('rejects a value that does not match its declared type', async () => {
    await expect(
      service.execute(
        {
          key: 'security.max_attempts',
          value: 'lots',
          valueType: ConfigValueType.NUMBER,
        },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(mockRepository.upsert).not.toHaveBeenCalled();
  });

  it('audits a creation with the new value', async () => {
    await service.execute(
      { key: 'branding.name', value: 'BallotTrust' },
      'admin-1',
    );

    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CONFIG_CREATED',
        metadata: expect.objectContaining({
          newValue: 'BallotTrust',
          previousValue: null,
        }),
      }),
    );
  });

  it('audits an update with both the old and new values', async () => {
    mockRepository.findByKey.mockResolvedValue({
      id: 'cfg-1',
      value: 'Old',
      isSecret: false,
    });

    await service.execute({ key: 'branding.name', value: 'New' }, 'admin-1');

    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CONFIG_UPDATED',
        metadata: expect.objectContaining({
          previousValue: 'Old',
          newValue: 'New',
        }),
      }),
    );
  });

  it('never writes a secret value into the audit log', async () => {
    await service.execute(
      { key: 'security.api_key', value: 'super-secret', isSecret: true },
      'admin-1',
    );

    const entry = mockAudit.log.mock.calls[0][0] as {
      metadata: Record<string, unknown>;
    };

    expect(JSON.stringify(entry.metadata)).not.toContain('super-secret');
    expect(entry.metadata).toEqual(
      expect.objectContaining({ secret: true, valueChanged: true }),
    );
  });

  it('redacts a secret in the response', async () => {
    const result = await service.execute(
      { key: 'security.api_key', value: 'super-secret', isSecret: true },
      'admin-1',
    );

    expect(result.value).toBe('********');
  });

  it('keeps a setting secret when a later write omits the flag', async () => {
    mockRepository.findByKey.mockResolvedValue({
      id: 'cfg-1',
      value: 'old-secret',
      isSecret: true,
    });

    const result = await service.execute(
      { key: 'security.api_key', value: 'new-secret' },
      'admin-1',
    );

    expect(result.value).toBe('********');
    expect(JSON.stringify(mockAudit.log.mock.calls[0][0])).not.toContain(
      'new-secret',
    );
  });
});

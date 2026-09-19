import { Injectable } from '@nestjs/common';
import { AuditSeverity, ConfigCategory, ConfigValueType } from '@prisma/client';

import { SystemConfigRepository } from '../repository/system-config.repository';
import { AuditService } from '../../audit/audit.service';
import { validateConfigValue } from '../config-value.util';
import { UpsertConfigDto } from '../dto';

/**
 * Creates or overwrites one setting.
 *
 * docs/07 §16: "Critical settings are audited." Every change is logged
 * with the previous and new values — except for secrets, where only the
 * fact of the change is recorded. Writing a secret's value into the
 * audit log would defeat marking it secret in the first place.
 */
@Injectable()
export class UpsertConfigService {
  constructor(
    private readonly repository: SystemConfigRepository,

    private readonly auditService: AuditService,
  ) {}

  async execute(dto: UpsertConfigDto, updatedById: string) {
    const valueType = dto.valueType ?? ConfigValueType.STRING;

    validateConfigValue(dto.value, valueType);

    const existing = await this.repository.findByKey(dto.key);

    // A secret stays secret once marked, even if a later write omits the
    // flag — downgrading must be deliberate, not accidental.
    const isSecret = dto.isSecret ?? existing?.isSecret ?? false;

    const config = await this.repository.upsert(
      dto.key,
      {
        key: dto.key,
        value: dto.value,
        valueType,
        category: dto.category ?? ConfigCategory.GENERAL,
        description: dto.description,
        isSecret,
        updatedBy: { connect: { id: updatedById } },
      },
      {
        value: dto.value,
        valueType,
        category: dto.category ?? existing?.category,
        description: dto.description ?? existing?.description,
        isSecret,
        updatedBy: { connect: { id: updatedById } },
      },
    );

    await this.auditService.log({
      userId: updatedById,
      action: existing ? 'CONFIG_UPDATED' : 'CONFIG_CREATED',
      module: 'config',
      entityType: 'SystemConfiguration',
      entityId: config.id,
      result: 'SUCCESS',
      severity: AuditSeverity.HIGH,
      metadata: isSecret
        ? { key: dto.key, valueChanged: true, secret: true }
        : {
            key: dto.key,
            previousValue: existing?.value ?? null,
            newValue: dto.value,
          },
    });

    return {
      ...config,
      value: isSecret ? '********' : config.value,
    };
  }
}

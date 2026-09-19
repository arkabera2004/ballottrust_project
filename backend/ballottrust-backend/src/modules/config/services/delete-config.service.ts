import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditSeverity } from '@prisma/client';

import { SystemConfigRepository } from '../repository/system-config.repository';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class DeleteConfigService {
  constructor(
    private readonly repository: SystemConfigRepository,

    private readonly auditService: AuditService,
  ) {}

  async execute(key: string, deletedById: string) {
    const config = await this.repository.findByKey(key);

    if (!config) {
      throw new NotFoundException(`No configuration found for key "${key}".`);
    }

    // Seeded settings back platform behaviour. Removing one would leave
    // the code reading a missing key, so they may only be overwritten.
    if (config.isSystem) {
      throw new BadRequestException(
        `"${key}" is a system setting and cannot be deleted. Change its value instead.`,
      );
    }

    await this.repository.delete(key);

    await this.auditService.log({
      userId: deletedById,
      action: 'CONFIG_DELETED',
      module: 'config',
      entityType: 'SystemConfiguration',
      entityId: config.id,
      result: 'SUCCESS',
      severity: AuditSeverity.HIGH,
      metadata: { key },
    });

    return { success: true };
  }
}

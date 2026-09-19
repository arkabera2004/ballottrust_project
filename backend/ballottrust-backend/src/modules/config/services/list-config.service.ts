import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { SystemConfigRepository } from '../repository/system-config.repository';
import { parseConfigValue, REDACTED } from '../config-value.util';
import { QueryConfigDto } from '../dto';

@Injectable()
export class ListConfigService {
  constructor(private readonly repository: SystemConfigRepository) {}

  async execute(query: QueryConfigDto) {
    const where: Prisma.SystemConfigurationWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    const items = await this.repository.findMany(where);

    return {
      items: items.map((config) => ({
        ...config,
        // Secrets are never returned over the API, even to a super admin.
        value: config.isSecret
          ? REDACTED
          : parseConfigValue(config.value, config.valueType),
      })),
      total: items.length,
    };
  }
}

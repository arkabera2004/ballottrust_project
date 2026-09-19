import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SystemConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKey(key: string) {
    return this.prisma.systemConfiguration.findUnique({ where: { key } });
  }

  async findMany(where: Prisma.SystemConfigurationWhereInput) {
    return this.prisma.systemConfiguration.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  async upsert(
    key: string,
    create: Prisma.SystemConfigurationCreateInput,
    update: Prisma.SystemConfigurationUpdateInput,
  ) {
    return this.prisma.systemConfiguration.upsert({
      where: { key },
      create,
      update,
    });
  }

  async delete(key: string) {
    return this.prisma.systemConfiguration.delete({ where: { key } });
  }
}

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

/** History of reports produced for an election. */
@Injectable()
export class ListReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(electionId: string) {
    const items = await this.prisma.electionReport.findMany({
      where: { electionId },
      orderBy: { createdAt: 'desc' },
      include: {
        generatedBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    return { items, total: items.length };
  }
}

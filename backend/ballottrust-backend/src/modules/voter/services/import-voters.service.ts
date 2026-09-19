import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Role, VoterRegistrationSource } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { AuditService } from '../../audit/audit.service';
import { parseCsv } from '../../../common/utils';
import { ImportVotersDto } from '../dto';

/** Outcome for a single CSV row. */
export interface VoterImportRowResult {
  row: number;
  email: string;
  status: 'IMPORTED' | 'REVIVED' | 'SKIPPED' | 'FAILED';
  reason?: string;
}

export interface VoterImportResult {
  dryRun: boolean;
  total: number;
  imported: number;
  revived: number;
  skipped: number;
  failed: number;
  rows: VoterImportRowResult[];
}

/** The only column the importer requires. */
const EMAIL_HEADER = 'email';

/** Cap kept deliberately low enough to stay inside one request. */
const MAX_ROWS = 5000;

@Injectable()
export class ImportVotersService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly repository: VoterRegistrationRepository,

    private readonly auditService: AuditService,
  ) {}

  async execute(
    file: Express.Multer.File,
    dto: ImportVotersDto,
    importedById: string,
  ): Promise<VoterImportResult> {
    if (!file) {
      throw new BadRequestException('No CSV file uploaded.');
    }

    const election = await this.prisma.election.findFirst({
      where: { id: dto.electionId, deletedAt: null },
    });

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    const rows = parseCsv(file.buffer.toString('utf8'));

    if (rows.length === 0) {
      throw new BadRequestException('The CSV file is empty.');
    }

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const emailIndex = headers.indexOf(EMAIL_HEADER);

    if (emailIndex === -1) {
      throw new BadRequestException(
        `The CSV file must contain an "${EMAIL_HEADER}" column.`,
      );
    }

    const notesIndex = headers.indexOf('notes');
    const dataRows = rows.slice(1);

    if (dataRows.length > MAX_ROWS) {
      throw new BadRequestException(
        `The CSV file contains ${dataRows.length} rows, which exceeds the ${MAX_ROWS}-row limit. Split the file and import in batches.`,
      );
    }

    const dryRun = dto.dryRun === true;
    const results: VoterImportRowResult[] = [];

    // Emails already claimed earlier in this same file — a duplicate row
    // must be reported, not silently applied twice.
    const seen = new Set<string>();

    for (let i = 0; i < dataRows.length; i++) {
      const rowNumber = i + 2; // 1-indexed, and row 1 is the header.
      const email = (dataRows[i][emailIndex] ?? '').trim().toLowerCase();
      const notes =
        notesIndex >= 0 ? (dataRows[i][notesIndex] ?? '').trim() : undefined;

      if (!email) {
        results.push({
          row: rowNumber,
          email: '',
          status: 'FAILED',
          reason: 'Missing email address.',
        });
        continue;
      }

      if (seen.has(email)) {
        results.push({
          row: rowNumber,
          email,
          status: 'SKIPPED',
          reason: 'Duplicate row within the uploaded file.',
        });
        continue;
      }

      seen.add(email);

      const user = await this.prisma.user.findFirst({
        where: { email, deletedAt: null },
      });

      if (!user) {
        results.push({
          row: rowNumber,
          email,
          status: 'FAILED',
          reason: 'No user account exists with this email address.',
        });
        continue;
      }

      if (user.role !== Role.VOTER) {
        results.push({
          row: rowNumber,
          email,
          status: 'FAILED',
          reason: `Account has role ${user.role}, not VOTER.`,
        });
        continue;
      }

      const existing =
        await this.repository.findByUserAndElectionIncludingDeleted(
          user.id,
          dto.electionId,
        );

      if (existing && !existing.deletedAt) {
        results.push({
          row: rowNumber,
          email,
          status: 'SKIPPED',
          reason: 'Already registered for this election.',
        });
        continue;
      }

      if (dryRun) {
        results.push({
          row: rowNumber,
          email,
          status: existing ? 'REVIVED' : 'IMPORTED',
        });
        continue;
      }

      if (existing) {
        await this.repository.update(existing.id, {
          deletedAt: null,
          status: 'PENDING',
          source: VoterRegistrationSource.IMPORT,
          registeredAt: new Date(),
          notes: notes || null,
        });

        results.push({ row: rowNumber, email, status: 'REVIVED' });
        continue;
      }

      await this.repository.create({
        user: { connect: { id: user.id } },
        election: { connect: { id: dto.electionId } },
        source: VoterRegistrationSource.IMPORT,
        notes: notes || undefined,
      });

      results.push({ row: rowNumber, email, status: 'IMPORTED' });
    }

    const summary: VoterImportResult = {
      dryRun,
      total: dataRows.length,
      imported: results.filter((r) => r.status === 'IMPORTED').length,
      revived: results.filter((r) => r.status === 'REVIVED').length,
      skipped: results.filter((r) => r.status === 'SKIPPED').length,
      failed: results.filter((r) => r.status === 'FAILED').length,
      rows: results,
    };

    // A dry run changes nothing, so it is not an auditable event.
    if (!dryRun) {
      await this.auditService.log({
        userId: importedById,
        action: 'VOTER_ROLL_IMPORTED',
        module: 'voter',
        entityType: 'Election',
        entityId: dto.electionId,
        result: summary.failed > 0 ? 'FAILURE' : 'SUCCESS',
        metadata: {
          total: summary.total,
          imported: summary.imported,
          revived: summary.revived,
          skipped: summary.skipped,
          failed: summary.failed,
        },
      });
    }

    return summary;
  }
}

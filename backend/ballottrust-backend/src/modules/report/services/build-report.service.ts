import { Injectable, NotFoundException } from '@nestjs/common';
import { CandidateStatus, VoterRegistrationStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { toCsv, type CsvCell } from '../../../common/utils';
import { ReportFormat, ReportType } from '../dto';

export interface BuiltReport {
  reportType: ReportType;
  format: ReportFormat;
  generatedAt: Date;
  /** Structured payload for JSON, or the serialised document for CSV. */
  data: unknown;
  rowCount: number;
}

/**
 * Computes report contents.
 *
 * Reports are generated on demand rather than being pre-materialised:
 * the underlying counts are cheap, and a stale cached report of an
 * election result is worse than a slightly slower fresh one.
 */
@Injectable()
export class BuildReportService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    electionId: string,
    reportType: ReportType,
    format: ReportFormat = ReportFormat.JSON,
  ): Promise<BuiltReport> {
    const election = await this.prisma.election.findFirst({
      where: { id: electionId, deletedAt: null },
      select: {
        id: true,
        title: true,
        electionCode: true,
        electionType: true,
        status: true,
        startDate: true,
        endDate: true,
        resultDate: true,
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found.');
    }

    const generatedAt = new Date();

    switch (reportType) {
      case ReportType.TURNOUT:
        return this.finish(
          reportType,
          format,
          generatedAt,
          await this.turnout(electionId, election),
          ['metric', 'value'],
        );

      case ReportType.CANDIDATE_RESULTS:
        return this.finish(
          reportType,
          format,
          generatedAt,
          await this.candidateResults(electionId),
          [
            'candidateId',
            'candidateNumber',
            'name',
            'party',
            'votes',
            'percentage',
          ],
        );

      case ReportType.VOTER_ROLL:
        return this.finish(
          reportType,
          format,
          generatedAt,
          await this.voterRoll(electionId),
          ['registrationId', 'name', 'email', 'status', 'registeredAt'],
        );

      case ReportType.AUDIT_TRAIL:
        return this.finish(
          reportType,
          format,
          generatedAt,
          await this.auditTrail(electionId),
          ['createdAt', 'action', 'module', 'entityType', 'entityId', 'result'],
        );

      case ReportType.ELECTION_SUMMARY:
      default:
        return this.finish(
          reportType,
          format,
          generatedAt,
          await this.summary(electionId, election),
          ['metric', 'value'],
        );
    }
  }

  // ==========================================
  // Report bodies
  // ==========================================

  private async summary(electionId: string, election: Record<string, unknown>) {
    const [candidates, votes, registrations] = await this.prisma.$transaction([
      this.prisma.candidate.count({
        where: {
          electionId,
          deletedAt: null,
          status: CandidateStatus.APPROVED,
        },
      }),
      this.prisma.vote.count({ where: { electionId } }),
      this.prisma.voterRegistration.count({
        where: { electionId, deletedAt: null },
      }),
    ]);

    return {
      election,
      approvedCandidates: candidates,
      totalVotes: votes,
      totalRegistrations: registrations,
    };
  }

  private async turnout(electionId: string, election: Record<string, unknown>) {
    const [eligible, votes] = await this.prisma.$transaction([
      this.prisma.voterRegistration.count({
        where: {
          electionId,
          deletedAt: null,
          status: VoterRegistrationStatus.APPROVED,
        },
      }),
      this.prisma.vote.count({ where: { electionId } }),
    ]);

    return {
      election,
      eligibleVoters: eligible,
      votesCast: votes,
      turnoutPercentage:
        eligible === 0 ? 0 : Number(((votes / eligible) * 100).toFixed(2)),
    };
  }

  private async candidateResults(electionId: string) {
    const candidates = await this.prisma.candidate.findMany({
      where: { electionId, deletedAt: null, status: CandidateStatus.APPROVED },
      select: {
        id: true,
        candidateNumber: true,
        user: { select: { fullName: true } },
        party: { select: { name: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { ballotOrder: 'asc' },
    });

    const total = candidates.reduce((sum, c) => sum + c._count.votes, 0);

    return candidates
      .map((c) => ({
        candidateId: c.id,
        candidateNumber: c.candidateNumber,
        name: c.user.fullName,
        party: c.party?.name ?? null,
        votes: c._count.votes,
        percentage:
          total === 0 ? 0 : Number(((c._count.votes / total) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.votes - a.votes);
  }

  private async voterRoll(electionId: string) {
    const registrations = await this.prisma.voterRegistration.findMany({
      where: { electionId, deletedAt: null },
      select: {
        id: true,
        status: true,
        registeredAt: true,
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { registeredAt: 'asc' },
    });

    return registrations.map((r) => ({
      registrationId: r.id,
      name: r.user.fullName,
      email: r.user.email,
      status: r.status,
      registeredAt: r.registeredAt,
    }));
  }

  private async auditTrail(electionId: string) {
    const entries = await this.prisma.auditLog.findMany({
      where: {
        OR: [
          { entityId: electionId },
          { metadata: { path: ['electionId'], equals: electionId } },
        ],
      },
      select: {
        createdAt: true,
        action: true,
        module: true,
        entityType: true,
        entityId: true,
        result: true,
      },
      orderBy: { createdAt: 'asc' },
      // Audit trails can be long; a report is a snapshot, not an export
      // of the whole chain. The audit module serves the full history.
      take: 10_000,
    });

    return entries;
  }

  // ==========================================
  // Serialisation
  // ==========================================

  private finish(
    reportType: ReportType,
    format: ReportFormat,
    generatedAt: Date,
    payload: unknown,
    headers: string[],
  ): BuiltReport {
    const rows = Array.isArray(payload) ? payload : [payload];

    if (format !== ReportFormat.CSV) {
      return {
        reportType,
        format: ReportFormat.JSON,
        generatedAt,
        data: payload,
        rowCount: rows.length,
      };
    }

    // A non-array payload is a set of metrics, which reads better as
    // key/value rows than as one very wide row.
    const csv = Array.isArray(payload)
      ? toCsv(
          headers,
          payload.map((row) =>
            headers.map((h) => (row as Record<string, CsvCell>)[h] ?? null),
          ),
        )
      : toCsv(
          ['metric', 'value'],
          Object.entries(payload as Record<string, unknown>).map(([k, v]) => [
            k,
            typeof v === 'object' && v !== null
              ? JSON.stringify(v)
              : (v as CsvCell),
          ]),
        );

    return {
      reportType,
      format: ReportFormat.CSV,
      generatedAt,
      data: csv,
      rowCount: rows.length,
    };
  }
}

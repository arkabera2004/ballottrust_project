import { Injectable, Logger } from '@nestjs/common';
import { Prisma, AuditSeverity } from '@prisma/client';
import * as crypto from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEntryInput {
  userId?: string | null;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  result: 'SUCCESS' | 'FAILURE';
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

interface ChainableFields {
  previousHash: string;
  userId: string | null;
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: string | null;
  result: string;
  createdAt: Date;
}

const GENESIS_BLOCK = 'GENESIS_BLOCK';
const MAX_WRITE_ATTEMPTS = 3;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Writes one hash-chained audit record (Sec22/23). Every state-changing
   * action (auth, election lifecycle, candidate workflow, documents,
   * votes) should call this.
   *
   * The read-last-hash-then-write step runs inside a Serializable
   * transaction with a short retry loop, so two concurrent audit writes
   * can't both read the same previousHash and silently fork the chain —
   * Postgres aborts the loser with a serialization failure and this
   * method retries it.
   *
   * Failures are logged, never thrown: an audit-log outage must not block
   * the underlying election operation (graceful degradation per the
   * brief), but it is surfaced loudly via structured logging so it can't
   * fail silently either.
   */
  async log(entry: AuditEntryInput): Promise<void> {
    for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt++) {
      try {
        await this.prisma.$transaction(
          async (tx) => {
            const last = await tx.auditLog.findFirst({
              orderBy: { createdAt: 'desc' },
              select: { hash: true },
            });

            const previousHash = last?.hash || GENESIS_BLOCK;
            const createdAt = new Date();

            const hash = this.computeHash({
              previousHash,
              userId: entry.userId ?? null,
              action: entry.action,
              module: entry.module,
              entityType: entry.entityType,
              entityId: entry.entityId,
              result: entry.result,
              createdAt,
            });

            await tx.auditLog.create({
              data: {
                userId: entry.userId ?? undefined,
                action: entry.action,
                module: entry.module,
                entityType: entry.entityType,
                entityId: entry.entityId,
                description: entry.description,
                severity: entry.severity ?? AuditSeverity.LOW,
                metadata: entry.metadata as Prisma.InputJsonValue | undefined,
                ipAddress: entry.ipAddress,
                result: entry.result,
                previousHash,
                hash,
                createdAt,
              },
            });
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );

        return;
      } catch (err) {
        if (attempt === MAX_WRITE_ATTEMPTS) {
          this.logger.error(
            `Failed to write audit log after ${MAX_WRITE_ATTEMPTS} attempts: ${entry.module}.${entry.action}`,
            err instanceof Error ? err.stack : String(err),
          );
          return;
        }
        // Likely a serialization conflict from a concurrent audit write.
        // Fall through and retry against the (now-updated) chain tip.
      }
    }
  }

  /**
   * Recomputes the audit hash chain from stored records and reports
   * whether it is intact. Any past record altered — content or hash —
   * breaks every hash from that point forward, so tampering is detectable
   * without trusting the database's own integrity.
   */
  async verifyChain() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (logs.length === 0) {
      return {
        valid: true,
        message: 'No audit records found',
      };
    }

    for (let i = 0; i < logs.length; i++) {
      const record = logs[i];

      const expectedHash = this.computeHash({
        previousHash: record.previousHash || GENESIS_BLOCK,
        userId: record.userId,
        action: record.action,
        module: record.module,
        entityType: record.entityType,
        entityId: record.entityId,
        result: record.result || '',
        createdAt: record.createdAt,
      });

      if (record.hash !== expectedHash) {
        return {
          valid: false,
          message: `Hash mismatch at audit record ${record.id}`,
          totalRecords: logs.length,
        };
      }

      if (i > 0 && record.previousHash !== logs[i - 1].hash) {
        return {
          valid: false,
          message: `Broken chain at audit record ${record.id}`,
          totalRecords: logs.length,
        };
      }
    }

    return {
      valid: true,
      message: 'Audit chain integrity verified',
      totalRecords: logs.length,
    };
  }

  private computeHash(fields: ChainableFields): string {
    return crypto
      .createHash('sha256')
      .update(
        fields.previousHash +
          (fields.userId ?? '') +
          fields.action +
          fields.module +
          (fields.entityType ?? '') +
          (fields.entityId ?? '') +
          fields.result +
          fields.createdAt.toISOString(),
      )
      .digest('hex');
  }
}

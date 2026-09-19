import { Injectable } from '@nestjs/common';

import { VoterRegistrationRepository } from '../repository/voter-registration.repository';
import { AuditService } from '../../audit/audit.service';
import { toCsv } from '../../../common/utils';
import { QueryVoterDto } from '../dto';
import { buildVoterRegistrationWhere } from './list-voters.service';

const HEADERS = [
  'registrationId',
  'fullName',
  'email',
  'registrationNumber',
  'department',
  'course',
  'year',
  'semester',
  'election',
  'status',
  'source',
  'registeredAt',
  'verifiedAt',
  'approvedAt',
];

@Injectable()
export class ExportVotersService {
  constructor(
    private readonly repository: VoterRegistrationRepository,

    private readonly auditService: AuditService,
  ) {}

  async execute(query: QueryVoterDto, exportedById: string) {
    const where = buildVoterRegistrationWhere(query);

    const registrations = await this.repository.findAllForExport(where);

    const csv = toCsv(
      HEADERS,
      registrations.map((r) => [
        r.id,
        r.user.fullName,
        r.user.email,
        r.user.registrationNumber,
        r.user.department,
        r.user.course,
        r.user.year,
        r.user.semester,
        r.election.title,
        r.status,
        r.source,
        r.registeredAt,
        r.verifiedAt,
        r.approvedAt,
      ]),
    );

    await this.auditService.log({
      userId: exportedById,
      action: 'VOTER_ROLL_EXPORTED',
      module: 'voter',
      entityType: 'Election',
      entityId: query.electionId,
      result: 'SUCCESS',
      metadata: { rowCount: registrations.length },
    });

    return { csv, rowCount: registrations.length };
  }
}

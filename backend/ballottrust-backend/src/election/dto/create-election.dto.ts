import { ElectionType } from '@prisma/client';

export class CreateElectionDto {
  title!: string;

  electionCode!: string;

  electionType!: ElectionType;

  description?: string;

  startDate!: Date;

  endDate!: Date;
}
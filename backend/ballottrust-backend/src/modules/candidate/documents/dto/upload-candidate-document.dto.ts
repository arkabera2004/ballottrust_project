import { IsEnum } from 'class-validator';

import { CandidateDocumentType } from '@prisma/client';

export class UploadCandidateDocumentDto {
  @IsEnum(CandidateDocumentType)
  documentType!: CandidateDocumentType;
}

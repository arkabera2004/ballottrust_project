import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CandidateStatus,
} from '@prisma/client';

import * as fs from 'fs';
import * as path from 'path';

import {
  CandidateRepository,
} from '../../repository/candidate.repository';

import {
  CandidateDocumentRepository,
} from '../candidate-document.repository';

import {
  UploadCandidateDocumentDto,
} from '../dto/upload-candidate-document.dto';

@Injectable()
export class UploadCandidateDocumentService {
  constructor(
    private readonly candidateRepository:
      CandidateRepository,

    private readonly candidateDocumentRepository:
      CandidateDocumentRepository,
  ) {}

  async execute(
    candidateId: string,
    userId: string,
    dto: UploadCandidateDocumentDto,
    file: Express.Multer.File,
  ) {
    // ==========================================
    // 1. Validate File
    // ==========================================

    if (!file) {
      throw new BadRequestException(
        'Candidate document file is required.',
      );
    }

    // ==========================================
    // 2. Find Candidate
    // ==========================================

    const candidate =
      await this.candidateRepository.findById(
        candidateId,
      );

    if (!candidate) {
      this.deleteUploadedFile(file);

      throw new NotFoundException(
        'Candidate not found.',
      );
    }

    // ==========================================
    // 3. Validate Ownership
    // ==========================================

    if (candidate.userId !== userId) {
      this.deleteUploadedFile(file);

      throw new ForbiddenException(
        'You can only upload documents for your own candidacy.',
      );
    }

    // ==========================================
    // 4. Validate Candidate Lifecycle
    // ==========================================

    const editableStatuses: CandidateStatus[] = [
      CandidateStatus.PENDING,
      CandidateStatus.VERIFIED,
    ];

    if (
      !editableStatuses.includes(
        candidate.status,
      )
    ) {
      this.deleteUploadedFile(file);

      throw new BadRequestException(
        'Candidate documents cannot be uploaded in the current status.',
      );
    }

    // ==========================================
    // 5. Prevent Duplicate Active Document
    // ==========================================

    const existingDocument =
      await this.candidateDocumentRepository
        .findActiveByType(
          candidateId,
          dto.documentType,
        );

    if (existingDocument) {
      this.deleteUploadedFile(file);

      throw new ConflictException(
        'An active document of this type already exists. Use the document replacement workflow instead.',
      );
    }

    // ==========================================
    // 6. Persist Document Metadata
    // ==========================================

    try {
      return await this.candidateDocumentRepository.create({
        candidate: {
          connect: {
            id: candidateId,
          },
        },

        documentType:
          dto.documentType,

        originalFileName:
          file.originalname,

        fileUrl:
          `/uploads/${file.filename}`,

        mimeType:
          file.mimetype,

        fileSize:
          file.size,
      });
    } catch (error) {
      // The physical file already exists at this point.
      // Remove it if database registration fails.
      this.deleteUploadedFile(file);

      throw error;
    }
  }

  // ==========================================
  // Remove Orphaned Uploaded File
  // ==========================================

  private deleteUploadedFile(
    file: Express.Multer.File,
  ): void {
    if (!file) {
      return;
    }

    const filePath =
      file.path ||
      path.join(
        process.cwd(),
        'uploads',
        file.filename,
      );

    try {
      if (
        filePath &&
        fs.existsSync(filePath)
      ) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Cleanup failure must not replace
      // the original application exception.
    }
  }
}
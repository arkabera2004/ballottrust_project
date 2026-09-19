import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CandidateStatus } from '@prisma/client';

import * as fs from 'fs';
import * as path from 'path';

import { CandidateDocumentRepository } from '../candidate-document.repository';

@Injectable()
export class ReplaceCandidateDocumentService {
  constructor(
    private readonly candidateDocumentRepository: CandidateDocumentRepository,
  ) {}

  async execute(
    candidateId: string,
    documentId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    // ==========================================
    // 1. Validate File
    // ==========================================

    if (!file) {
      throw new BadRequestException('Replacement document file is required.');
    }

    // ==========================================
    // 2. Find Existing Document
    // ==========================================

    const existingDocument =
      await this.candidateDocumentRepository.findById(documentId);

    if (!existingDocument) {
      this.deleteUploadedFile(file);

      throw new NotFoundException('Candidate document not found.');
    }

    // ==========================================
    // 3. Validate Candidate Relationship
    // ==========================================

    if (existingDocument.candidateId !== candidateId) {
      this.deleteUploadedFile(file);

      throw new NotFoundException('Candidate document not found.');
    }

    // ==========================================
    // 4. Validate Ownership
    // ==========================================

    if (existingDocument.candidate.userId !== userId) {
      this.deleteUploadedFile(file);

      throw new ForbiddenException(
        'You can only replace your own candidate documents.',
      );
    }

    // ==========================================
    // 5. Validate Active Document
    // ==========================================

    if (existingDocument.replacedAt !== null) {
      this.deleteUploadedFile(file);

      throw new BadRequestException(
        'This candidate document has already been replaced.',
      );
    }

    // ==========================================
    // 6. Validate Candidate Lifecycle
    // ==========================================

    const editableStatuses: CandidateStatus[] = [
      CandidateStatus.PENDING,
      CandidateStatus.VERIFIED,
    ];

    if (!editableStatuses.includes(existingDocument.candidate.status)) {
      this.deleteUploadedFile(file);

      throw new BadRequestException(
        'Candidate documents cannot be replaced in the current candidate status.',
      );
    }

    // ==========================================
    // 7. Replace Document Atomically
    // ==========================================

    try {
      return await this.candidateDocumentRepository.replaceDocument(
        existingDocument.id,
        {
          candidate: {
            connect: {
              id: candidateId,
            },
          },

          documentType: existingDocument.documentType,

          originalFileName: file.originalname,

          fileUrl: `/uploads/${file.filename}`,

          mimeType: file.mimetype,

          fileSize: file.size,
        },
      );
    } catch (error) {
      // Database replacement failed.
      // Remove only the newly uploaded file.
      this.deleteUploadedFile(file);

      throw error;
    }
  }

  // ==========================================
  // Remove Failed Replacement File
  // ==========================================

  private deleteUploadedFile(file: Express.Multer.File): void {
    const filePath =
      file.path || path.join(process.cwd(), 'uploads', file.filename);

    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Cleanup failure must not hide
      // the original application error.
    }
  }
}

import {
  describe,
  it,
  expect,
  jest,
} from '@jest/globals';

import {
  CandidateDocumentStatus,
} from '@prisma/client';

import {
  VerifyCandidateDocumentService,
} from '../documents/services/verify-candidate-document.service';

import {
  CandidateDocumentRepository,
} from '../documents/candidate-document.repository';

import {
  CandidateDocumentStatusValidator,
} from '../documents/validators/candidate-document-status.validator';

import { AuditService } from '../../audit/audit.service';

const noopAuditService = {
  log: jest.fn(async (): Promise<void> => undefined),
} as unknown as AuditService;

describe(
  'VerifyCandidateDocumentService',
  () => {

    // ======================================================
    // 1. Missing Document
    // ======================================================

    it(
      'should reject a missing document',
      async () => {

        const findById = jest.fn(
          async (
            _documentId: string,
          ): Promise<any> => null,
        );

        const verifyDocument = jest.fn(
          async (
            _documentId: string,
            _reviewerId: string,
          ): Promise<any> => null,
        );

        const validateTransition = jest.fn(
          (
            _currentStatus: CandidateDocumentStatus,
            _targetStatus: CandidateDocumentStatus,
          ): void => undefined,
        );

        const repository = {
          findById,
          verifyDocument,
        };

        const statusValidator = {
          validateTransition,
        };

        const service =
          new VerifyCandidateDocumentService(
            repository as unknown as CandidateDocumentRepository,
            statusValidator as unknown as CandidateDocumentStatusValidator,
            noopAuditService,
          );

        await expect(
          service.execute(
            'candidate-1',
            'document-1',
            'admin-1',
          ),
        ).rejects.toThrow(
          'Candidate document not found.',
        );

        expect(
          findById,
        ).toHaveBeenCalledWith(
          'document-1',
        );

        expect(
          validateTransition,
        ).not.toHaveBeenCalled();

        expect(
          verifyDocument,
        ).not.toHaveBeenCalled();
      },
    );

    // ======================================================
    // 2. Service Definition
    // ======================================================

    it(
      'should be defined',
      () => {

        const service =
          new VerifyCandidateDocumentService(
            {} as CandidateDocumentRepository,

            {} as CandidateDocumentStatusValidator,
            {} as AuditService,
          );

        expect(
          service,
        ).toBeDefined();
      },
    );

    // ======================================================
    // 3. Successful Verification
    // ======================================================

    it(
      'should verify a valid candidate document',
      async () => {

        const document = {
          id: 'document-1',

          candidateId:
            'candidate-1',

          status:
            CandidateDocumentStatus.PENDING,

          replacedAt: null,

          deletedAt: null,
        };

        const verifiedDocument = {
          ...document,

          status:
            CandidateDocumentStatus.VERIFIED,
        };

        const findById = jest.fn(
          async (
            _documentId: string,
          ): Promise<any> => document,
        );

        const verifyDocument = jest.fn(
          async (
            _documentId: string,
            _reviewerId: string,
          ): Promise<any> =>
            verifiedDocument,
        );

        const validateTransition = jest.fn(
          (
            _currentStatus: CandidateDocumentStatus,
            _targetStatus: CandidateDocumentStatus,
          ): void => undefined,
        );

        const repository = {
          findById,
          verifyDocument,
        };

        const statusValidator = {
          validateTransition,
        };

        const service =
          new VerifyCandidateDocumentService(
            repository as unknown as CandidateDocumentRepository,

            statusValidator as unknown as CandidateDocumentStatusValidator,
            noopAuditService,
          );

        const result =
          await service.execute(
            'candidate-1',
            'document-1',
            'admin-1',
          );

        expect(
          result,
        ).toEqual(
          verifiedDocument,
        );

        expect(
          validateTransition,
        ).toHaveBeenCalledWith(
          CandidateDocumentStatus.PENDING,

          CandidateDocumentStatus.VERIFIED,
        );

        expect(
          verifyDocument,
        ).toHaveBeenCalledWith(
          'document-1',
          'admin-1',
        );
      },
    );

    // ======================================================
    // 4. Candidate Relationship
    // ======================================================

    it(
      'should reject a document belonging to another candidate',
      async () => {

        const document = {
          id: 'document-1',

          candidateId:
            'candidate-2',

          status:
            CandidateDocumentStatus.PENDING,

          replacedAt: null,

          deletedAt: null,
        };

        const findById = jest.fn(
          async (
            _documentId: string,
          ): Promise<any> => document,
        );

        const verifyDocument = jest.fn(
          async (
            _documentId: string,
            _reviewerId: string,
          ): Promise<any> => null,
        );

        const validateTransition = jest.fn(
          (
            _currentStatus: CandidateDocumentStatus,
            _targetStatus: CandidateDocumentStatus,
          ): void => undefined,
        );

        const repository = {
          findById,
          verifyDocument,
        };

        const statusValidator = {
          validateTransition,
        };

        const service =
          new VerifyCandidateDocumentService(
            repository as unknown as CandidateDocumentRepository,

            statusValidator as unknown as CandidateDocumentStatusValidator,
            noopAuditService,
          );

        await expect(
          service.execute(
            'candidate-1',
            'document-1',
            'admin-1',
          ),
        ).rejects.toThrow(
          'Candidate document not found.',
        );

        expect(
          validateTransition,
        ).not.toHaveBeenCalled();

        expect(
          verifyDocument,
        ).not.toHaveBeenCalled();
      },
    );

    // ======================================================
    // 5. Replaced Document
    // ======================================================

    it(
      'should reject a replaced document',
      async () => {

        const document = {
          id: 'document-1',

          candidateId:
            'candidate-1',

          status:
            CandidateDocumentStatus.PENDING,

          replacedAt:
            new Date(),

          deletedAt: null,
        };

        const findById = jest.fn(
          async (
            _documentId: string,
          ): Promise<any> => document,
        );

        const verifyDocument = jest.fn(
          async (
            _documentId: string,
            _reviewerId: string,
          ): Promise<any> => null,
        );

        const validateTransition = jest.fn(
          (
            _currentStatus: CandidateDocumentStatus,
            _targetStatus: CandidateDocumentStatus,
          ): void => undefined,
        );

        const repository = {
          findById,
          verifyDocument,
        };

        const statusValidator = {
          validateTransition,
        };

        const service =
          new VerifyCandidateDocumentService(
            repository as unknown as CandidateDocumentRepository,

            statusValidator as unknown as CandidateDocumentStatusValidator,
            noopAuditService,
          );

        await expect(
          service.execute(
            'candidate-1',
            'document-1',
            'admin-1',
          ),
        ).rejects.toThrow(
          'Replaced candidate documents cannot be verified.',
        );

        expect(
          validateTransition,
        ).not.toHaveBeenCalled();

        expect(
          verifyDocument,
        ).not.toHaveBeenCalled();
      },
    );

    // ======================================================
    // 6. Deleted Document
    // ======================================================

    it(
      'should reject a deleted document',
      async () => {

        const document = {
          id: 'document-1',

          candidateId:
            'candidate-1',

          status:
            CandidateDocumentStatus.PENDING,

          replacedAt: null,

          deletedAt:
            new Date(),
        };

        const findById = jest.fn(
          async (
            _documentId: string,
          ): Promise<any> => document,
        );

        const verifyDocument = jest.fn(
          async (
            _documentId: string,
            _reviewerId: string,
          ): Promise<any> => null,
        );

        const validateTransition = jest.fn(
          (
            _currentStatus: CandidateDocumentStatus,
            _targetStatus: CandidateDocumentStatus,
          ): void => undefined,
        );

        const repository = {
          findById,
          verifyDocument,
        };

        const statusValidator = {
          validateTransition,
        };

        const service =
          new VerifyCandidateDocumentService(
            repository as unknown as CandidateDocumentRepository,

            statusValidator as unknown as CandidateDocumentStatusValidator,
            noopAuditService,
          );

        await expect(
          service.execute(
            'candidate-1',
            'document-1',
            'admin-1',
          ),
        ).rejects.toThrow(
          'Deleted candidate documents cannot be verified.',
        );

        expect(
          validateTransition,
        ).not.toHaveBeenCalled();

        expect(
          verifyDocument,
        ).not.toHaveBeenCalled();
      },
    );
  },
);

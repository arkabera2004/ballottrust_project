import {
  describe,
  it,
  beforeEach,
  expect,
  jest,
} from '@jest/globals';

import { ReplaceCandidateDocumentService } from '../documents/services/replace-candidate-document.service';

import { CandidateDocumentRepository } from '../documents/candidate-document.repository';
import { Readable } from 'stream';

describe('ReplaceCandidateDocumentService', () => {
  let service: ReplaceCandidateDocumentService;

  const findById =
    jest.fn<
      (documentId: string) => Promise<any>
    >();

  const replaceDocument =
    jest.fn<
      (
        documentId: string,
        data: any,
      ) => Promise<any>
    >();

  const candidateDocumentRepository = {
    findById,
    replaceDocument,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service =
      new ReplaceCandidateDocumentService(
        candidateDocumentRepository as unknown as CandidateDocumentRepository,
      );
  });

  // ======================================================
  // 1. Missing Document
  // ======================================================

  it(
    'should reject when the original document does not exist',
    async () => {
      findById.mockResolvedValue(null);

      await expect(
        service.execute(
          'candidate-1',
          'document-1',
          'new-document-url',
          {
            fieldname: '',
            originalname: '',
            encoding: '',
            mimetype: '',
            size: 0,
            stream: new Readable,
            destination: '',
            filename: '',
            path: '',
            buffer: Buffer.alloc(0)
          },
        ),
      ).rejects.toThrow(
        'Candidate document not found.',
      );

      expect(findById).toHaveBeenCalledWith(
        'document-1',
      );

      expect(
        replaceDocument,
      ).not.toHaveBeenCalled();
    },
  );

  // ======================================================
  // 2. Service Definition
  // ======================================================

  it(
    'should be defined',
    () => {
      expect(service).toBeDefined();
    },
  );
});
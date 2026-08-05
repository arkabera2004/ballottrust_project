import {
  CandidateDocumentType,
} from '@prisma/client';

// ==========================================
// Required Candidate Documents
// ==========================================

export const REQUIRED_CANDIDATE_DOCUMENTS:
  readonly CandidateDocumentType[] = [

    CandidateDocumentType.IDENTITY_PROOF,

    CandidateDocumentType.STUDENT_ID,

    CandidateDocumentType.ELIGIBILITY_PROOF,

    CandidateDocumentType.NOMINATION_FORM,
  ];

// ==========================================
// Optional Candidate Documents
// ==========================================

export const OPTIONAL_CANDIDATE_DOCUMENTS:
  readonly CandidateDocumentType[] = [

    CandidateDocumentType.SUPPORTING_DOCUMENT,

    CandidateDocumentType.OTHER,
  ];
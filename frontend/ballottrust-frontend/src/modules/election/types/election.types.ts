// ======================================================
// Constants
// ======================================================

export const ElectionStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED',
  ACTIVE: 'ACTIVE',
  VOTING_CLOSED: 'VOTING_CLOSED',
  RESULT_PUBLISHED: 'RESULT_PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ElectionStatus =
  (typeof ElectionStatus)[keyof typeof ElectionStatus];

export const ElectionType = {
  STUDENT_COUNCIL: 'STUDENT_COUNCIL',
  CLASS_REPRESENTATIVE: 'CLASS_REPRESENTATIVE',
  CLUB: 'CLUB',
  FACULTY: 'FACULTY',
  DEPARTMENT: 'DEPARTMENT',
  UNIVERSITY: 'UNIVERSITY',
  CUSTOM: 'CUSTOM',
} as const;

export type ElectionType =
  (typeof ElectionType)[keyof typeof ElectionType];

export const ResultVisibility = {
  IMMEDIATELY: 'IMMEDIATELY',
  AFTER_CLOSURE: 'AFTER_CLOSURE',
  MANUAL: 'MANUAL',
} as const;

export type ResultVisibility =
  (typeof ResultVisibility)[keyof typeof ResultVisibility];

// ======================================================
// Entity
// ======================================================

export interface Election {
  id: string;

  title: string;
  electionCode: string;
  description?: string | null;

  electionType: ElectionType;
  status: ElectionStatus;

  registrationStart?: string | null;
  registrationEnd?: string | null;

  nominationStart?: string | null;
  nominationEnd?: string | null;

  campaignStart?: string | null;
  campaignEnd?: string | null;

  startDate: string;
  endDate: string;

  resultDate?: string | null;

  publishedAt?: string | null;
  approvedAt?: string | null;
  closedAt?: string | null;
  deletedAt?: string | null;

  candidateLimit: number;
  maximumVotes: number;

  allowRevote: boolean;

  blockchainEnabled: boolean;
  auditEnabled: boolean;

  autoPublish: boolean;
  autoArchive: boolean;

  resultVisibility: ResultVisibility;

  banner?: string | null;
  logo?: string | null;

  createdById?: string | null;
  approvedById?: string | null;
  publishedById?: string | null;

  createdAt: string;
  updatedAt: string;
}

// ======================================================
// DTOs
// ======================================================

export interface CreateElectionDto {
  title: string;

  description?: string;

  electionType: ElectionType;

  registrationStart?: string;
  registrationEnd?: string;

  nominationStart?: string;
  nominationEnd?: string;

  campaignStart?: string;
  campaignEnd?: string;

  startDate: string;
  endDate: string;

  candidateLimit: number;
  maximumVotes: number;

  allowRevote: boolean;

  blockchainEnabled: boolean;
  auditEnabled: boolean;

  autoPublish: boolean;
  autoArchive: boolean;

  resultVisibility: ResultVisibility;
}

export interface UpdateElectionDto
  extends Partial<CreateElectionDto> {}

export interface QueryElectionDto {
  search?: string;

  status?: ElectionStatus;

  type?: ElectionType;

  page?: number;

  limit?: number;
}

export interface ElectionListResponse {
  data: Election[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}
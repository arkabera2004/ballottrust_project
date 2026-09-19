import type { PaginationMeta, UserSummary } from '../../../types/api.types';

export const VoterRegistrationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type VoterRegistrationStatus =
  (typeof VoterRegistrationStatus)[keyof typeof VoterRegistrationStatus];

export const VoterRegistrationSource = {
  SELF: 'SELF',
  IMPORT: 'IMPORT',
  ADMIN: 'ADMIN',
} as const;

export type VoterRegistrationSource =
  (typeof VoterRegistrationSource)[keyof typeof VoterRegistrationSource];

export interface VoterRegistration {
  id: string;
  userId: string;
  electionId: string;
  status: VoterRegistrationStatus;
  source: VoterRegistrationSource;
  registeredAt: string;
  verifiedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  user: UserSummary & {
    registrationNumber?: string | null;
    department?: string | null;
    course?: string | null;
    year?: number | null;
    semester?: number | null;
    status?: string;
  };
  election: {
    id: string;
    title: string;
    electionCode: string;
  };
}

export interface QueryVoterDto {
  search?: string;
  status?: VoterRegistrationStatus;
  source?: VoterRegistrationSource;
  electionId?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export interface VoterListResponse {
  items: VoterRegistration[];
  meta: PaginationMeta;
}

/** Per-election roll composition, for the commissioner dashboard. */
export interface VoterRollStats {
  electionId: string;
  electionTitle: string;
  registrationStatus:
    | 'CLOSED'
    | 'NOT_CONFIGURED'
    | 'NOT_STARTED'
    | 'OPEN'
    | 'ENDED';
  registrationStart: string | null;
  registrationEnd: string | null;
  total: number;
  /** Only APPROVED registrations may be issued a ballot. */
  eligible: number;
  byStatus: Record<VoterRegistrationStatus, number>;
}

export interface VoterImportRowResult {
  row: number;
  email: string;
  status: 'IMPORTED' | 'REVIVED' | 'SKIPPED' | 'FAILED';
  reason?: string;
}

export interface VoterImportResult {
  dryRun: boolean;
  total: number;
  imported: number;
  revived: number;
  skipped: number;
  failed: number;
  rows: VoterImportRowResult[];
}

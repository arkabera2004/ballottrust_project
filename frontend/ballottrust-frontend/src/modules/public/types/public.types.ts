import type { PaginationMeta } from '../../../types/api.types';

export interface PublicElection {
  id: string;
  title: string;
  description: string | null;
  electionCode: string;
  electionType: string;
  status: string;
  startDate: string;
  endDate: string;
  nominationStart: string | null;
  nominationEnd: string | null;
  campaignStart: string | null;
  campaignEnd: string | null;
  resultDate: string | null;
  banner: string | null;
  logo: string | null;
  publishedAt: string | null;
}

export interface PublicElectionDetail extends PublicElection {
  resultsAvailable: boolean;
  _count?: { candidates: number };
}

export interface PublicCandidate {
  id: string;
  candidateNumber: number | null;
  ballotOrder: number | null;
  candidateType: string;
  position: string | null;
  campaignSlogan: string | null;
  photoUrl: string | null;
  status: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    department: string | null;
    course: string | null;
    year: number | null;
  };
  party: {
    id: string;
    name: string;
    abbreviation: string | null;
    symbol: string | null;
  } | null;
  election: {
    id: string;
    title: string;
    electionCode: string;
    status: string;
  };
}

export interface PublishedManifesto {
  id: string;
  version: number;
  title: string;
  summary: string | null;
  /** Sanitised on write by the backend before it is stored. */
  content: string;
  documentUrl: string | null;
  videoUrl: string | null;
  coverImage: string | null;
  approvedAt: string | null;
}

export interface PublicCandidateDetail extends PublicCandidate {
  biography: string | null;
  campaignWebsite: string | null;
  manifesto: string | null;
  publishedManifesto: PublishedManifesto | null;
}

export interface PublicResultRow {
  candidateId: string;
  candidateNumber: number | null;
  ballotOrder: number | null;
  name: string;
  photoUrl: string | null;
  party: { id: string; name: string; abbreviation: string | null } | null;
  votes: number;
  percentage: number;
}

export interface PublicResults {
  election: {
    id: string;
    title: string;
    status: string;
    resultDate: string | null;
  };
  totalVotes: number;
  results: PublicResultRow[];
  /** True when more than one candidate shares the top score. */
  isTie: boolean;
  winners: PublicResultRow[];
}

export interface PublicStatistics {
  totalElections: number;
  activeElections: number;
  completedElections: number;
  totalCandidates: number;
  totalVotesCast: number;
  registeredVoters: number;
  turnoutPercentage: number;
}

export interface ReceiptVerification {
  verified: true;
  receiptNumber: string;
  issuedAt: string;
  recordedAt: string;
  election: { id: string; title: string; electionCode: string };
  ledgerHash: string;
}

export interface PublicListResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

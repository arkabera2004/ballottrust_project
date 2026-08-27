export type CandidateType =
  | 'INDEPENDENT'
  | 'PARTY';

export type CandidateStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'DISQUALIFIED';

export interface CandidateUser {
  id: string;
  fullName: string;
  email: string;
  registrationNumber?: string | null;
  department?: string | null;
  profilePhoto?: string | null;
}

export interface CandidateElection {
  id: string;
  title: string;
  electionCode: string;
  status: string;
}

export interface CandidateParty {
  id: string;
  name: string;
  abbreviation?: string | null;
  symbol?: string | null;
  logo?: string | null;
}

export interface Candidate {
  id: string;

  electionId: string;
  userId: string;

  candidateType: CandidateType;
  partyId?: string | null;

  position: string;

  biography?: string | null;
  campaignSlogan?: string | null;
  campaignWebsite?: string | null;

  manifesto?: string | null;
  agenda?: string | null;
  achievements?: string | null;

  nominationStatement?: string | null;

  photoUrl?: string | null;
  documentUrl?: string | null;

  status: CandidateStatus;

  submittedAt?: string | null;
  verifiedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  withdrawnAt?: string | null;
  disqualifiedAt?: string | null;

  rejectionReason?: string | null;
  withdrawalReason?: string | null;
  disqualificationReason?: string | null;

  candidateNumber?: number | null;
  ballotOrder?: number | null;

  user?: CandidateUser;
  election?: CandidateElection;
  party?: CandidateParty | null;
}

export interface CreateCandidateDto {
  electionId: string;

  candidateType: CandidateType;

  partyId?: string;

  position: string;

  manifesto?: string;
  agenda?: string;
  achievements?: string;

  nominationStatement: string;

  photoUrl?: string;
  documentUrl?: string;

  biography?: string;

  campaignSlogan?: string;

  campaignWebsite?: string;
}
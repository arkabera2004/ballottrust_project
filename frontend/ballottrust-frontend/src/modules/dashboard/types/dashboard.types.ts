export interface DashboardStats {
  registeredVoters: number;
  pendingVoters: number;
  candidates: number;
  activeElections: number;
}

export interface CurrentElection {
  id: string;
  title: string;
  status: string;
  candidates: number;
  votes: number;
}

export interface PendingCandidate {
  id: string;
  name: string;
  election?: {
    title: string;
  };
}
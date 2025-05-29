export interface Voter {
  id: string;
  name: string;
  voterId: string;
  imageUrl: string;
  slotId: string;
  voted: boolean;
  timestamp?: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  votes: number;
}

export interface VoteRecord {
  voter: Voter;
  candidateId: string;
  timestamp: string;
}

export interface WebcamStatus {
  active: boolean;
  faceDetected: boolean;
  warning: string | null;
}

export interface Slot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  voters: Voter[];
}

export interface SlotStats {
  total: number;
  completed: number;
  pending: number;
  missed: number;
}

export type VotingStatus = 'pending' | 'completed' | 'missed';
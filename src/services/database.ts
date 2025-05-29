import { Voter, VoteRecord, Candidate, Slot, VotingStatus } from "../types";
import { candidates as initialCandidates } from "../data/candidates";

class VotingDatabase {
  private voters: Voter[] = [];
  private voteRecords: VoteRecord[] = [];
  private slots: Slot[] = [];
  private candidates: Candidate[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedVoters = localStorage.getItem('voters');
      const storedRecords = localStorage.getItem('voteRecords');
      const storedSlots = localStorage.getItem('slots');
      const storedCandidates = localStorage.getItem('candidates');

      if (storedVoters) this.voters = JSON.parse(storedVoters);
      if (storedRecords) this.voteRecords = JSON.parse(storedRecords);
      if (storedSlots) this.slots = JSON.parse(storedSlots);
      if (storedCandidates) this.candidates = JSON.parse(storedCandidates);
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('voters', JSON.stringify(this.voters));
      localStorage.setItem('voteRecords', JSON.stringify(this.voteRecords));
      localStorage.setItem('slots', JSON.stringify(this.slots));
      localStorage.setItem('candidates', JSON.stringify(this.candidates));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  public getVoterByVoterId(voterId: string): Voter | undefined {
    return this.voters.find(voter => voter.voterId === voterId);
  }

  public getAllVoters(): Voter[] {
    return [...this.voters];
  }

  public getCandidates(): Candidate[] {
    return [...this.candidates];
  }

  public getSlots(): Slot[] {
    return [...this.slots];
  }

  public getCurrentSlot(): Slot | null {
    const now = new Date().getTime();
    return this.slots.find(slot => {
      const start = new Date(slot.startTime).getTime();
      const end = new Date(slot.endTime).getTime();
      return now >= start && now <= end;
    }) || null;
  }

  public getCandidatesBySlot(slotId: string): Candidate[] {
    return this.candidates.filter(candidate => candidate.slotId === slotId);
  }

  public getCandidateStatus(candidate: Candidate): VotingStatus {
    const slot = this.slots.find(s => s.id === candidate.slotId);
    if (!slot) return 'pending';

    const now = new Date().getTime();
    const endTime = new Date(slot.endTime).getTime();

    if (candidate.hasVoted) return 'completed';
    if (now > endTime) return 'missed';
    return 'pending';
  }

  public addSlot(slot: Omit<Slot, 'candidates'>): void {
    const newSlot: Slot = {
      ...slot,
      candidates: []
    };
    this.slots.push(newSlot);
    this.saveToStorage();
  }

  public addCandidate(candidate: Omit<Candidate, 'votes' | 'hasVoted'>): void {
    const newCandidate: Candidate = {
      ...candidate,
      votes: 0,
      hasVoted: false
    };
    this.candidates.push(newCandidate);
    this.saveToStorage();
  }

  public recordVote(voter: Voter, candidateId: string): boolean {
    // Check if voter already exists
    const existingVoter = this.getVoterByVoterId(voter.voterId);
    if (existingVoter && existingVoter.voted) {
      return false;
    }

    // Check if candidate exists and is in current slot
    const candidate = this.candidates.find(c => c.id === candidateId);
    const currentSlot = this.getCurrentSlot();
    if (!candidate || !currentSlot || candidate.slotId !== currentSlot.id) {
      return false;
    }

    // Add or update voter
    if (existingVoter) {
      existingVoter.voted = true;
      existingVoter.timestamp = new Date().toISOString();
    } else {
      voter.voted = true;
      voter.timestamp = new Date().toISOString();
      this.voters.push(voter);
    }

    // Record the vote
    const voteRecord: VoteRecord = {
      voter: voter,
      candidateId: candidateId,
      timestamp: new Date().toISOString()
    };
    this.voteRecords.push(voteRecord);

    // Update candidate
    candidate.votes += 1;
    candidate.hasVoted = true;
    candidate.votedAt = new Date().toISOString();

    this.saveToStorage();
    return true;
  }

  public getSlotStats(slotId: string) {
    const candidates = this.getCandidatesBySlot(slotId);
    const total = candidates.length;
    const completed = candidates.filter(c => this.getCandidateStatus(c) === 'completed').length;
    const missed = candidates.filter(c => this.getCandidateStatus(c) === 'missed').length;
    const pending = total - completed - missed;

    return {
      total,
      completed,
      pending,
      missed
    };
  }

  public clearAllData(): void {
    this.voters = [];
    this.voteRecords = [];
    this.slots = [];
    this.candidates = [];
    this.saveToStorage();
  }
}

export const db = new VotingDatabase();
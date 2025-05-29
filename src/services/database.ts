import { Voter, VoteRecord, Slot, VotingStatus, SlotStats } from "../types";

class VotingDatabase {
  private voters: Voter[] = [];
  private voteRecords: VoteRecord[] = [];
  private slots: Slot[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedVoters = localStorage.getItem('voters');
      const storedRecords = localStorage.getItem('voteRecords');
      const storedSlots = localStorage.getItem('slots');

      if (storedVoters) this.voters = JSON.parse(storedVoters);
      if (storedRecords) this.voteRecords = JSON.parse(storedRecords);
      if (storedSlots) this.slots = JSON.parse(storedSlots);
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('voters', JSON.stringify(this.voters));
      localStorage.setItem('voteRecords', JSON.stringify(this.voteRecords));
      localStorage.setItem('slots', JSON.stringify(this.slots));
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

  public getVotersBySlot(slotId: string): Voter[] {
    return this.voters.filter(voter => voter.slotId === slotId);
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

  public getVoterStatus(voter: Voter): VotingStatus {
    const slot = this.slots.find(s => s.id === voter.slotId);
    if (!slot) return 'pending';

    const now = new Date().getTime();
    const endTime = new Date(slot.endTime).getTime();

    if (voter.voted) return 'completed';
    if (now > endTime) return 'missed';
    return 'pending';
  }

  public addSlot(slot: Omit<Slot, 'voters'>): void {
    const newSlot: Slot = {
      ...slot,
      voters: []
    };
    this.slots.push(newSlot);
    this.saveToStorage();
  }

  public addVoter(voter: Voter): void {
    this.voters.push(voter);
    
    // Add voter to slot
    const slot = this.slots.find(s => s.id === voter.slotId);
    if (slot) {
      slot.voters.push(voter);
    }
    
    this.saveToStorage();
  }

  public recordVote(voter: Voter): boolean {
    // Check if voter already exists and has voted
    const existingVoter = this.getVoterByVoterId(voter.voterId);
    if (existingVoter && existingVoter.voted) {
      return false;
    }

    // Check if voter's slot is current
    const currentSlot = this.getCurrentSlot();
    if (!currentSlot || voter.slotId !== currentSlot.id) {
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
      timestamp: new Date().toISOString()
    };
    this.voteRecords.push(voteRecord);

    this.saveToStorage();
    return true;
  }

  public getSlotStats(slotId: string): SlotStats {
    const voters = this.getVotersBySlot(slotId);
    const total = voters.length;
    const completed = voters.filter(v => this.getVoterStatus(v) === 'completed').length;
    const missed = voters.filter(v => this.getVoterStatus(v) === 'missed').length;
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
    this.saveToStorage();
  }
}

export const db = new VotingDatabase();
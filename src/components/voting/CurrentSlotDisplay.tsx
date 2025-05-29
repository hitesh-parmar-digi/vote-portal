import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/services/database";
import { Slot, SlotStats, VotingStatus } from "@/types";

export const CurrentSlotDisplay = () => {
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null);
  const [upcomingSlots, setUpcomingSlots] = useState<Slot[]>([]);
  const [stats, setStats] = useState<SlotStats | null>(null);

  useEffect(() => {
    const updateSlots = () => {
      const current = db.getCurrentSlot();
      setCurrentSlot(current);
      
      if (current) {
        setStats(db.getSlotStats(current.id));
      }

      // Get upcoming slots
      const now = new Date().getTime();
      const upcoming = db.getSlots()
        .filter(slot => new Date(slot.startTime).getTime() > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 3); // Show next 3 upcoming slots
      
      setUpcomingSlots(upcoming);
    };

    updateSlots();
    const interval = setInterval(updateSlots, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: VotingStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'missed': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const renderVotersList = (slot: Slot) => {
    const voters = db.getVotersBySlot(slot.id);
    return (
      <div className="space-y-2">
        {voters.map((voter) => {
          const status = db.getVoterStatus(voter);
          return (
            <div key={voter.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <img 
                  src={voter.imageUrl} 
                  alt={voter.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{voter.name}</p>
                  <p className="text-sm text-gray-500">ID: {voter.voterId}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCurrentSlot = () => {
    if (!currentSlot || !stats) {
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">No active voting slot</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Slot: {currentSlot.name}</CardTitle>
          <p className="text-sm text-gray-500">
            {new Date(currentSlot.startTime).toLocaleString()} - {new Date(currentSlot.endTime).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Voting Progress</h3>
              <Progress value={(stats.completed / stats.total) * 100} />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-600">{stats.completed}</p>
                  <p className="text-gray-500">Completed</p>
                </div>
                <div>
                  <p className="text-yellow-600">{stats.pending}</p>
                  <p className="text-gray-500">Pending</p>
                </div>
                <div>
                  <p className="text-red-600">{stats.missed}</p>
                  <p className="text-gray-500">Missed</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Registered Voters</h3>
              {renderVotersList(currentSlot)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderUpcomingSlots = () => {
    if (upcomingSlots.length === 0) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upcoming Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {upcomingSlots.map(slot => (
              <div key={slot.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{slot.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(slot.startTime).toLocaleString()}
                  </p>
                </div>
                {renderVotersList(slot)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {renderCurrentSlot()}
      {renderUpcomingSlots()}
    </div>
  );
};
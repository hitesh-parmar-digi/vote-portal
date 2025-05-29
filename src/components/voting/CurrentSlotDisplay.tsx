import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/services/database";
import { Slot, SlotStats, VotingStatus } from "@/types";

export const CurrentSlotDisplay = () => {
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null);
  const [stats, setStats] = useState<SlotStats | null>(null);

  useEffect(() => {
    const updateSlot = () => {
      const slot = db.getCurrentSlot();
      setCurrentSlot(slot);
      if (slot) {
        setStats(db.getSlotStats(slot.id));
      }
    };

    updateSlot();
    const interval = setInterval(updateSlot, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!currentSlot || !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No active voting slot</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: VotingStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'missed': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentSlot.name}</CardTitle>
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
            <h3 className="text-sm font-medium">Candidates</h3>
            <div className="space-y-2">
              {db.getCandidatesBySlot(currentSlot.id).map((candidate) => {
                const status = db.getCandidateStatus(candidate);
                return (
                  <div key={candidate.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <img 
                        src={candidate.imageUrl} 
                        alt={candidate.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-gray-500">{candidate.party}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
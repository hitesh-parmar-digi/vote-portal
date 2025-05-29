import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/services/database";
import { Candidate } from "@/types";

export const CandidateManagement = () => {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [voterId, setVoterId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();
  const slots = db.getSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !party || !voterId || !selectedSlot || !imageUrl) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newCandidate: Candidate = {
      id: `candidate_${Date.now()}`,
      name,
      party,
      voterId,
      slotId: selectedSlot,
      imageUrl,
      votes: 0
    };

    db.addCandidate(newCandidate);

    toast({
      title: "Success",
      description: "Candidate has been added successfully",
    });

    setName("");
    setParty("");
    setVoterId("");
    setSelectedSlot("");
    setImageUrl("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Candidate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Candidate Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter candidate name"
            />
          </div>
          
          <div>
            <Label htmlFor="party">Party</Label>
            <Input
              id="party"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              placeholder="Enter party name"
            />
          </div>
          
          <div>
            <Label htmlFor="voterId">Voter ID</Label>
            <Input
              id="voterId"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              placeholder="Enter voter ID"
            />
          </div>
          
          <div>
            <Label htmlFor="slot">Slot</Label>
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select a slot" />
              </SelectTrigger>
              <SelectContent>
                {slots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          
          <Button type="submit">Add Candidate</Button>
        </form>
      </CardContent>
    </Card>
  );
};
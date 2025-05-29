import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/services/database";
import { Voter } from "@/types";

export const VoterManagement = () => {
  const [name, setName] = useState("");
  const [voterId, setVoterId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();
  const slots = db.getSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !voterId || !selectedSlot || !imageUrl) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newVoter: Voter = {
      id: `voter_${Date.now()}`,
      name,
      voterId,
      slotId: selectedSlot,
      imageUrl,
      voted: false
    };

    db.addVoter(newVoter);

    toast({
      title: "Success",
      description: "Voter has been added successfully",
    });

    setName("");
    setVoterId("");
    setSelectedSlot("");
    setImageUrl("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Voter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Voter Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter voter name"
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
          
          <Button type="submit">Add Voter</Button>
        </form>
      </CardContent>
    </Card>
  );
};
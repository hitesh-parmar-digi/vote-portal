import { useState, useRef } from "react";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const slots = db.getSlots();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !voterId || !selectedSlot || !imageFile) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload an image",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would typically upload the image to your API
      // For now, we'll create a temporary URL
      const imageUrl = URL.createObjectURL(imageFile);

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
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add voter. Please try again.",
        variant: "destructive",
      });
    }
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
            <Label htmlFor="image">Voter Image</Label>
            <Input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            {imageFile && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file: {imageFile.name}
              </p>
            )}
          </div>
          
          <Button type="submit">Add Voter</Button>
        </form>
      </CardContent>
    </Card>
  );
};
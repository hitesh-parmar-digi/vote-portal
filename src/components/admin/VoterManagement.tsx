import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/services/database";
import { supabase } from "@/integrations/supabase/client";

export const VoterManagement = () => {
  const [name, setName] = useState("");
  const [voterId, setVoterId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  const slots = db.getSlots();

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `voter-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('voters')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('voters')
      .getPublicUrl(filePath);

    return data.publicUrl;
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
      const imageUrl = await handleImageUpload(imageFile);

      const newVoter = {
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
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          
          <Button type="submit">Add Voter</Button>
        </form>
      </CardContent>
    </Card>
  );
};
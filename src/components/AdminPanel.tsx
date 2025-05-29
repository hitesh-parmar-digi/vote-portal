import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/services/database";
import { SlotManagement } from "./admin/SlotManagement";
import { VoterManagement } from "./admin/VoterManagement";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all voting data? This cannot be undone.")) {
      db.clearAllData();
      
      toast({
        title: "Data cleared",
        description: "All voting data has been reset.",
        variant: "default",
      });
    }
  };

  const slots = db.getSlots();
  const totalSlots = slots.length;
  const activeSlots = slots.filter(slot => {
    const now = new Date().getTime();
    const start = new Date(slot.startTime).getTime();
    const end = new Date(slot.endTime).getTime();
    return now >= start && now <= end;
  }).length;
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gray-100">
        <CardTitle className="text-lg font-medium">Administration Panel</CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start p-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="slots">Manage Slots</TabsTrigger>
          <TabsTrigger value="voters">Manage Voters</TabsTrigger>
        </TabsList>
        
        <CardContent className="p-6">
          <TabsContent value="overview" className="space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-4">Voting Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Total Slots</div>
                  <div className="text-2xl font-bold">{totalSlots}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Active Slots</div>
                  <div className="text-2xl font-bold">{activeSlots}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Total Voters</div>
                  <div className="text-2xl font-bold">{db.getAllVoters().length}</div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Admin control panel for vote management
              </div>
              <Button 
                variant="destructive" 
                onClick={handleClearData}
              >
                Reset All Data
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="slots">
            <SlotManagement />
          </TabsContent>
          
          <TabsContent value="voters">
            <VoterManagement />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default AdminPanel;
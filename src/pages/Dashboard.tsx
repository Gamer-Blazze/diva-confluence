import { motion } from "framer-motion";
import { Plus, Video, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const rooms = useQuery(api.rooms.listActiveRooms);
  const createRoom = useMutation(api.rooms.createRoom);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [roomType, setRoomType] = useState<"free" | "premium">("free");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const handleCreateRoom = async () => {
    if (!roomTitle.trim()) {
      toast.error("Please enter a room title");
      return;
    }

    setIsCreating(true);
    try {
      const roomId = await createRoom({ title: roomTitle, type: roomType });
      toast.success("Room created successfully!");
      setIsCreateDialogOpen(false);
      setRoomTitle("");
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast.error("Failed to create room");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Navbar */}
      <nav className="backdrop-blur-lg bg-[#0F172A]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Diva Conference</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/profile")}
                variant="ghost"
                className="text-[#E6EEF8] hover:bg-white/10"
              >
                {user?.displayName || user?.name || "Profile"}
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="text-[#E6EEF8] hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.displayName || user?.name || "User"}!
              </h1>
              <p className="text-[#E6EEF8]/70">
                {user?.isGuest ? "You're using a guest account" : "Manage your rooms and join conferences"}
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1E293B] border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Room</DialogTitle>
                  <DialogDescription className="text-[#E6EEF8]/70">
                    Set up a new conference room for your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Room Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter room title"
                      value={roomTitle}
                      onChange={(e) => setRoomTitle(e.target.value)}
                      className="bg-[#0F172A] border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-white">Room Type</Label>
                    <Select value={roomType} onValueChange={(value: "free" | "premium") => setRoomType(value)}>
                      <SelectTrigger className="bg-[#0F172A] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-white/10">
                        <SelectItem value="free">Free (10 participants)</SelectItem>
                        <SelectItem value="premium">Premium (50 participants)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] hover:opacity-90 text-white"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Room"
                  )}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Rooms */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Active Rooms</h2>
            {!rooms ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
              </div>
            ) : rooms.length === 0 ? (
              <Card className="bg-[#1E293B] border-white/10">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-[#7C3AED]/50 mx-auto mb-4" />
                  <p className="text-[#E6EEF8]/70">No active rooms. Create one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <motion.div
                    key={room._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-[#1E293B] border-white/10 hover:border-[#7C3AED]/50 transition-all cursor-pointer"
                      onClick={() => navigate(`/room/${room._id}`)}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-white">{room.title}</CardTitle>
                          {room.type === "premium" && (
                            <Badge className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] text-white border-0">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-[#E6EEF8]/70">
                          by {room.owner?.displayName || room.owner?.name || "Unknown"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-[#E6EEF8]/70">
                          <Users className="w-4 h-4" />
                          <span>{room.participantCount} participants</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

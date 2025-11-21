import { motion } from "framer-motion";
import { Plus, Video, Users, LogOut, Shield, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const rooms = useQuery(api.rooms.listActiveRooms);
  const allRooms = useQuery(
    api.rooms.listAllRooms,
    user?.role === "admin" ? {} : "skip"
  );
  const createRoom = useMutation(api.rooms.createRoom);
  const deleteRoom = useMutation(api.rooms.deleteRoom);
  const toggleRoomStatus = useMutation(api.rooms.toggleRoomStatus);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [roomType, setRoomType] = useState<"free" | "premium">("free");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

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

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom({ roomId: roomId as Id<"rooms"> });
      toast.success("Room deleted successfully");
      setDeleteRoomId(null);
    } catch (error) {
      toast.error("Failed to delete room");
      console.error(error);
    }
  };

  const handleToggleRoomStatus = async (roomId: string) => {
    try {
      await toggleRoomStatus({ roomId: roomId as Id<"rooms"> });
      toast.success("Room status updated");
    } catch (error) {
      toast.error("Failed to update room status");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

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
              {isAdmin && (
                <Badge className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] text-white border-0">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
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
                        <SelectItem value="free">Free (Up to 10 participants)</SelectItem>
                        <SelectItem value="premium">Premium (Up to 100 participants)</SelectItem>
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

          {/* Admin Room Management Section */}
          {isAdmin && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#F59E0B]" />
                Admin: All Rooms
              </h2>
              {!allRooms ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                </div>
              ) : allRooms.length === 0 ? (
                <Card className="bg-[#1E293B] border-white/10">
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-[#7C3AED]/50 mx-auto mb-4" />
                    <p className="text-[#E6EEF8]/70">No rooms found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allRooms.map((room: any) => (
                    <motion.div
                      key={room._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-[#1E293B] border-white/10 hover:border-[#7C3AED]/50 transition-all">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-white">{room.title}</CardTitle>
                            <div className="flex gap-2">
                              {room.type === "premium" && (
                                <Badge className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] text-white border-0">
                                  Premium
                                </Badge>
                              )}
                              <Badge className={room.isActive ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-red-500/20 text-red-400 border-red-500/50"}>
                                {room.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <CardDescription className="text-[#E6EEF8]/70">
                            by {room.owner?.displayName || room.owner?.name || "Unknown"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-[#E6EEF8]/70 mb-4">
                            <Users className="w-4 h-4" />
                            <span>{room.participantCount} participants</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => navigate(`/room/${room._id}`)}
                              className="flex-1 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white"
                              size="sm"
                            >
                              Join
                            </Button>
                            <Button
                              onClick={() => handleToggleRoomStatus(room._id)}
                              variant="outline"
                              className="border-white/10 text-[#E6EEF8] hover:bg-white/10"
                              size="sm"
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => setDeleteRoomId(room._id)}
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRoomId} onOpenChange={() => setDeleteRoomId(null)}>
        <AlertDialogContent className="bg-[#1E293B] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Room</AlertDialogTitle>
            <AlertDialogDescription className="text-[#E6EEF8]/70">
              Are you sure you want to delete this room? This action cannot be undone and will remove all messages and participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#0F172A] border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoomId && handleDeleteRoom(deleteRoomId)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
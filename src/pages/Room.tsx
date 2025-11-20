import { motion, AnimatePresence } from "framer-motion";
import { Video, MessageSquare, Users, Send, ArrowLeft, Loader2, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";

export default function Room() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { isLoading, isAuthenticated, user } = useAuth();
  
  const room = useQuery(api.rooms.getRoom, roomId ? { roomId: roomId as Id<"rooms"> } : "skip");
  const messages = useQuery(api.rooms.getRoomMessages, roomId ? { roomId: roomId as Id<"rooms"> } : "skip");
  const participants = useQuery(api.rooms.getRoomParticipants, roomId ? { roomId: roomId as Id<"rooms"> } : "skip");
  
  const sendMessage = useMutation(api.messages.sendMessage);
  const joinRoom = useMutation(api.rooms.joinRoom);
  const leaveRoom = useMutation(api.rooms.leaveRoom);
  
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [hasJoined, setHasJoined] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (roomId && user && !hasJoined) {
      joinRoom({ roomId: roomId as Id<"rooms"> })
        .then(() => {
          setHasJoined(true);
          toast.success("Joined room");
        })
        .catch((error) => {
          toast.error("Failed to join room");
          console.error(error);
        });
    }
  }, [roomId, user, hasJoined, joinRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLeaveRoom = async () => {
    if (roomId) {
      try {
        await leaveRoom({ roomId: roomId as Id<"rooms"> });
        toast.success("Left room");
        navigate("/dashboard");
      } catch (error) {
        toast.error("Failed to leave room");
        console.error(error);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !roomId) return;

    setIsSending(true);
    try {
      await sendMessage({
        roomId: roomId as Id<"rooms">,
        text: messageText.trim(),
      });
      setMessageText("");
      setIsTyping(false);
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (value: string) => {
    setMessageText(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  if (isLoading || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex flex-col">
      {/* Header */}
      <nav className="backdrop-blur-lg bg-[#0F172A]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLeaveRoom}
                variant="ghost"
                className="text-[#E6EEF8] hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave
              </Button>
              <div>
                <h1 className="text-white font-bold">{room.title}</h1>
                <p className="text-[#E6EEF8]/70 text-sm">
                  {participants?.length || 0} participants
                </p>
              </div>
            </div>
            {room.type === "premium" && (
              <Badge className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] text-white border-0">
                Premium
              </Badge>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <Card className="h-full bg-[#1E293B] border-white/10 flex items-center justify-center">
            <div className="text-center">
              <VideoOff className="w-16 h-16 text-[#7C3AED]/50 mx-auto mb-4" />
              <p className="text-[#E6EEF8]/70">Video conferencing coming soon</p>
            </div>
          </Card>
          
          {/* Floating Controls */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
            >
              <Mic className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
            >
              <Video className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLeaveRoom}
              className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600"
            >
              <PhoneOff className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 border-l border-white/10 bg-[#0F172A]/50 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
              <h2 className="text-white font-semibold">Chat</h2>
            </div>
          </div>

          {/* Participants */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#E6EEF8]/70" />
              <span className="text-[#E6EEF8]/70 text-sm">
                {participants?.length || 0} online
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {participants?.map((p) => (
                <div key={p._id} className="flex items-center gap-1">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-[#7C3AED] text-white text-xs">
                      {p.user?.displayName?.[0] || p.user?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[#E6EEF8] text-xs">
                    {p.user?.displayName || p.user?.name || "Guest"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages?.map((msg) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2"
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-[#7C3AED] text-white text-xs">
                      {msg.user?.displayName?.[0] || msg.user?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#E6EEF8] text-sm font-medium">
                        {msg.user?.displayName || msg.user?.name || "Guest"}
                      </span>
                      {msg.user?.isPremium && (
                        <Badge className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] text-white border-0 text-xs px-1 py-0">
                          Premium
                        </Badge>
                      )}
                      <span className="text-[#E6EEF8]/50 text-xs">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[#E6EEF8]/90 text-sm break-words">
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-[#E6EEF8]/70 text-sm"
                >
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-[#7C3AED]"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-[#7C3AED]"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-[#7C3AED]"
                    />
                  </div>
                  <span>You are typing...</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Type a message..."
                className="bg-[#1E293B] border-white/10 text-white"
                disabled={isSending}
              />
              <Button
                type="submit"
                disabled={isSending || !messageText.trim()}
                className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] hover:opacity-90 text-white"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { Video, MessageSquare, Users, Send, ArrowLeft, Loader2, X, Minimize2 } from "lucide-react";
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
  const [hasJoined, setHasJoined] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [roomId, user, hasJoined]);

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
    <div className="h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex flex-col overflow-hidden">
      {/* Modern Group Chat Interface - Full Screen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Chat Header - Fixed within chat box */}
          <div className="bg-gradient-to-r from-[#0084FF] to-[#00A3FF] px-6 py-4 flex items-center justify-between shadow-md flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 mr-1"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <motion.div 
                className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-6 h-6 text-white drop-shadow-md" />
              </motion.div>
              <div>
                <h3 className="text-white font-bold text-xl tracking-tight drop-shadow-sm">
                  {room.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50" />
                  <p className="text-white/95 text-sm font-medium">
                    {participants?.length || 0} online
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area - Scrollable with fixed height */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#F5F5F5] to-[#FAFAFA] space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              <AnimatePresence>
                {messages?.map((msg, index) => {
                  const isOwnMessage = msg.userId === user?._id;
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                      }}
                      className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isOwnMessage && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-[#0084FF] text-white text-xs">
                            {msg.user?.displayName?.[0] || msg.user?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} max-w-[70%]`}>
                        {!isOwnMessage && (
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-xs font-semibold text-gray-700">
                              {msg.user?.displayName || msg.user?.name || "Guest"}
                            </span>
                            {msg.user?.isPremium && (
                              <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white border-0 text-[10px] px-1.5 py-0">
                                VIP
                              </Badge>
                            )}
                          </div>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`rounded-2xl px-4 py-2 ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-[#0084FF] to-[#00A3FF] text-white"
                              : "bg-white text-gray-800 shadow-sm"
                          }`}
                        >
                          <p className="text-sm break-words">{msg.text}</p>
                        </motion.div>
                        <span className="text-[10px] text-gray-500 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#0084FF] text-white text-xs">
                        {user?.displayName?.[0] || user?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 rounded-full bg-gray-400"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-gray-400"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-gray-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

          {/* Input Section - Fixed at Bottom within chat box */}
          <form onSubmit={handleSendMessage} className="px-6 py-4 bg-white border-t border-gray-200 shadow-inner flex-shrink-0">
            <div className="flex gap-3 items-center">
              <Input
                value={messageText}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border-gray-300 bg-[#F5F5F5] focus:bg-white transition-all duration-200 text-base py-5 px-5 focus:ring-2 focus:ring-[#0084FF]/30"
                disabled={isSending}
              />
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  type="submit"
                  disabled={isSending || !messageText.trim()}
                  size="icon"
                  className="rounded-full bg-gradient-to-r from-[#0084FF] to-[#00A3FF] hover:opacity-90 text-white h-12 w-12 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
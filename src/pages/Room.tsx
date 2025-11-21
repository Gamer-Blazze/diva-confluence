import { motion, AnimatePresence } from "framer-motion";
import { Video, MessageSquare, Users, Send, ArrowLeft, Loader2, X, Minimize2, Edit2, Check, Reply, Trash2 } from "lucide-react";
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
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const joinRoom = useMutation(api.rooms.joinRoom);
  const leaveRoom = useMutation(api.rooms.leaveRoom);
  const markAsSeen = useMutation(api.rooms.markAsSeen);
  
  const [messageText, setMessageText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editText, setEditText] = useState("");
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
    
    // Mark last message as seen when messages update
    if (messages && messages.length > 0 && roomId) {
      const lastMessage = messages[messages.length - 1];
      markAsSeen({ 
        roomId: roomId as Id<"rooms">, 
        messageId: lastMessage._id 
      }).catch(console.error);
    }
  }, [messages, roomId]);

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
        parentMessageId: replyingTo?._id,
      });
      setMessageText("");
      setReplyingTo(null);
      setIsTyping(false);
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;

    try {
      await editMessage({
        messageId: messageId as Id<"messages">,
        text: editText.trim(),
      });
      setEditingMessageId(null);
      setEditText("");
      toast.success("Message updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to edit message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      await deleteMessage({
        messageId: messageId as Id<"messages">,
      });
      toast.success("Message deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete message");
    }
  };

  const startEditing = (msg: any) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text);
    setReplyingTo(null);
  };

  const startReplying = (msg: any) => {
    setReplyingTo(msg);
    setEditingMessageId(null);
    // Focus input
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) input.focus();
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
                  const isAdmin = user?.role === "admin";
                  const canEdit = isOwnMessage && (Date.now() - msg.timestamp < 3 * 60 * 1000);
                  const canDelete = isOwnMessage || isAdmin;
                  const isEditing = editingMessageId === msg._id;
                  const isLastMessage = index === messages.length - 1;
                  const seenByParticipants = participants?.filter(p => p.lastSeenMessageId === msg._id && p.userId !== user?._id && p.isActive) || [];

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
                      className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"} group`}
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
                            {msg.user?.role === "admin" && (
                              <Badge className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white border-0 text-[10px] px-1.5 py-0">
                                Admin
                              </Badge>
                            )}
                            {msg.user?.isPremium && (
                              <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white border-0 text-[10px] px-1.5 py-0">
                                VIP
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {msg.parentMessage && (
                          <div className={`mb-1 text-xs px-3 py-2 rounded-lg bg-gray-100 border-l-4 border-[#0084FF] opacity-80 ${isOwnMessage ? "mr-1" : "ml-1"}`}>
                            <p className="font-semibold text-gray-600 mb-0.5">
                              Replying to {msg.parentMessage.user?.displayName || msg.parentMessage.user?.name || "User"}
                            </p>
                            <p className="text-gray-500 truncate max-w-[200px]">{msg.parentMessage.text}</p>
                          </div>
                        )}

                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="h-8 text-sm min-w-[200px]"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditMessage(msg._id);
                                if (e.key === "Escape") setEditingMessageId(null);
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleEditMessage(msg._id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setEditingMessageId(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative group/message">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                  ? "bg-gradient-to-r from-[#0084FF] to-[#00A3FF] text-white"
                                  : "bg-white text-gray-800 shadow-sm"
                              }`}
                            >
                              <p className="text-sm break-words">
                                {msg.text}
                                {msg.isEdited && (
                                  <span className={`text-[10px] ml-2 ${isOwnMessage ? "text-white/70" : "text-gray-400"}`}>
                                    (edited)
                                  </span>
                                )}
                              </p>
                            </motion.div>
                            <div className={`absolute top-1/2 -translate-y-1/2 ${isOwnMessage ? "-left-24" : "-right-24"} opacity-0 group-hover/message:opacity-100 transition-opacity flex gap-1`}>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-gray-400 hover:text-[#0084FF]"
                                onClick={() => startReplying(msg)}
                              >
                                <Reply className="w-3 h-3" />
                              </Button>
                              {canEdit && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-gray-400 hover:text-[#0084FF]"
                                  onClick={() => startEditing(msg)}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-gray-400 hover:text-red-500"
                                  onClick={() => handleDeleteMessage(msg._id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Seen Indicators */}
                        {seenByParticipants.length > 0 && (
                          <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} px-12 -mt-2 mb-2`}>
                            <div className="flex -space-x-2 overflow-hidden">
                              {seenByParticipants.map((p) => (
                                  <div key={p._id} className="relative group/seen">
                                    <Avatar className="w-4 h-4 border-2 border-white ring-1 ring-gray-100">
                                      <AvatarFallback className="bg-gray-200 text-[8px] text-gray-600">
                                        {p.user?.displayName?.[0] || p.user?.name?.[0] || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/seen:block whitespace-nowrap bg-black/75 text-white text-[10px] px-2 py-1 rounded">
                                      Seen by {p.user?.displayName || p.user?.name}
                                    </div>
                                  </div>
                                ))}
                            </div>
                            {isOwnMessage && isLastMessage && (
                              <span className="text-[10px] text-gray-400 font-medium mt-1">
                                Seen by {seenByParticipants.length === 1 
                                  ? (seenByParticipants[0].user?.displayName || seenByParticipants[0].user?.name) 
                                  : `${seenByParticipants.length} people`}
                              </span>
                            )}
                          </div>
                        )}
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
          <div className="bg-white border-t border-gray-200 shadow-inner flex-shrink-0">
            {replyingTo && (
              <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Reply className="w-4 h-4 text-[#0084FF]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700">
                      Replying to {replyingTo.user?.displayName || replyingTo.user?.name || "User"}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[300px]">
                      {replyingTo.text}
                    </span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-gray-400 hover:text-red-500"
                  onClick={() => setReplyingTo(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="px-6 py-4">
              <div className="flex gap-3 items-center">
                <Input
                  value={messageText}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
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
        </div>
      </motion.div>
    </div>
  );
}
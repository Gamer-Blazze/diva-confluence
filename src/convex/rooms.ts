import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createRoom = mutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("free"), v.literal("premium")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const roomId = await ctx.db.insert("rooms", {
      title: args.title,
      type: args.type,
      ownerId: user._id,
      isActive: true,
      maxParticipants: args.type === "premium" ? 50 : 10,
    });

    return roomId;
  },
});

export const getRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const owner = await ctx.db.get(room.ownerId);
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return {
      ...room,
      owner: owner ? { name: owner.name, displayName: owner.displayName } : null,
      participantCount: participants.length,
    };
  },
});

export const listActiveRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        const owner = await ctx.db.get(room.ownerId);
        const participants = await ctx.db
          .query("participants")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        return {
          ...room,
          owner: owner ? { name: owner.name, displayName: owner.displayName } : null,
          participantCount: participants.length,
        };
      })
    );

    return roomsWithDetails;
  },
});

export const joinRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isActive) {
      throw new Error("Room not found or inactive");
    }

    const existing = await ctx.db
      .query("participants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isActive: true,
        joinedAt: Date.now(),
      });
      return existing._id;
    }

    const participantId = await ctx.db.insert("participants", {
      roomId: args.roomId,
      userId: user._id,
      joinedAt: Date.now(),
      isActive: true,
    });

    return participantId;
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id)
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, { isActive: false });
    }
  },
});

export const getRoomParticipants = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const participantsWithUsers = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          ...p,
          user: user ? {
            name: user.name,
            displayName: user.displayName,
            isPremium: user.isPremium,
            isGuest: user.isGuest,
          } : null,
        };
      })
    );

    return participantsWithUsers;
  },
});

export const getRoomMessages = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("asc")
      .take(100);

    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        return {
          ...msg,
          user: user ? {
            name: user.name,
            displayName: user.displayName,
            isPremium: user.isPremium,
          } : null,
        };
      })
    );

    return messagesWithUsers;
  },
});

export const deleteRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Only admin or room owner can delete
    if (user.role !== "admin" && room.ownerId !== user._id) {
      throw new Error("Only admins or room owners can delete rooms");
    }

    // Delete all participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    
    for (const participant of participants) {
      await ctx.db.delete(participant._id);
    }

    // Delete all messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the room
    await ctx.db.delete(args.roomId);

    return args.roomId;
  },
});

export const toggleRoomStatus = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Only admin or room owner can toggle status
    if (user.role !== "admin" && room.ownerId !== user._id) {
      throw new Error("Only admins or room owners can toggle room status");
    }

    await ctx.db.patch(args.roomId, {
      isActive: !room.isActive,
    });

    return args.roomId;
  },
});

export const listAllRooms = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const rooms = await ctx.db.query("rooms").collect();

    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        const owner = await ctx.db.get(room.ownerId);
        const participants = await ctx.db
          .query("participants")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        return {
          ...room,
          owner: owner ? { name: owner.name, displayName: owner.displayName } : null,
          participantCount: participants.length,
        };
      })
    );

    return roomsWithDetails;
  },
});
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    text: v.string(),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const messageId = await ctx.db.insert("messages", {
      roomId: args.roomId,
      userId: user._id,
      text: args.text,
      timestamp: Date.now(),
      parentMessageId: args.parentMessageId,
    });

    return messageId;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Allow author or admin to delete
    if (message.userId !== user._id && user.role !== "admin") {
      throw new Error("You can only delete your own messages");
    }

    await ctx.db.delete(args.messageId);
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.userId !== user._id) {
      throw new Error("You can only edit your own messages");
    }

    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;
    if (message.timestamp < threeMinutesAgo) {
      throw new Error("Message can no longer be edited (3 minute limit)");
    }

    await ctx.db.patch(args.messageId, {
      text: args.text,
      isEdited: true,
    });
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const reactions = message.reactions || [];
    const existingReactionIndex = reactions.findIndex(
      (r) => r.userId === user._id && r.emoji === args.emoji
    );

    let newReactions;
    if (existingReactionIndex !== -1) {
      // Remove reaction if it already exists (toggle off)
      newReactions = [
        ...reactions.slice(0, existingReactionIndex),
        ...reactions.slice(existingReactionIndex + 1),
      ];
    } else {
      // Add reaction
      // First remove any other reaction by this user if we want single reaction per user? 
      // Or allow multiple? Usually multiple is fine, but let's check if we want to limit.
      // Let's allow multiple different emojis, but toggling the same one removes it.
      newReactions = [...reactions, { userId: user._id, emoji: args.emoji }];
    }

    await ctx.db.patch(args.messageId, {
      reactions: newReactions,
    });
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
        let parentMessage = null;
        if (msg.parentMessageId) {
          const parent = await ctx.db.get(msg.parentMessageId);
          if (parent) {
            const parentUser = await ctx.db.get(parent.userId);
            parentMessage = {
              text: parent.text,
              user: parentUser ? {
                displayName: parentUser.displayName,
                name: parentUser.name,
              } : null,
            };
          }
        }

        // Process reactions to include user details
        const reactionsWithUsers = msg.reactions ? await Promise.all(
          msg.reactions.map(async (reaction) => {
            const reactionUser = await ctx.db.get(reaction.userId);
            return {
              ...reaction,
              user: reactionUser ? {
                displayName: reactionUser.displayName,
                name: reactionUser.name,
              } : null,
            };
          })
        ) : [];

        return {
          ...msg,
          user: user ? {
            name: user.name,
            displayName: user.displayName,
            isPremium: user.isPremium,
            role: user.role,
          } : null,
          parentMessage,
          reactions: reactionsWithUsers,
        };
      })
    );

    return messagesWithUsers;
  },
});

export const deleteOldMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    // Find messages older than 24 hours
    const oldMessages = await ctx.db
      .query("messages")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", oneDayAgo))
      .take(1000); // Process in batches to avoid timeouts

    for (const msg of oldMessages) {
      await ctx.db.delete(msg._id);
    }
  },
});
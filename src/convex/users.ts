import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";
import { roleValidator } from "./schema";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      return null;
    }
    return user;
  },
});

export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(user._id, {
      displayName: args.displayName,
      name: args.name,
    });

    return user._id;
  },
});

export const upgradeToPremium = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(user._id, {
      isPremium: true,
    });

    return user._id;
  },
});

export const setUserRole = mutation({
  args: {
    email: v.string(),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    
    // Only admins can set roles
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Only admins can set user roles");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    // Update user role
    await ctx.db.patch(user._id, {
      role: args.role,
    });

    return user._id;
  },
});
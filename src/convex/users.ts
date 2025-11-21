import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation, internalMutation } from "./_generated/server";
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

    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    // If already premium and not expired, extend from current expiration, otherwise from now
    const currentExpiration = user.premiumExpiresAt || now;
    const newExpiration = (user.isPremium && currentExpiration > now ? currentExpiration : now) + oneMonthInMs;

    await ctx.db.patch(user._id, {
      isPremium: true,
      premiumExpiresAt: newExpiration,
    });

    return user._id;
  },
});

export const checkPremiumExpiration = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredUsers = await ctx.db
      .query("users")
      .withIndex("by_premium_expiration", (q) => 
        q.eq("isPremium", true).lt("premiumExpiresAt", now)
      )
      .take(100); // Process in batches

    for (const user of expiredUsers) {
      await ctx.db.patch(user._id, {
        isPremium: false,
        premiumExpiresAt: undefined,
      });
    }
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
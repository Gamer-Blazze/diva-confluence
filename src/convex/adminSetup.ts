import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const grantAdminAccess = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    // Update user role to admin
    await ctx.db.patch(user._id, {
      role: "admin",
    });

    return { success: true, userId: user._id, email: args.email };
  },
});

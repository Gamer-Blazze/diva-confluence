import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const roomTypeValidator = v.union(
  v.literal("free"),
  v.literal("premium"),
);
export type RoomType = Infer<typeof roomTypeValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      isPremium: v.optional(v.boolean()),
      displayName: v.optional(v.string()),
      isGuest: v.optional(v.boolean()),
      guestToken: v.optional(v.string()),
    }).index("email", ["email"]),

    rooms: defineTable({
      title: v.string(),
      type: roomTypeValidator,
      ownerId: v.id("users"),
      isActive: v.boolean(),
      maxParticipants: v.optional(v.number()),
    }).index("by_owner", ["ownerId"])
      .index("by_active", ["isActive"]),

    participants: defineTable({
      roomId: v.id("rooms"),
      userId: v.id("users"),
      joinedAt: v.number(),
      isActive: v.boolean(),
    }).index("by_room", ["roomId"])
      .index("by_user", ["userId"])
      .index("by_room_and_user", ["roomId", "userId"]),

    messages: defineTable({
      roomId: v.id("rooms"),
      userId: v.id("users"),
      text: v.string(),
      timestamp: v.number(),
    }).index("by_room", ["roomId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
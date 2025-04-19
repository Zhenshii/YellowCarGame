import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  spots: defineTable({
    userId: v.id("users"),
    imageId: v.id("_storage"),
    points: v.number(),
    description: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  
  userScores: defineTable({
    userId: v.id("users"),
    totalPoints: v.number(),
    totalSpots: v.number(),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  })
    .index("by_points", ["totalPoints"])
    .index("by_user", ["userId"]),

  friendships: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    status: v.string(), // "pending" or "accepted"
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

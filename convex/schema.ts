import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userScores: defineTable({
    userId: v.string(),
    username: v.optional(v.string()),
    totalPoints: v.number(),
    totalSpots: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"]),

  friendships: defineTable({
    userId: v.string(),
    friendId: v.string(),
    status: v.string(),
  }).index("by_user", ["userId"]),

  spots: defineTable({
    userId: v.string(),
    imageId: v.id("_storage"),
    points: v.number(),
    createdAt: v.optional(v.number()),
    description: v.optional(v.string()),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

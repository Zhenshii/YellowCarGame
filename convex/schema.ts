import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  spots: defineTable({
    userId: v.id("users"),
    imageId: v.id("_storage"),
    points: v.number(),
    description: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_points", ["points"]),

  leaderboard: defineTable({
    userId: v.id("users"),
    totalPoints: v.number(),
    totalSpots: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_points", ["totalPoints"]),
});

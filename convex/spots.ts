import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please log in");
    return await ctx.storage.generateUploadUrl();
  },
});

export const createSpot = mutation({
  args: {
    storageId: v.id("_storage"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please log in");

    // Add spot with points
    const points = 10; // Base points per spot
    await ctx.db.insert("spots", {
      userId,
      imageId: args.storageId,
      points,
      description: args.description,
    });

    // Update user score
    const existingScore = await ctx.db
      .query("userScores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingScore) {
      await ctx.db.patch(existingScore._id, {
        totalPoints: existingScore.totalPoints + points,
        totalSpots: existingScore.totalSpots + 1,
      });
    } else {
      await ctx.db.insert("userScores", {
        userId,
        totalPoints: points,
        totalSpots: 1,
      });
    }
  },
});

export const listSpots = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const spots = await ctx.db
      .query("spots")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      spots.map(async (spot) => ({
        ...spot,
        imageUrl: await ctx.storage.getUrl(spot.imageId),
      }))
    );
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const scores = await ctx.db
      .query("userScores")
      .withIndex("by_points")
      .order("desc")
      .take(10);

    return Promise.all(
      scores.map(async (score) => {
        const user = await ctx.db.get(score.userId);
        return {
          ...score,
          username: user?.email ?? "Anonymous",
        };
      })
    );
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const addSpot = mutation({
  args: {
    storageId: v.id("_storage"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Add the spot
    const spotId = await ctx.db.insert("spots", {
      userId,
      imageId: args.storageId,
      points: 1, // Each spot is worth 1 point
      description: args.description,
    });

    // Update or create leaderboard entry
    const existingEntry = await ctx.db
      .query("leaderboard")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        totalPoints: existingEntry.totalPoints + 1,
        totalSpots: existingEntry.totalSpots + 1,
      });
    } else {
      await ctx.db.insert("leaderboard", {
        userId,
        totalPoints: 1,
        totalSpots: 1,
      });
    }

    return spotId;
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const stats = await ctx.db
      .query("leaderboard")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return {
      name: user.name ?? "Anonymous",
      totalPoints: stats?.totalPoints ?? 0,
      totalSpots: stats?.totalSpots ?? 0,
    };
  },
});

export const getRecentSpots = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const spots = await ctx.db
      .query("spots")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);

    return await Promise.all(
      spots.map(async (spot) => ({
        ...spot,
        imageUrl: await ctx.storage.getUrl(spot.imageId),
      }))
    );
  },
});

export const getNextFriend = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current user's points
    const userStats = await ctx.db
      .query("leaderboard")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const userPoints = userStats?.totalPoints ?? 0;

    // Find the next person ahead
    const nextPlayer = await ctx.db
      .query("leaderboard")
      .withIndex("by_points", (q) => q.gt("totalPoints", userPoints))
      .order("asc")
      .first();

    if (!nextPlayer) return null;

    const nextUser = await ctx.db.get(nextPlayer.userId);
    if (!nextUser) return null;

    return {
      name: nextUser.name ?? "Anonymous",
      pointsDiff: nextPlayer.totalPoints - userPoints,
    };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get all users (in a real app, you'd filter to friends)
    const leaderboard = await ctx.db
      .query("leaderboard")
      .withIndex("by_points")
      .order("desc")
      .collect();

    // Fetch user details and format response
    const results = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await ctx.db.get(entry.userId);
        return {
          userId: entry.userId,
          name: user?.name ?? "Anonymous",
          totalPoints: entry.totalPoints,
          isCurrentUser: entry.userId === userId,
        };
      })
    );

    return results;
  },
});

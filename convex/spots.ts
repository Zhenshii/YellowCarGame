import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const createSpot = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Create spot
    await ctx.db.insert("spots", {
      userId,
      imageId: args.storageId,
      points: 10, // Each spot is worth 10 points
      createdAt: Date.now(),
    });

    // Update user score
    const existingScore = await ctx.db
      .query("userScores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingScore) {
      await ctx.db.patch(existingScore._id, {
        totalPoints: existingScore.totalPoints + 10,
      });
    }
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("userScores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!user) return null;

    // Find the next friend ahead in points
    const friends = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let nextFriend = null;
    if (friends.length > 0) {
      const friendScores = await Promise.all(
        friends.map(async (friendship) => {
          return await ctx.db
            .query("userScores")
            .withIndex("by_user", (q) => q.eq("userId", friendship.friendId))
            .unique();
        })
      );

      // Find the friend with the lowest score that's still higher than the user
      const validFriendScores = friendScores.filter(
        (score): score is NonNullable<typeof score> =>
          score !== null && score.totalPoints > user.totalPoints
      );

      if (validFriendScores.length > 0) {
        const closestFriend = validFriendScores.reduce((prev, curr) =>
          curr.totalPoints < prev.totalPoints ? curr : prev
        );
        nextFriend = {
          username: closestFriend.username,
          pointsDiff: closestFriend.totalPoints - user.totalPoints,
        };
      }
    }

    return {
      username: user.username,
      totalPoints: user.totalPoints,
      nextFriend,
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
      .take(3);

    return Promise.all(
      spots.map(async (spot) => ({
        ...spot,
        imageUrl: await ctx.storage.getUrl(spot.imageId),
      }))
    );
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

    const points = 10;
    await ctx.db.insert("spots", {
      userId,
      imageId: args.storageId,
      points,
      description: args.description,
    });

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
      const user = await ctx.db.get(userId);
      await ctx.db.insert("userScores", {
        userId,
        totalPoints: points,
        totalSpots: 1,
        username: user?.email?.split('@')[0] ?? "Anonymous",
        avatarUrl: user?.image,
      });
    }
  },
});

export const getRecentSpots = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const spots = await ctx.db
      .query("spots")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(3);

    return Promise.all(
      spots.map(async (spot) => ({
        ...spot,
        imageUrl: await ctx.storage.getUrl(spot.imageId),
        createdAt: spot._creationTime,
      }))
    );
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userScore = await ctx.db
      .query("userScores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!userScore) return null;

    // Find next friend above user
    const allScores = await ctx.db
      .query("userScores")
      .withIndex("by_points")
      .order("desc")
      .collect();

    const userRank = allScores.findIndex(score => score.userId === userId);
    let nextFriend = null;
    
    if (userRank > 0) {
      const friendships = await ctx.db
        .query("friendships")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      
      const friendIds = friendships
        .filter(f => f.status === "accepted")
        .map(f => f.friendId);

      for (let i = userRank - 1; i >= 0; i--) {
        if (friendIds.includes(allScores[i].userId)) {
          nextFriend = allScores[i];
          break;
        }
      }
    }

    return {
      ...userScore,
      nextFriend: nextFriend ? {
        username: nextFriend.username,
        pointsDiff: nextFriend.totalPoints - userScore.totalPoints,
      } : null,
    };
  },
});

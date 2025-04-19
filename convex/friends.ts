import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    return Promise.all(
      friendships.map(async (friendship) => {
        const friend = await ctx.db
          .query("userScores")
          .withIndex("by_user", (q) => q.eq("userId", friendship.friendId))
          .unique();
        return friend!;
      })
    );
  },
});

export const add = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please log in");

    // Find user by username
    const friend = await ctx.db
      .query("userScores")
      .filter((q) => q.eq(q.field("username"), args.username))
      .unique();

    if (!friend) {
      throw new Error("User not found");
    }

    if (friend.userId === userId) {
      throw new Error("You can't add yourself as a friend");
    }

    // Check if friendship already exists
    const existing = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("friendId"), friend.userId))
      .unique();

    if (existing) {
      throw new Error("Already friends with this user");
    }

    // Create friendship
    await ctx.db.insert("friendships", {
      userId,
      friendId: friend.userId,
      status: "accepted",
    });
  },
});

export const remove = mutation({
  args: {
    friendId: v.id("userScores"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please log in");

    const friend = await ctx.db.get(args.friendId);
    if (!friend) throw new Error("Friend not found");

    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("friendId"), friend.userId))
      .unique();

    if (!friendship) throw new Error("Friendship not found");

    await ctx.db.delete(friendship._id);
  },
});

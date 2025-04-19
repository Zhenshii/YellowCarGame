import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("userScores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return user;
  },
});

export const setUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if username is taken
    const existing = await ctx.db
      .query("userScores")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existing) {
      throw new Error("Username already taken");
    }

    // Check if user already has a profile
    const user = await ctx.db
      .query("userScores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (user) {
      // Update existing user
      await ctx.db.patch(user._id, { username: args.username });
    } else {
      // Create new user
      await ctx.db.insert("userScores", {
        userId,
        username: args.username,
        totalPoints: 0,
      });
    }
  },
});

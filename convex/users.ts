import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const checkUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.username))
      .unique();
    return !existing;
  },
});

export const searchUsers = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.query.length < 2) return [];

    // Use a filter instead of search since we can't modify auth tables
    const users = await ctx.db
      .query("users")
      .filter((q) => 
        q.neq(q.field("_id"), userId) && // Don't show current user
        q.gte(q.field("name"), args.query) && // Simple prefix search
        q.lt(q.field("name"), args.query + "\uffff")
      )
      .take(5);

    return users.map(user => ({
      id: user._id,
      name: user.name ?? "Anonymous",
    }));
  },
});

export const setUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate username
    const username = args.username.trim();
    if (username.length < 3) throw new Error("Username too short");
    if (username.length > 20) throw new Error("Username too long");
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new Error("Username can only contain letters, numbers, underscores, and hyphens");
    }

    // Check if username is taken
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), username))
      .unique();
    if (existing) throw new Error("Username already taken");

    // Update user's profile
    await ctx.db.patch(userId, { name: username });
  },
});

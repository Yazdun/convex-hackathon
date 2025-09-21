import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    let avatarUrl = null;
    if (profile?.avatarId) {
      avatarUrl = await ctx.storage.getUrl(profile.avatarId);
    }

    return {
      userId,
      email: user?.email,
      displayName: profile?.displayName || user?.email || "Unknown",
      avatarUrl,
      avatarId: profile?.avatarId,
    };
  },
});

export const update = mutation({
  args: {
    displayName: v.string(),
    avatarId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        displayName: args.displayName,
        avatarId: args.avatarId,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        displayName: args.displayName,
        avatarId: args.avatarId,
      });
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get regular channels (including legacy ones without type)
    const allChannels = await ctx.db.query("channels").collect();
    const channels = allChannels.filter((c) => !c.type || c.type === "channel");

    // Get DM channels where user is a participant
    const dmChannels = allChannels.filter(
      (c) => c.type === "dm" && c.participants?.includes(userId),
    );

    // Get other user info for DMs
    const dmsWithUserInfo = await Promise.all(
      dmChannels.map(async (dm) => {
        const otherUserId = dm.participants?.find((id) => id !== userId);
        if (!otherUserId) return dm;

        const otherUser = await ctx.db.get(otherUserId);
        const otherProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", otherUserId))
          .first();

        return {
          ...dm,
          name: otherProfile?.displayName || otherUser?.email || "Unknown User",
          description: "Direct Message",
          otherUserId,
        };
      }),
    );

    return [...channels, ...dmsWithUserInfo];
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("channels", {
      name: args.name,
      description: args.description,
      createdBy: userId,
      tags: args.tags,
      type: "channel",
    });
  },
});

export const createDM = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if DM already exists
    const allChannels = await ctx.db.query("channels").collect();
    const existingDM = allChannels.find(
      (c) =>
        c.type === "dm" &&
        c.participants &&
        c.participants.length === 2 &&
        c.participants.includes(userId) &&
        c.participants.includes(args.otherUserId),
    );

    if (existingDM) {
      return existingDM._id;
    }

    // Create new DM
    return await ctx.db.insert("channels", {
      name: "Direct Message",
      createdBy: userId,
      type: "dm",
      participants: [userId, args.otherUserId].sort(), // Sort for consistent ordering
    });
  },
});

export const get = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(args.channelId);
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const users = await ctx.db.query("users").collect();

    return await Promise.all(
      users
        .filter((user) => user._id !== userId)
        .map(async (user) => {
          const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

          let avatarUrl = null;
          if (profile?.avatarId) {
            avatarUrl = await ctx.storage.getUrl(profile.avatarId);
          }

          return {
            _id: user._id,
            email: user.email,
            displayName: profile?.displayName || user.email || "Unknown",
            avatarUrl,
          };
        }),
    );
  },
});

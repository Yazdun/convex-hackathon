import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get all channels
    const allChannels = await ctx.db.query("channels").collect();

    // Process all channels to have consistent structure
    const channelsWithUsers = await Promise.all(
      allChannels.map(async (channel) => {
        let users: {
          userId: Id<"users">;
          email: string | undefined;
          displayName: string;
          avatarUrl: string | null;
          avatarId: Id<"_storage"> | undefined;
          username: string | undefined;
        }[] = [];

        if (channel.type === "dm" && channel.participants?.includes(userId)) {
          // For DM channels, include all participants
          users = await Promise.all(
            channel.participants.map(async (participantId) => {
              const user = await ctx.db.get(participantId);
              const profile = await ctx.db
                .query("userProfiles")
                .withIndex("by_user", (q) => q.eq("userId", participantId))
                .first();

              let avatarUrl = null;
              if (profile?.avatarId) {
                avatarUrl = await ctx.storage.getUrl(profile.avatarId);
              }

              return {
                userId: participantId,
                email: user?.email,
                displayName: profile?.displayName || user?.email || "Unknown",
                avatarUrl,
                avatarId: profile?.avatarId,
                username: profile?.username,
              };
            }),
          );

          // Set DM name to the other user's display name
          const otherUserId = channel.participants?.find((id) => id !== userId);
          const otherUserInfo = users.find((u) => u.userId === otherUserId);

          return {
            ...channel,
            name: otherUserInfo?.displayName || "Unknown User",
            description: "Direct Message",
            isSubscribed: channel.participants.includes(userId),
            users,
          };
        } else if (!channel.type || channel.type === "channel") {
          // For regular channels
          if (channel.participants && channel.participants.length > 0) {
            users = await Promise.all(
              channel.participants.map(async (participantId) => {
                const user = await ctx.db.get(participantId);
                const profile = await ctx.db
                  .query("userProfiles")
                  .withIndex("by_user", (q) => q.eq("userId", participantId))
                  .first();

                let avatarUrl = null;
                if (profile?.avatarId) {
                  avatarUrl = await ctx.storage.getUrl(profile.avatarId);
                }

                return {
                  userId: participantId,
                  email: user?.email,
                  displayName: profile?.displayName || user?.email || "Unknown",
                  avatarUrl,
                  avatarId: profile?.avatarId,
                  username: profile?.username,
                };
              }),
            );
          }

          return {
            ...channel,
            isSubscribed: channel?.participants?.includes(userId) ?? false,
            users,
          };
        }

        return null; // Filter out channels that don't match criteria
      }),
    );

    // Filter out null values and return
    return channelsWithUsers.filter((channel) => channel !== null);
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
      participants: [userId],
    });
  },
});

export const subscribe = mutation({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const channel = await ctx.db.get(args.channelId);

    if (!channel) {
      throw new Error("Not authorized to edit this message");
    }

    if (channel.participants?.includes(userId)) {
      // User is already subscribed, so unsubscribe them
      await ctx.db.patch(args.channelId, {
        participants: channel.participants?.filter((id) => id !== userId),
      });
    } else {
      // User is not subscribed, so subscribe them
      await ctx.db.patch(args.channelId, {
        participants: [...(channel.participants || []), userId],
      });
    }
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

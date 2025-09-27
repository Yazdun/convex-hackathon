import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const getById = internalQuery({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.channelId);
  },
});

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

      // Get all announcements for this channel and remove them from user's inbox
      const [channelAnnouncements] = await Promise.all([
        ctx.db
          .query("announcements")
          .filter((q) => q.eq(q.field("channelId"), args.channelId))
          .collect(),
      ]);

      // Get all inbox entries for this user and these announcements
      const inboxEntries = await ctx.db
        .query("inboxes")
        .withIndex("by_target_user", (q) => q.eq("targetUserId", userId))
        .collect();

      const inboxEntriesToDelete = inboxEntries.filter((entry) =>
        channelAnnouncements.some(
          (announcement) => announcement._id === entry.announcementId,
        ),
      );

      // Remove announcements from inbox and unsubscribe user in parallel
      await Promise.all([
        ctx.db.patch(args.channelId, {
          participants: channel.participants?.filter((id) => id !== userId),
        }),
        ...inboxEntriesToDelete.map((entry) => ctx.db.delete(entry._id)),
      ]);
    } else {
      // User is not subscribed, so subscribe them

      // Get the latest announcement for this channel
      const [latestAnnouncement] = await Promise.all([
        ctx.db
          .query("announcements")
          .filter((q) => q.eq(q.field("channelId"), args.channelId))
          .order("desc")
          .first(),
      ]);

      // Subscribe user and add latest announcement to inbox if it exists
      const subscribePromise = ctx.db.patch(args.channelId, {
        participants: [...(channel.participants || []), userId],
      });

      if (latestAnnouncement) {
        // Check if user already has this announcement in their inbox
        const existingInboxEntry = await ctx.db
          .query("inboxes")
          .withIndex("by_target_user", (q) => q.eq("targetUserId", userId))
          .filter((q) =>
            q.eq(q.field("announcementId"), latestAnnouncement._id),
          )
          .first();

        if (!existingInboxEntry) {
          // Add latest announcement to user's inbox
          const addToInboxPromise = ctx.db.insert("inboxes", {
            targetUserId: userId,
            announcementId: latestAnnouncement._id,
            status: "delivered",
          });

          await Promise.all([subscribePromise, addToInboxPromise]);
        } else {
          await subscribePromise;
        }
      } else {
        await subscribePromise;
      }
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

export const deleteChannel = mutation({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Check permissions
    if (channel.type === "dm") {
      // For DMs, user must be a participant
      if (!channel.participants?.includes(userId)) {
        throw new Error("Not authorized to delete this channel");
      }
    } else {
      // For regular channels, user must be the owner
      if (channel.createdBy !== userId) {
        throw new Error("Not authorized to delete this channel");
      }
    }

    // Delete the channel
    await ctx.db.delete(args.channelId);
  },
});

export const update = mutation({
  args: {
    channelId: v.id("channels"),
    name: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // Check if user is the owner
    if (channel.createdBy !== userId) {
      throw new Error("Not authorized to edit this channel");
    }

    // Don't allow editing DM channels
    if (channel.type === "dm") {
      throw new Error("Cannot edit direct message channels");
    }

    // Update the channel
    await ctx.db.patch(args.channelId, {
      name: args.name,
      description: args.description,
      tags: args.tags,
    });

    return args.channelId;
  },
});

export const get = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const channel = await ctx.db.get(args.channelId);
    if (!channel) return null;

    let users: {
      userId: Id<"users">;
      email: string | undefined;
      displayName: string;
      avatarUrl: string | null;
      avatarId: Id<"_storage"> | undefined;
      username: string | undefined;
    }[] = [];

    // Get participant information if channel has participants
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

    // For DM channels, set name to other user's display name
    if (channel.type === "dm") {
      const otherUserId = channel.participants?.find((id) => id !== userId);
      const otherUserInfo = users.find((u) => u.userId === otherUserId);

      return {
        ...channel,
        name: otherUserInfo?.displayName || "Unknown User",
        description: "Direct Message",
        isOwner: userId === channel.createdBy,
        isSubscribed: channel.participants?.includes(userId) ?? false,
        users,
      };
    }

    return {
      ...channel,
      isOwner: userId === channel.createdBy,
      isSubscribed: channel.participants?.includes(userId) ?? false,
      users,
    };
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

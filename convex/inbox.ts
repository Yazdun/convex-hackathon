import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserInbox = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all inbox entries for the current user
    const inboxEntries = await ctx.db
      .query("inboxes")
      .withIndex("by_target_user", (q) => q.eq("targetUserId", userId))
      .collect();

    // Get announcement details for each inbox entry
    const inboxWithAnnouncements = await Promise.all(
      inboxEntries.map(async (inboxEntry) => {
        const announcement = await ctx.db.get(inboxEntry.announcementId);
        if (!announcement) {
          return null;
        }

        // Get creator profile
        const creatorProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", announcement.createdBy))
          .first();

        // Get channel information
        const channel = await ctx.db.get(announcement.channelId);

        return {
          _id: inboxEntry._id,
          _creationTime: inboxEntry._creationTime,
          status: inboxEntry.status,
          announcement: {
            ...announcement,
            creatorName: creatorProfile?.displayName || "Unknown User",
          },
          channel: channel
            ? {
                _id: channel._id,
                name: channel.name,
                description: channel.description,
                type: channel.type,
              }
            : null,
        };
      }),
    );

    // Filter out null entries and sort by creation time (newest first)
    return inboxWithAnnouncements
      .filter((entry) => entry !== null)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const toggleInboxStatus = mutation({
  args: {
    inboxId: v.id("inboxes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the inbox entry
    const inboxEntry = await ctx.db.get(args.inboxId);
    if (!inboxEntry) {
      throw new Error("Inbox entry not found");
    }

    // Verify the inbox entry belongs to the current user
    if (inboxEntry.targetUserId !== userId) {
      throw new Error("Not authorized to modify this inbox entry");
    }

    // Toggle the status
    const newStatus = inboxEntry.status === "read" ? "delivered" : "read";

    await ctx.db.patch(args.inboxId, {
      status: newStatus,
    });

    return {
      success: true,
      newStatus,
      inboxId: args.inboxId,
    };
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all unread inbox entries for the current user
    const unreadEntries = await ctx.db
      .query("inboxes")
      .withIndex("by_target_status", (q) =>
        q.eq("targetUserId", userId).eq("status", "delivered"),
      )
      .collect();

    // Update all unread entries to read
    const updatePromises = unreadEntries.map((entry) =>
      ctx.db.patch(entry._id, { status: "read" }),
    );

    await Promise.all(updatePromises);

    return {
      success: true,
      markedAsReadCount: unreadEntries.length,
    };
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Count unread entries for the current user
    const unreadEntries = await ctx.db
      .query("inboxes")
      .withIndex("by_target_status", (q) =>
        q.eq("targetUserId", userId).eq("status", "delivered"),
      )
      .collect();

    return unreadEntries.length;
  },
});

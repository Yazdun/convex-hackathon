import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    participants: v.array(v.id("users")),
    channelId: v.id("channels"),
    isWelcomeMessage: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Create the announcement
    const announcementId = await ctx.db.insert("announcements", {
      title: args.title,
      content: args.content,
      createdBy: userId,
      participants: args.participants,
      channelId: args.channelId,
      isWelcomeMessage: args.isWelcomeMessage,
    });

    // Create inbox entries for each participant
    const inboxPromises = args.participants.map((participantId) =>
      ctx.db.insert("inboxes", {
        targetUserId: participantId,
        announcementId,
        status: "delivered",
      }),
    );

    await Promise.all(inboxPromises);

    return announcementId;
  },
});

export const getById = query({
  args: { id: v.id("announcements") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const announcement = await ctx.db.get(args.id);
    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // Check if user is the creator or a participant
    const isCreator = announcement.createdBy === userId;
    const isParticipant = announcement.participants?.includes(userId);

    if (!isCreator && !isParticipant) {
      throw new Error("Not authorized to view this announcement");
    }

    return announcement;
  },
});

export const markAsRead = mutation({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Find the inbox entry for this user and announcement
    const inboxEntry = await ctx.db
      .query("inboxes")
      .withIndex("by_target_user", (q) => q.eq("targetUserId", userId))
      .filter((q) => q.eq(q.field("announcementId"), args.announcementId))
      .first();

    if (!inboxEntry) {
      throw new Error("Inbox entry not found");
    }

    // Update status to read
    await ctx.db.patch(inboxEntry._id, {
      status: "read",
    });

    return { success: true };
  },
});

import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Define the reaction types
type ReactionType =
  | "laugh"
  | "heart"
  | "thumbs_up"
  | "thumbs_down"
  | "shit"
  | "gem";

export const listInternal = internalQuery({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", message.authorId))
          .first();

        return {
          ...message,
          author: author?.email || "Unknown",
          displayName: profile?.displayName || author?.email || "Unknown",
          _creationTime: message._creationTime,
        };
      }),
    );
  },
});

export const getById = internalQuery({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const list = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("asc")
      .collect();

    // Get all reactions for all messages in batch
    const messageIds = messages.map((m) => m._id);
    const allReactions = await Promise.all(
      messageIds.map((messageId) =>
        ctx.db
          .query("reactions")
          .withIndex("by_message", (q) => q.eq("messageId", messageId))
          .collect(),
      ),
    );

    // Define reaction types
    const REACTION_TYPES = [
      "laugh",
      "heart",
      "thumbs_up",
      "thumbs_down",
      "shit",
      "gem",
    ] as const;

    // Process reactions for each message
    const reactionsByMessage: Record<
      string,
      Array<{
        reactionType: ReactionType;
        hasCurrentUser: boolean;
        count: number;
      }>
    > = {};

    messageIds.forEach((messageId, index) => {
      const reactions = allReactions[index];
      const reactionCounts: Record<
        ReactionType,
        { count: number; hasCurrentUser: boolean }
      > = Object.fromEntries(
        REACTION_TYPES.map((type) => [
          type,
          { count: 0, hasCurrentUser: false },
        ]),
      ) as Record<ReactionType, { count: number; hasCurrentUser: boolean }>;

      // Process reactions for this message
      reactions.forEach((reaction) => {
        if (!reactionCounts[reaction.reactionType]) {
          reactionCounts[reaction.reactionType] = {
            count: 0,
            hasCurrentUser: false,
          };
        }
        reactionCounts[reaction.reactionType].count++;
        if (userId && reaction.userId === userId) {
          reactionCounts[reaction.reactionType].hasCurrentUser = true;
        }
      });

      // Convert to array format
      reactionsByMessage[messageId] = REACTION_TYPES.map((type) => ({
        reactionType: type,
        hasCurrentUser: reactionCounts[type].hasCurrentUser,
        count: reactionCounts[type].count,
      }));
    });

    return await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", message.authorId))
          .first();

        let avatarUrl = null;
        if (profile?.avatarId) {
          avatarUrl = await ctx.storage.getUrl(profile.avatarId);
        }

        let fileUrl = null;
        if (message.fileId) {
          fileUrl = await ctx.storage.getUrl(message.fileId);
        }

        // Get parent message if this is a reply
        let parentMessage = null;
        if (message.parentMessageId) {
          const parent = await ctx.db.get(message.parentMessageId);
          if (parent) {
            const parentAuthor = await ctx.db.get(parent.authorId);
            const parentProfile = await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", parent.authorId))
              .first();

            let parentProfileAvatarUrl = null;
            if (parentProfile?.avatarId) {
              parentProfileAvatarUrl = await ctx.storage.getUrl(
                parentProfile.avatarId,
              );
            }

            parentMessage = {
              _id: parent._id,
              content: parent.content,
              type: parent.type,
              authorDisplayName:
                parentProfile?.displayName || parentAuthor?.email || "Unknown",
              avatarUrl: parentProfileAvatarUrl,
              _creationTime: parent._creationTime,
            };
          }
        }

        return {
          ...message,
          author: author?.email || "Unknown",
          displayName: profile?.displayName || author?.email || "Unknown",
          avatarUrl,
          fileUrl,
          isOwner: userId === author?._id,
          parentMessage,
          reactions: reactionsByMessage[message._id] || [],
        };
      }),
    );
  },
});

export const send = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("audio")),
    fileId: v.optional(v.id("_storage")),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: userId,
      content: args.content,
      type: args.type,
      fileId: args.fileId,
      parentMessageId: args.parentMessageId,
    });
  },
});

export const edit = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message || message.authorId !== userId) {
      throw new Error("Not authorized to edit this message");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message || message.authorId !== userId) {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.delete(args.messageId);
  },
});

export const search = query({
  args: {
    query: v.string(),
    channelId: v.optional(v.id("channels")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (!args.query.trim()) return [];

    const searchQuery = ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.query),
      );

    const results = args.channelId
      ? await searchQuery
          .filter((q) => q.eq(q.field("channelId"), args.channelId))
          .take(20)
      : await searchQuery.take(20);

    return await Promise.all(
      results.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        const channel = await ctx.db.get(message.channelId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", message.authorId))
          .first();

        return {
          ...message,
          author: author?.email || "Unknown",
          displayName: profile?.displayName || author?.email || "Unknown",
          channelName: channel?.name || "Unknown",
        };
      }),
    );
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

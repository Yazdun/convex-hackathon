import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const reactionTypeValidator = v.union(
  v.literal("laugh"),
  v.literal("heart"),
  v.literal("thumbs_up"),
  v.literal("thumbs_down"),
  v.literal("shit"),
  v.literal("gem"),
);

// Toggle a reaction (add if doesn't exist, remove if exists)
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    reactionType: reactionTypeValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if message exists
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Check if user already has this reaction type on this message
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId),
      )
      .filter((q) => q.eq(q.field("reactionType"), args.reactionType))
      .first();

    if (existing) {
      // Remove the reaction if it already exists
      await ctx.db.delete(existing._id);
      return { action: "removed", reactionType: args.reactionType };
    } else {
      // Add the new reaction
      const reactionId = await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId,
        reactionType: args.reactionType,
      });
      return { action: "added", reactionType: args.reactionType, reactionId };
    }
  },
});

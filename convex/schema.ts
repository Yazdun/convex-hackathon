import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    avatarId: v.optional(v.id("_storage")),
    type: v.optional(v.union(v.literal("channel"), v.literal("dm"))),
    participants: v.optional(v.array(v.id("users"))),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_name", ["name"])
    .index("by_type", ["type"])
    .index("by_participants", ["participants"]),

  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("audio")),
    fileId: v.optional(v.id("_storage")),
    parentMessageId: v.optional(v.id("messages")),
    editedAt: v.optional(v.number()),
  })
    .index("by_channel", ["channelId"])
    .index("by_parent", ["parentMessageId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["channelId"],
    }),

  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    username: v.optional(v.string()),
    avatarId: v.optional(v.id("_storage")),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    reactionType: v.union(
      v.literal("laugh"),
      v.literal("heart"),
      v.literal("thumbs_up"),
      v.literal("thumbs_down"),
      v.literal("shit"),
      v.literal("gem"),
    ),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"])
    .index("by_message_user", ["messageId", "userId"])
    .index("by_message_reaction", ["messageId", "reactionType"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

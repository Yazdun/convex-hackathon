import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { components, internal } from "./_generated/api";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { agent } from "./agents/simple";
import { paginationOptsValidator } from "convex/server";
import { authorizeThreadAccess } from "./threads";
import { listMessages, vStreamArgs } from "@convex-dev/agent";

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const { threadId, paginationOpts } = args;
    await authorizeThreadAccess(ctx, threadId);
    const messages = await listMessages(ctx, components.agent, {
      threadId,
      paginationOpts,
    });

    const streams = await agent.syncStreams(ctx, {
      threadId,
      streamArgs: args.streamArgs,
    });

    // You could add more fields here, join with other tables, etc.
    return { ...messages, streams };
  },
});

export const createThread = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { threadId } = await agent.createThread(ctx, {
      userId,
    });

    return threadId;
  },
});

export const sendMessageToAgent = action({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const { thread } = await agent.continueThread(ctx, {
      threadId: args.threadId,
    });
    const result = await thread.generateText({ prompt: args.prompt });
    return result.text;
  },
});

export const summarizeChannelMessages = action({
  args: {
    channelId: v.id("channels"),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch all messages from the channel
    const messages: Array<
      Doc<"messages"> & {
        author: string;
        displayName: string;
        _creationTime: number;
      }
    > = await ctx.runQuery(internal.messages.listInternal, {
      channelId: args.channelId,
    });

    if (!messages || messages.length === 0) {
      return "No messages found in this channel to summarize.";
    }

    // Format messages for AI consumption
    const formattedMessages = messages
      .map((msg) => {
        const timestamp = new Date(msg._creationTime).toLocaleString();
        const author = msg.displayName || msg.author;
        return `[${timestamp}] ${author}: ${msg.content}`;
      })
      .join("\n");

    // Create summarization prompt
    const prompt = `Please summarize the following chat conversation in one paragraph. Focus on the main topics discussed, key decisions made, and important information shared. Here are the messages:

${formattedMessages}

Please provide a concise summary in one paragraph that captures the essence of this conversation.`;

    // Get AI summary
    const { thread } = await agent.continueThread(ctx, {
      threadId: args.threadId,
    });

    const result = await thread.streamText(
      { prompt },
      { saveStreamDeltas: true },
    );

    return result.consumeStream();
  },
});

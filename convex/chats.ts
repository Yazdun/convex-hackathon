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

export const generateAnnouncement = action({
  args: {
    prompt: v.string(),
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get channel data using internal query
    const channel: Doc<"channels"> | null = await ctx.runQuery(
      internal.channels.getById,
      {
        channelId: args.channelId,
      },
    );

    if (!channel) throw new Error("Channel not found");

    const { threadId } = await agent.createThread(ctx, {
      userId,
    });

    const { thread } = await agent.continueThread(ctx, {
      threadId: threadId,
    });

    const enhancedPrompt: string = `Based on this request: "${args.prompt}"

Channel Context:
- Channel Name: "${channel.name}"
- Channel Description: "${channel.description || "No description provided"}"

Generate an announcement with both a title and description that fits the context and purpose of this channel. Return your response in this exact JSON format:

{
  "title": "Your announcement title here",
  "description": "Your announcement description here"
}

Requirements:
- Title should be concise, engaging, and under 60 characters
- Description should be informative, welcoming, and 1-2 sentences
- Both should match the tone and purpose of the original request
- Return only the JSON object, no additional text

IMPORTANT: Respond with valid JSON only.`;

    const result = await thread.generateText({ prompt: enhancedPrompt });

    try {
      const parsedResult = JSON.parse(result.text);
      return {
        title: parsedResult.title || "Welcome!",
        description:
          parsedResult.description || "Join our community and start engaging!",
      };
    } catch (error) {
      console.log(error);
      return {
        title: "Failed to generate the title!",
        description: result.text || "Failed to generate the description",
      };
    }
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

    // Check for insufficient context scenarios
    if (!messages || messages.length === 0) {
      const { thread } = await agent.continueThread(ctx, {
        threadId: args.threadId,
      });

      const result = await thread.streamText(
        {
          prompt: `This channel contains no messages yet. Provide a direct response explaining that:

1. There is no conversation history to analyze
2. This represents an opportunity for newcomers to be early contributors
3. They can help establish the community's tone and discussion patterns

IMPORTANT: Be concise and straightforward. Focus on the fact that the channel is new and ready for fresh conversations.

Provide your response in 2-3 sentences without being overly promotional.

          IMPORTANT: avoid em dashes, never ever use em dashes
          `,
        },
        {
          saveStreamDeltas: {
            chunking: "word",
          },
        },
      );

      return result.consumeStream();
    }

    // Check minimum message count
    const MIN_MESSAGES = 10;
    if (messages.length < MIN_MESSAGES) {
      const { thread } = await agent.continueThread(ctx, {
        threadId: args.threadId,
      });

      const result = await thread.streamText(
        {
          prompt: `This channel contains only ${messages.length} messages. Provide a direct response explaining that:

1. The conversation history is insufficient to determine community patterns
2. More messages are needed to understand typical interaction styles
3. The limited activity suggests the community is still developing

IMPORTANT: Be straightforward about the limitations while noting the growth potential.

Provide your response in 2-3 sentences focusing on the need for more conversation history.

          IMPORTANT: avoid em dashes, never ever use em dashes
          `,
        },
        {
          saveStreamDeltas: {
            chunking: "word",
          },
        },
      );

      return result.consumeStream();
    }

    // Check content depth
    const totalContentLength = messages.reduce(
      (sum, msg) => sum + msg.content.length,
      0,
    );
    const MIN_TOTAL_CONTENT_LENGTH = 500;
    if (totalContentLength < MIN_TOTAL_CONTENT_LENGTH) {
      const { thread } = await agent.continueThread(ctx, {
        threadId: args.threadId,
      });

      const result = await thread.streamText(
        {
          prompt: `This channel has ${messages.length} messages but with limited content depth (${totalContentLength} total characters). Provide a direct response explaining that:

1. The conversations are too brief to analyze community patterns
2. More substantial discussions are needed for meaningful insights
3. The short messages may indicate preference for quick exchanges

IMPORTANT: Be clear about why the content is insufficient for analysis.

Provide your response in 2-3 sentences focusing on the need for more detailed conversations.

          IMPORTANT: avoid em dashes, never ever use em dashes
          `,
        },
        {
          saveStreamDeltas: {
            chunking: "word",
          },
        },
      );

      return result.consumeStream();
    }

    // Check author diversity
    const uniqueAuthors = new Set(messages.map((msg) => msg.authorId)).size;
    console.log(uniqueAuthors);
    const MIN_UNIQUE_AUTHORS = 2;
    if (uniqueAuthors < MIN_UNIQUE_AUTHORS) {
      const { thread } = await agent.continueThread(ctx, {
        threadId: args.threadId,
      });

      const result = await thread.streamText(
        {
          prompt: `This channel shows conversations from only ${uniqueAuthors} unique ${uniqueAuthors === 1 ? "person" : "people"}. Provide a direct response explaining that:

1. Community dynamics require multiple participants to analyze
2. Interaction patterns between different members are needed for insights
3. More diverse participation would enable better community assessment

IMPORTANT: Be clear about why multiple voices are necessary for analysis.

Provide your response in 2-3 sentences focusing on the need for diverse participation.

          IMPORTANT: avoid em dashes, never ever use em dashes
          `,
        },
        {
          saveStreamDeltas: {
            chunking: "word",
          },
        },
      );

      return result.consumeStream();
    }

    // Check time span
    const oldestMessage = Math.min(...messages.map((msg) => msg._creationTime));
    const newestMessage = Math.max(...messages.map((msg) => msg._creationTime));
    const timeSpanHours = (newestMessage - oldestMessage) / (1000 * 60 * 60);
    if (timeSpanHours < 1 && messages.length < 20) {
      const { thread } = await agent.continueThread(ctx, {
        threadId: args.threadId,
      });

      const result = await thread.streamText(
        {
          prompt: `This channel has ${messages.length} messages spanning only ${Math.round(timeSpanHours * 10) / 10} hours. Provide a direct response explaining that:

1. The conversation timeframe is too brief to analyze community patterns
2. Observing interactions over a longer period is necessary for insights
3. This appears to be recent activity that needs more time to develop

IMPORTANT: Be clear about why a longer observation period is needed.

Provide your response in 2-3 sentences focusing on the need for extended conversation history.`,
        },
        {
          saveStreamDeltas: {
            chunking: "word",
          },
        },
      );

      return result.consumeStream();
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
    const prompt = `Analyze the following chat conversation and provide a concise overview of this community channel. Focus on:

1. Main topics and themes discussed
2. Overall tone and atmosphere (professional, casual, supportive, technical, etc.)
3. Types of discussions and conversations
4. Community engagement level
5. Environment for new members

IMPORTANT: Keep the response general - don't mention specific usernames, personal details, or quote exact conversations. Provide a straightforward summary of the community's character. Never use em dashes or first-person language.

Here are the messages:

${formattedMessages}

Provide a brief, direct overview of what newcomers can expect from this community in one concise paragraph.`;

    // Get AI summary
    const { thread } = await agent.continueThread(ctx, {
      threadId: args.threadId,
    });

    const result = await thread.streamText(
      { prompt },
      {
        saveStreamDeltas: {
          chunking: "word",
        },
      },
    );

    return result.consumeStream();
  },
});

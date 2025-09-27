import { type Config } from "@convex-dev/agent";
import { rawRequestResponseHandler } from "../debugging/rawRequestResponseHandler";
import { openai } from "@ai-sdk/openai";

export const defaultConfig = {
  rawRequestResponseHandler,
  callSettings: {
    temperature: 1.0,
  },
  // If you want to use vector search, you need to set this.
  languageModel: openai.chat("gpt-4o-mini"),
  textEmbeddingModel: openai.textEmbeddingModel("text-embedding-3-small"),
} satisfies Config;

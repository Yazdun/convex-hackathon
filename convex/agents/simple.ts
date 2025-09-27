import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { components } from "../_generated/api";

export const agent = new Agent(components.agent, {
  name: "chat-agent",
  languageModel: openai.chat("gpt-4o-mini"),
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  instructions: "You are a weather forecaster.",
  maxSteps: 3,
});

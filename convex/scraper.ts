"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Firecrawl } from "@mendable/firecrawl-js";
import { agent } from "./agents/simple";
import { getAuthUserId } from "@convex-dev/auth/server";

const firecrawl = new Firecrawl({
  apiKey: "fc-dd2df99c4f374309bce7fc750dbc8d05",
});

// Type definitions based on actual Firecrawl response
interface FirecrawlMetadata {
  title?: string;
  description?: string;
  "twitter:card"?: string;
  "twitter:description"?: string;
  "twitter:image"?: string;
  "twitter:title"?: string;
  ogDescription?: string;
  ogImage?: string;
  "og:title"?: string;
  "og:image"?: string;
  "og:description"?: string;
  keywords?: string;
  robots?: string;
  googlebot?: string;
  viewport?: string;
  language?: string;
  ogTitle?: string;
  favicon?: string;
  scrapeId?: string;
  sourceURL?: string;
  url?: string;
  statusCode?: number;
  contentType?: string;
  proxyUsed?: string;
  cacheState?: string;
  cachedAt?: string;
  creditsUsed?: number;
  author?: string;
  ogSiteName?: string;
  [key: string]: string | number | boolean | undefined;
}

// The actual Firecrawl response structure (not wrapped in success/data)
interface FirecrawlData {
  markdown: string;
  metadata: FirecrawlMetadata;
}

interface ScrapeSuccessResult {
  url: string;
  success: true;
  data: {
    original: FirecrawlData;
    summary: string | null;
    threadId: string;
    metadata: {
      title?: string;
      description?: string;
      author?: string;
      siteName?: string;
      contentType?: string;
      language?: string;
    };
  };
}

interface ScrapeErrorResult {
  url: string;
  success: false;
  error: string;
}

type ScrapeResult = ScrapeSuccessResult | ScrapeErrorResult;

export const scrapeAndSummarizeUrls = action({
  args: {
    urls: v.array(v.string()),
  },
  handler: async (ctx, { urls }): Promise<ScrapeResult[]> => {
    const results: ScrapeResult[] = [];

    // Get user ID once for all operations
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    for (const url of urls) {
      try {
        // Scrape the URL - response is directly the data object
        const scrapeResponse = (await firecrawl.scrape(url, {
          formats: ["markdown"],
        })) as FirecrawlData;

        console.log("DATA IS:", scrapeResponse);

        if (!scrapeResponse.markdown || !scrapeResponse.metadata) {
          const errorResult: ScrapeErrorResult = {
            url,
            success: false,
            error: "Failed to scrape content - no markdown or metadata",
          };
          results.push(errorResult);
          continue;
        }

        // Create a thread for AI summarization
        const { threadId } = await agent.createThread(ctx, {
          userId,
        });

        // Extract content and metadata
        const content: string = scrapeResponse.markdown || "";
        const metadata: FirecrawlMetadata = scrapeResponse.metadata || {};

        // Generate AI summary
        let summary: string | null = null;
        try {
          const { thread } = await agent.continueThread(ctx, {
            threadId,
          });

          const prompt = `Please analyze and summarize the following web content from ${url}:

TITLE: ${metadata.title || "No title available"}
DESCRIPTION: ${metadata.description || metadata.ogDescription || metadata["twitter:description"] || "No description available"}

CONTENT:
${content.slice(0, 10000)}

Please provide a comprehensive summary that includes:
1. Main topic and purpose of the content
2. Key points or insights
3. Target audience
4. Overall value and relevance

Keep the summary concise but informative, focusing on the most important aspects that would help someone understand what this content is about and whether it's relevant to their interests.`;

          const result = await thread.generateText({ prompt });
          summary = result.text;
        } catch (summaryError) {
          console.error("Failed to generate summary:", summaryError);
          summary = "Summary generation failed";
        }

        const successResult: ScrapeSuccessResult = {
          url,
          success: true,
          data: {
            original: scrapeResponse,
            summary,
            threadId,
            metadata: {
              title: metadata.title,
              description:
                metadata.description ||
                metadata.ogDescription ||
                metadata["twitter:description"],
              author: metadata.author,
              siteName: metadata.ogSiteName,
              contentType: metadata.contentType,
              language: metadata.language,
            },
          },
        };

        results.push(successResult);
      } catch (error) {
        const errorResult: ScrapeErrorResult = {
          url,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
        results.push(errorResult);
      }
    }

    return results;
  },
});

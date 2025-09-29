// Type definitions based on actual Firecrawl response
export interface FirecrawlMetadata {
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
export interface FirecrawlData {
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

export type ScrapeResult = ScrapeSuccessResult | ScrapeErrorResult;

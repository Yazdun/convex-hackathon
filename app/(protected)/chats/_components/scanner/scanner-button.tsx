import { Button } from "@/components/ui/button";
import { Scan, Loader2, ExternalLink } from "lucide-react";
import React, { useState } from "react";
import { useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IMessage } from "../types/types";
import { ScrapeResult } from "./types";

// Function to extract URLs from message content
const extractUrlsFromMessage = (message: IMessage): string[] => {
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const matches = message.content.match(urlRegex);
  return matches
    ? matches.filter((url, index, self) => self.indexOf(url) === index)
    : [];
};

export function ScannerButton({ message }: { message: IMessage }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);

  const scrapeAction = useAction(api.scraper?.scrapeAndSummarizeUrls);

  const handleScan = async () => {
    const extractedUrls = extractUrlsFromMessage(message);

    if (!extractedUrls || extractedUrls.length === 0) {
      toast.error("No URLs found in this message to scan");
      return;
    }

    const validUrls = extractedUrls.filter((url) => url.trim() !== "");

    if (validUrls.length === 0) {
      toast.error("Please provide valid URLs to scan");
      return;
    }

    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/;
    const invalidUrls = validUrls.filter((url) => !urlPattern.test(url));

    if (invalidUrls.length > 0) {
      toast.error(
        "Please enter valid URLs (must start with http:// or https://)",
      );
      return;
    }

    setIsLoading(true);

    try {
      const scanResults = await scrapeAction({ urls: validUrls });
      setResults(scanResults);
      setIsSheetOpen(true);

      const successCount = scanResults.filter(
        (r: ScrapeResult) => r.success,
      ).length;
      const errorCount = scanResults.filter(
        (r: ScrapeResult) => !r.success,
      ).length;

      if (errorCount === 0) {
        toast.success(`Successfully scanned ${successCount} URLs`, {
          position: "bottom-right",
        });
      } else {
        toast.warning(
          `Scanned ${successCount} URLs successfully, ${errorCount} failed`,
          {
            position: "bottom-right",
          },
        );
      }
    } catch (error) {
      console.error("Scraping error:", error);
      toast.error("Failed to scan URLs. Please try again.", {
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="flex items-center justify-baseline"
        onClick={handleScan}
        disabled={isLoading || extractUrlsFromMessage(message).length === 0}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Scan />}
        {isLoading ? (
          <div>
            <span>Scanning...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>Scan URLs</span>
            <div className="w-6 text-black rounded-full h-6 flex items-center justify-center font-mono bg-destructive">
              {extractUrlsFromMessage(message).length}
            </div>
          </div>
        )}
      </Button>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Scan Results</SheetTitle>
            <SheetDescription>
              AI-powered analysis and summaries of scanned URLs
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-screen">
            <div>
              {results.map((result, index) => (
                <div
                  key={index}
                  className="border-t border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex w-full items-center gap-2">
                      <Badge
                        variant={result.success ? "secondary" : "destructive"}
                      >
                        {result.success ? "Success" : "Failed"}
                      </Badge>

                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline underline-offset-2 hover:opacity-80 transition-all flex items-center gap-1"
                      >
                        <ExternalLink size={18} className="mt-0.5" />
                        {result.url}
                      </a>
                    </div>
                  </div>

                  {result.success && result.data ? (
                    <div>
                      {result.data.metadata && (
                        <div className="flex flex-col gap-2">
                          {result.data.metadata.title && (
                            <div>
                              <h3 className="font-semibold text-lg">
                                {result.data.metadata.title}
                              </h3>
                              {result.data.metadata.description && (
                                <p className="">
                                  {result.data.metadata.description}
                                </p>
                              )}
                            </div>
                          )}
                          {result.data.summary && (
                            <>
                              <p className="text-sm text-muted-foreground">
                                {result.data.summary}
                              </p>
                            </>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            {result.data.metadata.author && (
                              <Badge variant="outline">
                                Author: {result.data.metadata.author}
                              </Badge>
                            )}
                            {result.data.metadata.siteName && (
                              <Badge variant="outline">
                                {result.data.metadata.siteName}
                              </Badge>
                            )}
                            {result.data.metadata.language && (
                              <Badge variant="outline">
                                {result.data.metadata.language}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-destructive">
                      Unknown error occurred
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

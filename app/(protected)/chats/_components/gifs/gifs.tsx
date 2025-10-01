"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Input } from "@/components/ui/input";
import type { IGif } from "@giphy/js-types";
import { useChat } from "../providers/chat-provider";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface GifsProps {
  width?: number;
  columns?: number;
  onSuccess: () => void;
}

export const Gifs: React.FC<GifsProps> = ({
  onSuccess,
  width = 800,
  columns = 4,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { scrollToBottomIfAtBottom, replyingTo, setReplyingTo, channelId } =
    useChat();
  const sendMessage = useMutation(api.messages.send);

  // Initialize Giphy Fetch with API key
  const gf = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY!;
    return new GiphyFetch(apiKey);
  }, []);

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch function for trending GIFs
  const fetchTrendingGifs = useCallback(
    (offset: number) => {
      if (!gf) return Promise.resolve({ data: [], pagination: {} });
      return gf.trending({ offset, limit: 20 });
    },
    [gf],
  );

  // Fetch function for search results
  const fetchSearchGifs = useCallback(
    (offset: number) => {
      if (!gf || !debouncedSearchTerm.trim()) {
        return Promise.resolve({ data: [], pagination: {} });
      }
      return gf.search(debouncedSearchTerm, { offset, limit: 20 });
    },
    [gf, debouncedSearchTerm],
  );

  // Determine which fetch function to use
  const fetchGifs = debouncedSearchTerm.trim()
    ? fetchSearchGifs
    : fetchTrendingGifs;

  const handleSendMessage = async (gif: IGif) => {
    if (!gif) return;

    if (!channelId) {
      toast.error("Missing message id!");
      return;
    }

    try {
      await sendMessage({
        channelId,
        content: `${gif.images.fixed_width.url}\n${gif.images.fixed_width.width}\n${gif.images.fixed_width.height}`,
        type: "image",
        parentMessageId: replyingTo?._id,
      });
      scrollToBottomIfAtBottom();
      setReplyingTo(undefined);
      onSuccess();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle GIF click
  const onGifClick = (
    gif: IGif,
    e: React.SyntheticEvent<HTMLElement, Event>,
  ) => {
    e.preventDefault();
    handleSendMessage(gif);
  };

  return (
    <div className={`w-full grid gap-2`}>
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for GIFs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Search Status */}
      {debouncedSearchTerm && (
        <div className="text-sm text-muted-foreground">
          Searching for {debouncedSearchTerm}...
        </div>
      )}

      {!debouncedSearchTerm && (
        <div className="text-sm text-muted-foreground">
          Showing trending GIFs
        </div>
      )}

      {/* Giphy Grid Component */}
      <div
        className="overflow-y-auto pr-2 scrollbar scrollbar-thumb-black dark:scrollbar-thumb-white  scrollbar-track-popover"
        style={{ maxHeight: "60vh" }}
      >
        <Grid
          key={debouncedSearchTerm}
          width={width}
          columns={columns}
          //@ts-expect-error error eh
          fetchGifs={
            gf
              ? fetchGifs
              : () =>
                  Promise.resolve({
                    data: [],
                    pagination: {},
                    meta: { status: 200, msg: "OK", response_id: "" },
                  })
          }
          onGifClick={onGifClick}
          noResultsMessage={
            debouncedSearchTerm
              ? `No GIFs found for "${debouncedSearchTerm}"`
              : "No trending GIFs available"
          }
          className="giphy-grid"
        />
      </div>

      {/* Custom CSS for responsive grid */}
      <style jsx>{`
        :global(.giphy-grid) {
          width: 100% !important;
        }

        @media (max-width: 640px) {
          :global(.giphy-grid) {
            columns: 2 !important;
          }
        }

        @media (max-width: 480px) {
          :global(.giphy-grid) {
            columns: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

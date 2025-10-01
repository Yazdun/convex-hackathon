import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React, { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Loader2, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { IChannel } from "../types/types";
import { MarkdownFormatter } from "../markdown/mdx";
import { motionConfig } from "./motion";
import { ChannelSkeletonCard } from "./skeleton";
import { Subscribe } from "./subscribe";
import { AssistantContainer } from "../assistant/assistant";
import { useAssistant } from "../assistant/assistant-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryState } from "nuqs";
import Image from "next/image";
import chikaGif from "./assets/chika.gif";

export function ChatsList() {
  const channels = useQuery(api.channels.list);
  const [showLoading, setShowLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useQueryState("search", {
    defaultValue: "",
  });
  const [sortBy, setSortBy] = useQueryState("sort", {
    defaultValue: "oldest" as const,
    parse: (value) =>
      value as "newest" | "oldest" | "most-subscribers" | "least-subscribers",
    serialize: (value) => value,
  });
  const [subscriptionFilter, setSubscriptionFilter] = useQueryState("filter", {
    defaultValue: "all" as const,
    parse: (value) => value as "all" | "subscribed" | "not-subscribed",
    serialize: (value) => value,
  });

  const filteredAndSortedChannels = useMemo(() => {
    if (!channels) return [];

    // Filter by search term
    let filtered = channels.filter((channel) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = channel.name.toLowerCase().includes(searchLower);
      const descriptionMatch =
        channel.description?.toLowerCase().includes(searchLower) || false;
      return nameMatch || descriptionMatch;
    });

    // Filter by subscription status
    if (subscriptionFilter === "subscribed") {
      filtered = filtered.filter((channel) => channel.isSubscribed);
    } else if (subscriptionFilter === "not-subscribed") {
      filtered = filtered.filter((channel) => !channel.isSubscribed);
    }

    // Sort channels
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "most-subscribers":
          return b.users.length - a.users.length;
        case "least-subscribers":
          return a.users.length - b.users.length;
        case "oldest":
          return a._creationTime - b._creationTime;
        case "newest":
        default:
          return b._creationTime - a._creationTime;
      }
    });

    return filtered;
  }, [channels, searchTerm, sortBy, subscriptionFilter]);

  useEffect(() => {
    if (channels === undefined) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [channels]);

  if (channels === undefined && showLoading) {
    return (
      <div className="p-2.5 grid gap-2.5">
        {/* Search and Filter Controls Skeleton */}
        <div className="flex items-center gap-2 py-2">
          <div className="relative w-full">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[130px]" />
            <Skeleton className="h-10 w-[170px]" />
          </div>
        </div>

        {Array.from({ length: 5 }).map((_, index) => (
          <ChannelSkeletonCard key={index} idx={index} />
        ))}
      </div>
    );
  }

  if (!channels) {
    return null;
  }

  return (
    <div className="p-2.5 grid gap-2.5">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-2 py-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={subscriptionFilter}
            onValueChange={(value) =>
              setSubscriptionFilter(
                value as "all" | "subscribed" | "not-subscribed",
              )
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by subscription" />
            </SelectTrigger>
            <SelectContent align="center">
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="subscribed">Subscribed</SelectItem>
              <SelectItem value="not-subscribed">Not Subscribed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(
                value as
                  | "newest"
                  | "oldest"
                  | "most-subscribers"
                  | "least-subscribers",
              )
            }
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent align="center">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-subscribers">Most Subscribers</SelectItem>
              <SelectItem value="least-subscribers">
                Least Subscribers
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}

      <AnimatePresence mode="sync">
        {filteredAndSortedChannels.length === 0 ? (
          <motion.div
            key="no-result-found"
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: 0.4, duration: 0.3 },
            }}
            exit={{ opacity: 0, y: -15, transition: { delay: 0.2 } }}
            transition={{ duration: 0.3 }}
            className="text-center flex flex-col items-center gap-2 py-8 border font-mono px-4 text-sm text-muted-foreground"
          >
            <Image
              src={chikaGif}
              alt="Chika dancing"
              width={100}
              height={100}
              unoptimized
            />

            {searchTerm ? (
              <p>No channels found matching &ldquo;{searchTerm}&rdquo;</p>
            ) : (
              <p>No channel found matching current filters</p>
            )}
          </motion.div>
        ) : null}
        {filteredAndSortedChannels.map((channel) => {
          return (
            <motion.div layout key={channel._id} {...motionConfig}>
              <ChannelPreviewCard key={channel._id} channel={channel} />
            </motion.div>
          );
        })}
      </AnimatePresence>
      <AssistantContainer />
    </div>
  );
}

export function ChannelPreviewCard({ channel }: { channel: IChannel }) {
  const { currentChannelId } = useAssistant();
  const renderSubscribers = () => {
    if (!channel.users.length) {
      return "No Subscribers";
    }

    if (channel.users.length === 1) {
      return "1 Subscriber";
    }

    return `${channel.users.length} Subscribers`;
  };
  return (
    <div
      className={cn(
        "p-5 relative bg-card/20 border w-full group grid gap-2 hover:bg-secondary/20 transition-all rounded-lg",
        currentChannelId === channel._id &&
          "border-destructive ring ring-destructive bg-destructive/10 hover:bg-destructive/20",
      )}
    >
      {!channel.isSubscribed ? <ChatSummary channelId={channel._id} /> : null}

      <div className="text-left grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg">{channel.name}</h2>
        </div>
        <MarkdownFormatter
          className="whitespace-pre-wrap text-muted-foreground"
          text={channel.description ?? ""}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm">{renderSubscribers()}</p>
        <div className="flex items-center gap-3">
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            {channel.users.slice(0, 4).map((u) => {
              return (
                <Avatar key={u.userId}>
                  <AvatarImage
                    src={u.avatarUrl ?? undefined}
                    alt={u.displayName}
                  />
                  <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
              );
            })}
            {channel.users.length > 4 ? (
              <Avatar>
                <AvatarImage src={undefined} alt={``} />
                <AvatarFallback>+{channel.users.length - 4}</AvatarFallback>
              </Avatar>
            ) : null}
          </div>
          <Subscribe channel={channel} />
        </div>
      </div>
    </div>
  );
}

function ChatSummary({ channelId }: { channelId: string }) {
  const [open] = useState(false);
  const { summarizeChannelHistory, currentChannelId } = useAssistant();
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await summarizeChannelHistory({ channelId });
    } catch (error) {
      console.error("Failed to summarize channel history:", error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentChannel = currentChannelId === channelId;
  const isDisabled = loading || isCurrentChannel;

  return (
    <div
      className={cn(
        "absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all",
        open && "opacity-100",
        isCurrentChannel && "opacity-100",
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            variant={"ghost"}
            size="icon"
            disabled={isDisabled}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className={cn(isCurrentChannel && "opacity-50")} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Summarize Activities</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

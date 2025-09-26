import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { IChannel } from "../types/types";
import { MarkdownFormatter } from "../markdown/mdx";
import { motionConfig } from "./motion";
import { ChannelSkeletonCard } from "./skeleton";
import { Subscribe } from "./subscribe";
import { AssistantContainer } from "../assistant/assistant";
import { useAssistant } from "../assistant/assistant-provider";

export function ChatsList() {
  const channels = useQuery(api.channels.list);
  const [showLoading, setShowLoading] = useState(false);

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
      {channels.map((channel) => {
        return (
          <motion.div key={channel._id} {...motionConfig}>
            <ChannelPreviewCard key={channel._id} channel={channel} />
          </motion.div>
        );
      })}
      <AssistantContainer />
    </div>
  );
}

export function ChannelPreviewCard({ channel }: { channel: IChannel }) {
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
    <div className="p-5 relative border w-full group grid gap-2 hover:bg-secondary/20 transition-all rounded-lg">
      <ChatSummary />

      <div className="text-left grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg">#{channel.name}</h2>
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

function ChatSummary() {
  const [open] = useState(false);
  const createThread = useMutation(api.chats.createThread);
  const { setThreadId } = useAssistant();

  return (
    <div
      className={cn(
        "absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all",
        open && "opacity-100",
      )}
    >
      <Button
        onClick={async () => {
          createThread().then(setThreadId);
        }}
        variant={open ? "secondary" : "ghost"}
        size="icon"
      >
        <Brain />
      </Button>
    </div>
  );
}

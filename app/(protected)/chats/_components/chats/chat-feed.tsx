"use client";

import type React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";
import { useChat } from "../providers/chat-provider";
import { Messages } from "../messages/messages";
import { SendMessage } from "../messages/send-message";

export default function ChatFeed({ channelId }: { channelId: Id<"channels"> }) {
  const { textareaHeight, scrollAreaRef } = useChat();

  return (
    <div className="flex flex-col h-[calc(100vh-52px)] bg-background/50 dark:bg-background">
      <div
        className="flex-1 overflow-hidden"
        style={{
          height: `calc(100vh - 80px - ${textareaHeight + 32}px)`,
        }}
      >
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="w-full max-w-2xl m-auto">
            <Messages channelId={channelId} />
          </div>
        </ScrollArea>
      </div>

      <div className=" border-border pt-0 p-2.5 w-full max-w-2xl m-auto">
        <SendMessage />
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Messages } from "./messages";
import { Id } from "@/convex/_generated/dataModel";
import { SendMessage } from "./send-message";
import { useChat } from "./provider";

export default function ChatFeed({ channelId }: { channelId: Id<"channels"> }) {
  const { textareaHeight, scrollAreaRef } = useChat();

  return (
    <div className="flex flex-col h-[calc(100vh-50px)] bg-background">
      <div
        className="flex-1 overflow-hidden"
        style={{
          height: `calc(100vh - 80px - ${textareaHeight + 32}px)`,
        }}
      >
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-2.5 w-full max-w-2xl m-auto">
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

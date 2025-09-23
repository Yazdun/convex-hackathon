"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Messages } from "./messages";
import { Id } from "@/convex/_generated/dataModel";
import { SendMessage } from "./send-message";

export default function ChatFeed({ channelId }: { channelId: Id<"channels"> }) {
  const [inputValue, setInputValue] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea and track height changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
      textarea.style.height = `${newHeight}px`;
      setTextareaHeight(newHeight);
    }
  }, [inputValue]);

  // Auto-scroll to bottom when new messages arrive
  // useEffect(() => {
  //   const scrollArea = scrollAreaRef.current;
  //   if (scrollArea) {
  //     const viewport = scrollArea.querySelector(
  //       '[data-slot="scroll-area-viewport"]',
  //     );
  //     if (viewport) {
  //       viewport.scrollTop = viewport.scrollHeight;
  //     }
  //   }
  // }, [messages]);

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
        <SendMessage
          inputValue={inputValue}
          setInputValue={setInputValue}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
}

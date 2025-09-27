"use client";

import React, { useRef } from "react";
import { useAssistant } from "./assistant-provider";
import { useThreadMessages } from "@convex-dev/agent/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";

export function AssistantContainer() {
  const { threadId } = useAssistant();

  return (
    <div className="fixed bottom-2.5 z-40 right-2.5 p-2.5">
      <AnimatePresence mode="wait">
        {threadId ? (
          <motion.div
            key={threadId}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <Assistant threadId={threadId} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Assistant({ threadId }: { threadId: string }) {
  const messages = useThreadMessages(
    api.chats.listThreadMessages,
    { threadId },
    {
      initialNumItems: 10,
      stream: true,
    },
  );
  const { setThreadId, setCurrentChannelId } = useAssistant();
  const ref = useRef(null);

  // @ts-expect-error weird error
  useOnClickOutside(ref, () => {
    setThreadId(undefined);
    setCurrentChannelId(undefined);
  });

  const systemResponse = messages.results[1];

  const generateText = () => {
    if (messages.isLoading) {
      return (
        <motion.div
          key="loading-ai-summary"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
        >
          Thinking...
        </motion.div>
      );
    }

    return (
      <motion.p
        key="ai-summary-text"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
      >
        {systemResponse?.text ?? <span className="opacity-0">Loading</span>}
      </motion.p>
    );
  };

  return (
    <motion.div
      ref={ref}
      className="border transition-all rounded-lg bg-popover w-[400px]"
    >
      <div className="px-4 flex items-center justify-between py-2 border-b">
        <h2 className="">Channel Overview</h2>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setCurrentChannelId(undefined);
            setThreadId(undefined);
          }}
        >
          <X />
        </Button>
      </div>
      <div className="p-4 leading-6 min-h-[30px] text-sm">
        <AnimatePresence mode="wait">{generateText()}</AnimatePresence>
      </div>
    </motion.div>
  );
}

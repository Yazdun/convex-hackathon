"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DeleteMessage } from "./delete-message";
import { cn } from "@/lib/utils";
import { VoiceMessage } from "./voice-message";
import { IMessage } from "../types/types";
import { useChat } from "../providers/chat-provider";
import { MarkdownFormatter } from "../markdown/mdx";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Reactions } from "../reactions/reaction";
import { PromptPopover } from "./prompt-popover";
import { useQueryState } from "nuqs";

dayjs.extend(relativeTime);

const motionConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export function Messages({ channelId }: { channelId: Id<"channels"> }) {
  const messages = useQuery(api.messages.list, { channelId });
  const [messageId] = useQueryState("messageId");
  const [showLoading, setShowLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const {
    scrollToBottom,
    scrollToBottomIfAtBottom,
    toEdit,
    replyingTo,
    scrollToMessage,
  } = useChat();
  const prevMessageCountRef = useRef(0);

  const lastMessage = messages ? messages[messages.length - 1] : null;

  useEffect(() => {
    if (messages === undefined) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsMounted(true);
      setShowLoading(false);
    }
  }, [messages]);

  useEffect(() => {
    if (messages && isMounted) {
      const currentMessageCount = messages.length;
      const prevCount = prevMessageCountRef.current;

      // If this is the first time loading messages, scroll to bottom
      if (prevCount === 0) {
        if (messageId && messages.find((m) => m._id === messageId)) {
          scrollToMessage(messageId);
        } else {
          scrollToBottom();
        }
      }
      // If new messages arrived, only scroll if user is at bottom
      else if (currentMessageCount > prevCount) {
        scrollToBottomIfAtBottom();
      }

      prevMessageCountRef.current = currentMessageCount;
    }
  }, [messages, isMounted, scrollToBottom, scrollToBottomIfAtBottom]);

  useEffect(() => {
    if (messages && lastMessage?.isOwner) {
      scrollToBottom();
    }
  }, [lastMessage?._id]);

  useEffect(() => {
    if (messages && messageId && messages.find((m) => m._id === messageId)) {
      scrollToMessage(messageId);
    }
  }, [messageId]);

  const renderContent = () => {
    if (messages === undefined && showLoading) {
      return (
        <ul className="w-full grid gap-0.5">
          {Array.from({ length: 10 }).map((_, index) => (
            <motion.li {...motionConfig} key={index} className="w-full">
              <MessageSkeleton idx={index} />
            </motion.li>
          ))}
        </ul>
      );
    }

    if (!messages) {
      return null;
    }

    if (!messages.length) {
      return (
        <motion.div
          {...motionConfig}
          key="empty-chat"
          className="p-2.5 font-mono"
        >
          <div className="p-[2px] bg-gradient-to-b from-input to-transparent">
            <div className="p-5 border-dashed rounded-lg text-lg flex-col text-muted-foreground gap-2  bg-background flex items-center text-center justify-center  py-20">
              <motion.div
                initial={{
                  y: 20,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <div className="absolute left-0 right-0 bottom-0 h-[100px] bg-gradient-to-t from-background to-transparent" />
                <MessageSquare size={90} strokeWidth={1} />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold"
              >
                Start the Conversation
              </motion.h2>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode="sync">
        <ul
          className={cn(
            "w-full grid gap-0.5 py-2.5",
            toEdit?._id && "pb-20",
            replyingTo && "pb-20",
          )}
        >
          {messages.map((msg) => {
            return (
              <motion.li
                layout
                {...motionConfig}
                transition={{ type: "tween" }}
                key={msg._id}
                className="w-full"
              >
                <Message message={msg} />
              </motion.li>
            );
          })}
        </ul>
      </AnimatePresence>
    );
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {renderContent()}
    </AnimatePresence>
  );
}

function MessageSkeleton({ idx }: { idx: number }) {
  return (
    <div
      className="p-2.5 rounded-lg"
      style={{
        opacity: 1 - idx / 10,
      }}
    >
      <div className="flex gap-3 w-full">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

function Message({ message }: { message: IMessage }) {
  const {
    setReplyingTo,
    scrollToMessage,
    highlightedMessage,
    setInputValue,
    toEdit,
  } = useChat();
  const { messageRefs, replyingTo, setToEdit } = useChat();

  const renderMessage = () => {
    if (message.type === "audio" && message.fileUrl) {
      return (
        <div>
          <div>
            {message.content && <MarkdownFormatter text={message.content} />}
            <VoiceMessage fileUrl={message.fileUrl} />
          </div>
        </div>
      );
    }
    if (message.type === "image" && message.fileUrl) {
      return (
        <div>
          {message.content && <MarkdownFormatter text={message.content} />}
          <img
            src={message.fileUrl}
            alt="Shared image"
            className="max-w-sm rounded border"
          />
        </div>
      );
    }
    return <MarkdownFormatter text={message.content} />;
  };

  return (
    <div
      ref={(el) => {
        messageRefs.current[message._id] = el;
      }}
      className={cn(
        "p-2.5 rounded-lg hover:bg-card group transition-colors",
        replyingTo?._id === message._id &&
          "bg-secondary/20 hover:bg-secondary/30",
        toEdit?._id === message._id && "bg-secondary/20 hover:bg-secondary/30",
        highlightedMessage === message._id &&
          "bg-secondary/20 hover:bg-secondary/30",
      )}
    >
      {message.parentMessage ? (
        <div className="flex pl-10 relative items-end hover:cursor-pointer text-xs">
          <div
            className="w-full overflow-hidden pl-2.5 pb-2.5"
            onClick={() =>
              scrollToMessage(message.parentMessage?._id as string)
            }
          >
            <div className="absolute border-l-2 rounded-tl-lg border-border border-t-2 w-[30px] h-10 left-5 -bottom-1" />
            <div className="w-full bg-inherit border-2 rounded-lg border-border overflow-hidden max-h-[200px] p-2.5">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Avatar className="w-5 h-5">
                  <AvatarImage
                    src={message.parentMessage.avatarUrl ?? undefined}
                  />
                  <AvatarFallback>
                    {message.parentMessage.authorDisplayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {message.parentMessage.authorDisplayName}
              </div>
              <MarkdownFormatter text={message.parentMessage.content} />
            </div>
          </div>
        </div>
      ) : null}
      <div className={cn("flex gap-3  w-full")}>
        <Avatar className="w-10 h-10">
          <AvatarImage src={message.avatarUrl ?? undefined} />
          <AvatarFallback>{message.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {message.displayName}
              </span>
              <span className="text-sm text-muted-foreground">
                {dayjs(message._creationTime).fromNow()}
              </span>
              <span className="text-sm text-muted-foreground">
                {message.editedAt ? "(edited)" : null}
              </span>
            </div>
            <div className="opacity-0 ml-2 flex items-center gap-2 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setReplyingTo(message);
                  setToEdit(undefined);
                  setInputValue("");
                }}
                className="text-sm hover:underline"
              >
                Reply
              </button>

              {message.isOwner ? (
                <>
                  <button
                    onClick={() => {
                      setToEdit(message);
                      setReplyingTo(undefined);
                      setInputValue(message.content);
                    }}
                    className="text-sm hover:underline"
                  >
                    Edit
                  </button>

                  <DeleteMessage
                    messageId={message._id}
                    triggerComponent={
                      <button className="text-sm hover:underline text-destructive">
                        Delete
                      </button>
                    }
                  />
                </>
              ) : null}
            </div>
          </div>
          {renderMessage()}
          <div className="mt-2 flex items-center justify-between">
            <Reactions messageId={message._id} reactions={message.reactions} />
            <PromptPopover message={message} key={message._id + "-popover"} />
          </div>
        </div>
      </div>
    </div>
  );
}

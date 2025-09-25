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
import { motion } from "framer-motion";
import { MessageCircleDashed } from "lucide-react";

dayjs.extend(relativeTime);

const motionConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export function Messages({ channelId }: { channelId: Id<"channels"> }) {
  const messages = useQuery(api.messages.list, { channelId });
  const [showLoading, setShowLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { scrollToBottom, scrollToBottomIfAtBottom } = useChat();
  const prevMessageCountRef = useRef(0);

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
        scrollToBottom();
      }
      // If new messages arrived, only scroll if user is at bottom
      else if (currentMessageCount > prevCount) {
        scrollToBottomIfAtBottom();
      }

      prevMessageCountRef.current = currentMessageCount;
    }
  }, [messages, isMounted, scrollToBottom, scrollToBottomIfAtBottom]);

  useEffect(() => {
    if (messages) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.isOwner) {
        scrollToBottom();
      }
    }
  }, [messages]);

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
      <motion.div className="p-2.5" {...motionConfig} key="empty-chat">
        <div className="p-5 border-dashed rounded-lg text-lg flex-col text-muted-foreground gap-2 bg-gradient-to-b from-muted to-transparent flex items-center text-center justify-center  py-20">
          <MessageCircleDashed size={30} strokeWidth={2} />
          Start the conversation
        </div>
      </motion.div>
    );
  }

  return (
    <ul className="w-full grid gap-0.5 pb-2.5">
      {messages.map((msg) => {
        return (
          <motion.li {...motionConfig} key={msg._id} className="w-full">
            <Message message={msg} />
          </motion.li>
        );
      })}
    </ul>
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
  const { setReplyingTo, scrollToMessage, highlightedMessage, setInputValue } =
    useChat();
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
        replyingTo?._id === message._id && "bg-secondary/50",
        highlightedMessage === message._id && "bg-secondary",
        "p-2.5 rounded-lg hover:bg-secondary/50 group transition-colors",
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
            <div className="absolute border-l-2 rounded-tl-lg border-t-2 w-[30px] h-10 left-5 -bottom-1" />
            <div className="w-full bg-inherit border rounded-lg border-border overflow-hidden max-h-[200px] p-2.5">
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
        </div>
      </div>
    </div>
  );
}

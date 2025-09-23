"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type IMessage } from "./types";
import { MarkdownFormatter } from "./mdx";
import { DeleteMessage } from "./delete-message";
import { useChat } from "./provider";
import { cn } from "@/lib/utils";
import { VoiceMessage } from "./voice-message";

dayjs.extend(relativeTime);

export function Messages({ channelId }: { channelId: Id<"channels"> }) {
  const messages = useQuery(api.messages.list, { channelId }) || [];

  return (
    <ul className="w-full grid gap-0.5">
      {messages.map((msg) => {
        return (
          <li key={msg._id} className="w-full">
            <Message message={msg} />
          </li>
        );
      })}
    </ul>
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

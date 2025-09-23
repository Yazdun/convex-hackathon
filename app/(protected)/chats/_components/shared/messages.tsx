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
import { CornerTopLeftIcon } from "@radix-ui/react-icons";

dayjs.extend(relativeTime);

export function Messages({ channelId }: { channelId: Id<"channels"> }) {
  const messages = useQuery(api.messages.list, { channelId }) || [];

  return (
    <ul className="w-full">
      {messages.map((msg) => {
        return (
          <li key={msg._id} className="w-full">
            <Message data={msg} />
          </li>
        );
      })}
    </ul>
  );
}

function Message({ data }: { data: IMessage }) {
  const { setReplyingTo, scrollToMessage, highlightedMessage } = useChat();
  const { messageRefs, replyingTo } = useChat();

  return (
    <div
      ref={(el) => {
        messageRefs.current[data._id] = el;
      }}
      className={cn(
        replyingTo?._id === data._id && "bg-secondary hover:bg-secondary",
        highlightedMessage === data._id && "bg-secondary",
        "p-2.5 transition-colors rounded-lg hover:bg-secondary/50 group",
      )}
    >
      {data.parentMessage ? (
        <div className="flex items-start  text-xs">
          <div className="w-10 ml-2 mr-1 text-muted-foreground justify-center items-center flex">
            <CornerTopLeftIcon className="h-[30px] -mb-2 w-[30px]" />
          </div>
          <button
            className="hover:underline underline-offset-2"
            onClick={() => scrollToMessage(data.parentMessage?._id as string)}
          >
            <div>{data.parentMessage.content}</div>
          </button>
        </div>
      ) : null}
      <div className={cn("flex gap-3  w-full")}>
        <Avatar className="w-10 h-10">
          <AvatarImage src={data.avatarUrl ?? undefined} />
          <AvatarFallback>{data.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{data.displayName}</span>
            <span className="text-sm text-muted-foreground">
              {dayjs(data._creationTime).fromNow()}
            </span>
            <div className="opacity-0 ml-2 flex items-center gap-2 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setReplyingTo(data);
                  scrollToMessage(data._id);
                }}
                className="text-sm hover:underline"
              >
                Reply
              </button>
              {data.isOwner ? (
                <>
                  <button className="text-sm hover:underline">Edit</button>

                  <DeleteMessage
                    messageId={data._id}
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
          <MarkdownFormatter text={data.content} />
        </div>
      </div>
    </div>
  );
}

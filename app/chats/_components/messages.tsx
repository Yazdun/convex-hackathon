"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type IMessage } from "./types";

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
  return (
    <div className="flex gap-3 py-2.5 px-2.5 w-full hover:bg-secondary/20 group">
      <Avatar className="w-10 h-10">
        <AvatarImage src={data.avatarUrl ?? ""} />
        <AvatarFallback>{data.displayName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{data.displayName}</span>
          <span className="text-sm text-muted-foreground">
            {dayjs(data._creationTime).fromNow()}
          </span>
          <div className="opacity-0 ml-2 flex items-center gap-2 group-hover:opacity-100 transition-opacity">
            <button className="text-sm">Reply</button>
            {data.isOwner ? (
              <>
                <button className="text-sm">Edit</button>
                <button className="text-sm text-destructive">Delete</button>
              </>
            ) : null}
          </div>
        </div>
        <p className="text-sm">{data.content}</p>
      </div>
    </div>
  );
}

"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React from "react";

interface Message {
  _id: Id<"messages">;
  content: string;
  type: "text" | "image" | "audio";
  authorId: Id<"users">;
  author: string;
  displayName: string;
  avatarUrl: string | null;
  fileUrl: string | null;
  parentMessageId?: Id<"messages">;
  parentMessage?: {
    _id: Id<"messages">;
    content: string;
    type: "text" | "image" | "audio";
    authorDisplayName: string;
    _creationTime: number;
  } | null;
  editedAt?: number;
  _creationTime: number;
}

export function Messages({ channelId }: { channelId: Id<"channels"> }) {
  const messages = useQuery(api.messages.list, { channelId }) || [];

  return (
    <ul>
      {messages.map((msg) => {
        return <Message key={msg._id} data={msg} />;
      })}
    </ul>
  );
}

function Message({ data }: { data: Message }) {
  return <div>{data.content}</div>;
}

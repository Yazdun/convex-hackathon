import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
import { useChat } from "./provider";
import { MarkdownFormatter } from "./mdx";

export function ChatsList() {
  const channels = useQuery(api.channels.list) || [];
  const { setChannelId } = useChat();

  return (
    <div>
      {channels.map((channel) => {
        return (
          <button
            key={channel._id}
            onClick={() => setChannelId(channel._id)}
            className="p-2.5 w-full flex  hover:bg-secondary transition-all rounded-lg hover:cursor-pointer"
          >
            <div className="text-left">
              <h2 className="font-mono text-lg">#{channel.name}</h2>
              <MarkdownFormatter text={channel.description ?? ""} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

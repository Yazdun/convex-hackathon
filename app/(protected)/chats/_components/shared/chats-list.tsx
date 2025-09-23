import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
import { MarkdownFormatter } from "./mdx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IChannel } from "./types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ChatsList() {
  const channels = useQuery(api.channels.list) || [];

  return (
    <div>
      {channels.map((channel) => {
        return (
          <Dialog key={channel._id}>
            <DialogTrigger asChild>
              <ChannelPreviewCard channel={channel} />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}

export function ChannelPreviewCard({ channel }: { channel: IChannel }) {
  return (
    <button
      key={channel._id}
      className="p-2.5 w-full flex  hover:bg-secondary transition-all rounded-lg hover:cursor-pointer"
    >
      <div className="text-left">
        <h2 className="font-mono text-lg">#{channel.name}</h2>
        <MarkdownFormatter
          className="whitespace-pre-wrap"
          text={channel.description ?? ""}
        />
      </div>
      <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
        {channel.users.map((u) => {
          return (
            <Avatar key={u.userId}>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          );
        })}
      </div>
    </button>
  );
}

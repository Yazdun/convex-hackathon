import React, { useState } from "react";
import { IChannelMin } from "../types/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MarkdownFormatter } from "../markdown/mdx";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChat } from "../providers/chat-provider";
import { toast } from "sonner";
import { CornerDownRight, Loader2, Megaphone, Settings2 } from "lucide-react";
import { Subscribe } from "../chats/subscribe";

export function ChannelPopover({ channel }: { channel: IChannelMin }) {
  const [open, setOpen] = useState(false);
  const { setMode, mode } = useChat();

  const handleOpenChange = () => setOpen((prev) => !prev);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="underline hover:opacity-80 transition-all underline-offset-4 cursor-pointer">
        <div>#{channel.name}</div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] flex flex-col gap-2" sideOffset={10}>
        <div className="flex items-center justify-between">
          <h2>{channel.name}</h2>
          {channel.isOwner ? (
            <Button
              variant="outline"
              size="icon"
              disabled={mode === "editChannel"}
              onClick={() => {
                setMode("editChannel");
                setOpen(false);
              }}
            >
              <Settings2 />
            </Button>
          ) : null}
        </div>
        <MarkdownFormatter
          className="text-sm text-muted-foreground"
          text={channel.description ?? "Description not available!"}
        />
        <div className="flex justify-between items-center">
          <div className="*:data-[slot=avatar]:ring-popover flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            {channel.users.slice(0, 4).map((u) => {
              return (
                <Avatar key={u.userId}>
                  <AvatarImage
                    src={u.avatarUrl ?? undefined}
                    alt={u.displayName}
                  />
                  <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
              );
            })}
            {channel.users.length > 4 ? (
              <Avatar>
                <AvatarImage src={undefined} alt={``} />
                <AvatarFallback>+{channel.users.length - 4}</AvatarFallback>
              </Avatar>
            ) : null}
          </div>
          {channel.isOwner ? (
            <Button
              onClick={() => {
                setOpen(false);
                setMode("createAnnouncement");
              }}
            >
              <Megaphone />
              Announcement
            </Button>
          ) : channel.isSubscribed ? (
            <Unsubscribe channel={channel} onClose={handleOpenChange} />
          ) : (
            <Subscribe variant="default" channel={channel} />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Unsubscribe({
  channel,
  onClose,
}: {
  channel: IChannelMin;
  onClose: () => void;
}) {
  const subscribe = useMutation(api.channels.subscribe);
  const [loading, setLoading] = React.useState(false);
  const { setChannelId } = useChat();

  function handleClick() {
    const promise = async () => {
      try {
        setLoading(true);
        await subscribe({
          channelId: channel._id,
        });
        setChannelId(null);
        onClose();
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to create channel:", error);
      }
    };

    toast.promise(promise, {
      loading: "Loading...",
      success: "Unsubscribed!",
      error: "Failed to subscribe!",
    });
  }

  const renderIcon = () => {
    if (loading) {
      return <Loader2 className="animate-spin" />;
    }

    return <CornerDownRight />;
  };

  return (
    <Button disabled={loading} onClick={handleClick} variant="outline">
      {renderIcon()}
      Leave Channel
    </Button>
  );
}

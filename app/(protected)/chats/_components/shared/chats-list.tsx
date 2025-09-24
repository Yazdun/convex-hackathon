import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { MarkdownFormatter } from "./mdx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IChannel } from "./types";
import { Button } from "@/components/ui/button";
import { useChat } from "./provider";
import { toast } from "sonner";
import { CornerDownRight, Loader2, UserMinus2, UserPlus2 } from "lucide-react";

export function ChatsList() {
  const channels = useQuery(api.channels.list) || [];

  return (
    <div className="p-2.5 grid gap-2.5">
      {channels.map((channel) => {
        return <ChannelPreviewCard key={channel._id} channel={channel} />;
      })}
    </div>
  );
}

export function ChannelPreviewCard({ channel }: { channel: IChannel }) {
  const renderSubscribers = () => {
    if (!channel.users.length) {
      return "No Subscribers";
    }

    if (channel.users.length === 1) {
      return "1 Subscriber";
    }

    return `${channel.users.length} Subscribers`;
  };
  return (
    <div className="p-5 border w-full grid gap-2 hover:bg-secondary/20 transition-all rounded-lg">
      <div className="text-left grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg">#{channel.name}</h2>
        </div>
        <MarkdownFormatter
          className="whitespace-pre-wrap text-muted-foreground"
          text={channel.description ?? ""}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm">{renderSubscribers()}</p>
        <div className="flex items-center gap-3">
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
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
          </div>
          <Subscribe channel={channel} />
        </div>
      </div>
    </div>
  );
}

export function Subscribe({ channel }: { channel: IChannel }) {
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
        setLoading(false);
        if (!channel.isSubscribed) {
          setChannelId(channel._id);
        }
      } catch (error) {
        setLoading(false);
        console.error("Failed to create channel:", error);
      }
    };

    toast.promise(promise, {
      loading: "Loading...",
      success: channel.isSubscribed ? "Unsubscribed!" : `Subscribed!`,
      error: "Failed to subscribe!",
    });
  }

  const renderIcon = () => {
    if (loading) {
      return <Loader2 className="animate-spin" />;
    }

    if (channel.isSubscribed) {
      return <UserMinus2 />;
    }

    return <UserPlus2 />;
  };

  const renderComp = () => {
    if (channel.isSubscribed) {
      return (
        <Button variant="outline" onClick={() => setChannelId(channel._id)}>
          <CornerDownRight />
          View Channel
        </Button>
      );
    }

    return (
      <Button disabled={loading} onClick={handleClick} variant="outline">
        {renderIcon()}
        Subscribe
      </Button>
    );
  };

  return <div>{renderComp()}</div>;
}

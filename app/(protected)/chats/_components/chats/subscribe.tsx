import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { IChannel } from "../types/types";
import React from "react";
import { useChat } from "../providers/chat-provider";
import { toast } from "sonner";
import { CornerDownRight, Loader2, UserMinus2, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

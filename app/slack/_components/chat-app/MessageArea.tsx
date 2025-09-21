import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

interface MessageAreaProps {
  channelId: Id<"channels"> | null;
}

export function MessageArea({ channelId }: MessageAreaProps) {
  const [replyingTo, setReplyingTo] = useState<Id<"messages"> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channel = useQuery(
    api.channels.get,
    channelId ? { channelId } : "skip",
  );
  const messages =
    useQuery(api.messages.list, channelId ? { channelId } : "skip") || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!channelId || !channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <h3 className="text-xl font-semibold mb-2">Welcome to SlackChat!</h3>
          <p>Select a channel to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Channel Header */}
      <div className="h-16 border-b bg-white px-6 flex items-center shadow-sm">
        <div>
          <h2 className="font-semibold text-lg">#{channel.name}</h2>
          {channel.description && (
            <p className="text-sm text-gray-600">{channel.description}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <MessageList
          messages={messages}
          onReply={setReplyingTo}
          replyingTo={replyingTo}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <MessageInput
          channelId={channelId}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    </div>
  );
}

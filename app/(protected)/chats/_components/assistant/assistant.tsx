import React from "react";
import { useAssistant } from "./assistant-provider";
import { useThreadMessages } from "@convex-dev/agent/react";
import { api } from "@/convex/_generated/api";

export function AssistantContainer() {
  const { threadId } = useAssistant();

  return (
    <div className="fixed bottom-2.5 bg-background z-40 right-2.5 p-2.5">
      {threadId ? <Assistant threadId={threadId} /> : null}
    </div>
  );
}

export function Assistant({ threadId }: { threadId: string }) {
  const messages = useThreadMessages(
    api.chats.listThreadMessages,
    { threadId },
    {
      initialNumItems: 10,
      stream: true,
    },
  );

  if (messages.isLoading) {
    return <div>Thinking...</div>;
  }

  const systemResponse = messages.results[1];

  return (
    <div className="p-5 border rounded-lg w-[400px]">
      {systemResponse?.text ?? "Loading"}
    </div>
  );
}

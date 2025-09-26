import React from "react";
import { Chats } from "./_components/chats/chats";
import { AssistantProvider } from "./_components/assistant/assistant-provider";

export default function Page() {
  return (
    <AssistantProvider>
      <Chats />
    </AssistantProvider>
  );
}

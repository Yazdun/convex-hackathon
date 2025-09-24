"use client";

import React from "react";
import { ChatsList } from "./chats-list";
import ChatFeed from "./chat-feed";
import { CreateChannelForm } from "../channels/create-channel-form";
import { useChat } from "../providers/chat-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditChannelContainer } from "../channels/edit-channel-form";

export function Chats() {
  const { channelId, mode } = useChat();

  const renderChildren = () => {
    if (mode === "createChannel") {
      return (
        <div className="w-full max-w-2xl p-2.5 m-auto">
          <CreateChannelForm />
        </div>
      );
    }

    if (mode === "editChannel") {
      return (
        <div className="w-full max-w-2xl p-2.5 m-auto">
          <EditChannelContainer />
        </div>
      );
    }

    if (channelId) {
      return (
        <div>
          <ChatFeed channelId={channelId} />
        </div>
      );
    }

    return (
      <ScrollArea className="h-[calc(100vh-50px)]">
        <div className="w-full max-w-2xl m-auto">
          <ChatsList />
        </div>
      </ScrollArea>
    );
  };

  return (
    <div>
      <div>{renderChildren()}</div>
    </div>
  );
}

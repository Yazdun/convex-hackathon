"use client";

import React from "react";
import { useChat } from "./provider";
import { ChatsList } from "./chats-list";
import { ChannelForm } from "./channel-form";
import ChatFeed from "./chat-feed";

export function Chats() {
  const { channelId, mode } = useChat();

  const renderChildren = () => {
    if (mode === "create") {
      return (
        <div className="w-full max-w-2xl p-2.5 m-auto">
          <ChannelForm />
        </div>
      );
    }

    if (mode === "edit") {
      return (
        <div className="w-full max-w-2xl p-2.5 m-auto">
          <ChannelForm />
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
      <div className="w-full max-w-2xl m-auto">
        <ChatsList />
      </div>
    );
  };

  return (
    <div>
      <div>{renderChildren()}</div>
    </div>
  );
}

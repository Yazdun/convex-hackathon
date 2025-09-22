"use client";

import React from "react";
import { Messages } from "./messages";
import { SendMessage } from "./send-message";
import { useChat } from "./provider";
import { ChatsList } from "./chats-list";
import { CreateChannelForm } from "./create-channel-form";

export function Chats() {
  const { channelId, mode } = useChat();

  const renderChildren = () => {
    if (mode === "create") {
      return (
        <div className="w-full max-w-2xl p-2.5 m-auto">
          <CreateChannelForm />
        </div>
      );
    }

    if (mode === "edit") {
      return (
        <div className="w-full max-w-2xl p-2.5 m-auto">
          <CreateChannelForm />
        </div>
      );
    }

    if (channelId) {
      return (
        <div>
          <div className="w-full pb-20 max-w-2xl m-auto">
            <Messages channelId={channelId} />
          </div>
          <div className=" bottom-0 left-0  right-0 fixed bg-background z-50">
            <div className="py-2.5 flex justify-center w-full">
              <div className="w-full max-w-2xl">
                <SendMessage />
              </div>
            </div>
          </div>
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

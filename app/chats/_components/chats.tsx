"use client";

import React from "react";
import { Messages } from "./messages";
import { Send } from "./send";
import { useChat } from "./provider";

export function Chats() {
  const { channelId } = useChat();

  return (
    <div>
      <div>
        {channelId ? (
          <div>
            <div className="w-full max-w-2xl m-auto">
              <Messages channelId={channelId} />
            </div>
            <div className=" bottom-0 left-0  right-0 fixed bg-background z-50">
              <div className="py-2.5 flex justify-center w-full">
                <div className="w-full max-w-2xl">
                  <Send />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
import { useChat } from "../../provider";
import { Profile } from "./profile";
import { Alerts } from "./alerts";
import { Directs } from "./directs";
import { CreateChannel } from "./create-channel";

export function Navbar() {
  const { channelId } = useChat();

  const channel = useQuery(
    api.channels.get,
    channelId ? { channelId } : "skip",
  );

  const renderName = () => {
    if (channel) {
      return <div className="flex items-center gap-1">#{channel.name}</div>;
    }

    if (channelId && !channel) {
      return <div>Loading...</div>;
    }

    if (!channelId) {
      return <div>Homepage</div>;
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background">
      <div className="py-1.5 px-2.5 flex items-center justify-between w-full max-w-2xl m-auto">
        <div>{renderName()}</div>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <CreateChannel />
            <Directs />
            <Alerts />
            <div className="ml-0.5 flex justify-center items-center">
              <Profile />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

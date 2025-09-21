"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { useQueryState } from "nuqs";
import { Id } from "@/convex/_generated/dataModel";
import { Messages } from "./messages";

export function Chats() {
  // const profile = useQuery(api.profiles.get);

  const [channel] = useQueryState("channel");
  const channelId = channel as Id<"channels"> | null;

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1">
        <Sidebar />
      </div>
      <div className="p-5">
        {channelId ? <Messages channelId={channelId} /> : null}
      </div>
    </div>
  );
}

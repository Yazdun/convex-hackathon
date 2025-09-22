"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useQueryState } from "nuqs";
import React from "react";

export function Sidebar() {
  const channels = useQuery(api.channels.list) || [];
  const [channel, setChannel] = useQueryState("channel");

  return (
    <div className="h-screen border-r p-5">
      <ul>
        {channels.map((i) => {
          const isActive = i._id === channel;

          return (
            <li key={i._id}>
              <Button
                onClick={() => setChannel(i._id)}
                className="w-full flex justify-start"
                variant={isActive ? "secondary" : "ghost"}
              >
                <div>{i.name}</div>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

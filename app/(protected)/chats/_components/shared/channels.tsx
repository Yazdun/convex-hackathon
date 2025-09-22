"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "next-view-transitions";
import React from "react";

export function Channels() {
  const channels = useQuery(api.channels.list) || [];

  return (
    <div className="w-full max-w-2xl m-auto">
      <ul className="grid gap-1">
        {channels.map((i) => {
          return (
            <li key={i._id}>
              <Link
                href={`/chats/${i._id}`}
                className="flex w-full rounded-lg p-2.5 hover:bg-secondary"
              >
                <div>{i.name}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

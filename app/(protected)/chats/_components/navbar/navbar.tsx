"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Loader2, Rss, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CreateChannel } from "../channels/create-channel";
import { useChat } from "../providers/chat-provider";
import { InboxButton } from "../inbox/inbox-button";
import { Profile } from "../profiles/profile";
import { ChannelPopover } from "../channels/channel-popover";
import { SearchButton } from "../search/search-button";

export function Navbar() {
  const { channelId } = useChat();

  const channel = useQuery(
    api.channels.get,
    channelId ? { channelId } : "skip",
  );

  const { setChannelId, mode, setMode } = useChat();

  const renderName = () => {
    if (channel) {
      return (
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
          key="Channel"
        >
          <Button
            onClick={() => {
              if (mode) {
                setMode(null);
                return;
              }
              setChannelId(null);
            }}
            variant="outline"
            size="icon"
          >
            <X size={14} />
          </Button>
          <ChannelPopover channel={channel} />
        </motion.div>
      );
    }

    if (mode) {
      const renderLabel = () => {
        if (mode === "inbox") {
          return "Inbox";
        }

        if (mode === "createAnnouncement") {
          return "Create Announcement";
        }

        if (mode === "createChannel") {
          return "Create Channel";
        }

        if (mode === "editChannel") {
          return "Edit Channel";
        }

        if (mode === "search") {
          return "Search in messages";
        }
      };

      return (
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: channelId ? 10 : -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
          key="chat-mode"
        >
          <Button onClick={() => setMode(null)} variant="outline" size="icon">
            <X size={14} />
          </Button>
          {renderLabel()}
        </motion.div>
      );
    }

    if (channelId && !channel) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          key="Loading"
        >
          <Loader2
            size={19}
            className="animate-spin text-muted-foreground/50"
          />
        </motion.div>
      );
    }

    if (!channelId) {
      return (
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          key="Explore"
          className="flex items-center gap-1"
        >
          <Rss size={16} />
          Feed
        </motion.div>
      );
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background border-b border-b-input">
      <div className="py-1.5 px-2.5 flex items-center justify-between w-full max-w-2xl m-auto">
        <div>
          <AnimatePresence initial={false} mode="wait">
            {renderName()}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <CreateChannel />
            <InboxButton />
            <ModeToggle />
            <SearchButton />

            <div className="ml-0.5 flex justify-center items-center">
              <Profile />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

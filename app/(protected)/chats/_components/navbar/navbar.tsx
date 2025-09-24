"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowLeft, Loader2, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CreateChannel } from "../channels/create-channel";
import { useChat } from "../providers/chat-provider";
import { Directs } from "../alerts/directs";
import { Alerts } from "../alerts/alerts";
import { Profile } from "../profiles/profile";
import { ChannelPopover } from "../channels/channel-popover";

export function Navbar() {
  const { channelId } = useChat();

  const channel = useQuery(
    api.channels.get,
    channelId ? { channelId } : "skip",
  );

  const { setChannelId, mode, setMode } = useChat();

  const renderName = () => {
    if (mode === "createChannel") {
      return (
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: channelId ? 10 : -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
          key="Create"
        >
          <Button onClick={() => setMode(null)} variant="outline" size="icon">
            <ArrowLeft size={14} />
          </Button>
          Create New Channel
        </motion.div>
      );
    }

    if (mode === "editChannel") {
      return (
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: channelId ? 10 : -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
          key="Create"
        >
          <Button onClick={() => setMode(null)} variant="outline" size="icon">
            <ArrowLeft size={14} />
          </Button>
          Manage #{channel?.name}
        </motion.div>
      );
    }

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
            onClick={() => setChannelId(null)}
            variant="outline"
            size="icon"
          >
            <ArrowLeft size={14} />
          </Button>
          <ChannelPopover channel={channel} />
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
    <div className="sticky top-0 z-50 bg-background">
      <div className="py-1.5 px-2.5 flex items-center justify-between w-full max-w-2xl m-auto">
        <div>
          <AnimatePresence initial={false} mode="wait">
            {renderName()}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <CreateChannel />
            <Directs />
            <Alerts />
            <ModeToggle />
            <div className="ml-0.5 flex justify-center items-center">
              <Profile />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

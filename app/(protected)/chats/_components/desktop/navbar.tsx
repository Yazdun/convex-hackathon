"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
import { Profile } from "./profile";
import { Alerts } from "./alerts";
import { Directs } from "./directs";
import { CreateChannel } from "./create-channel";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../provider";

export function Navbar() {
  const { channelId } = useChat();

  const channel = useQuery(
    api.channels.get,
    channelId ? { channelId } : "skip",
  );

  const renderName = () => {
    if (channel) {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1"
          key="Channel"
        >
          <Button variant="ghost" size="icon">
            <Link href="/chats">
              <ArrowLeft size={14} />
            </Link>
          </Button>
          #{channel.name}
        </motion.div>
      );
    }

    if (channelId && !channel) {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          key="Loading"
        >
          Loading...
        </motion.div>
      );
    }

    if (!channelId) {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          key="Homepage"
        >
          Homepage
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

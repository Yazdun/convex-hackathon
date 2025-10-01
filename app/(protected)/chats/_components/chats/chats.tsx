"use client";

import React from "react";
import { ChatsList } from "./chats-list";
import ChatFeed from "./chat-feed";
import { CreateChannelForm } from "../channels/create-channel-form";
import { useChat } from "../providers/chat-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditChannelContainer } from "../channels/edit-channel-form";
import { AnimatePresence, motion } from "framer-motion";
import { AnnouncementCreate } from "../annoucement/announcement-create";
import { Inbox } from "../inbox/inbox";
import { SearchForm } from "../search/search-form";

const motionConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export function Chats() {
  const { channelId, mode } = useChat();

  const renderChildren = () => {
    if (mode === "search") {
      return (
        <motion.div key="search" {...motionConfig}>
          <ScrollArea className="h-[calc(100vh-53px)]">
            <div className="w-full max-w-2xl px-2.5 py-4 m-auto">
              <SearchForm />
            </div>
          </ScrollArea>
        </motion.div>
      );
    }

    if (mode === "inbox") {
      return (
        <ScrollArea className="h-[calc(100vh-50px)]">
          <motion.div
            key="inbox"
            {...motionConfig}
            className="w-full max-w-2xl p-2.5 m-auto"
          >
            <Inbox />
          </motion.div>
        </ScrollArea>
      );
    }

    if (mode === "createChannel") {
      return (
        <motion.div
          key="createChannel"
          {...motionConfig}
          className="w-full max-w-2xl p-2.5 m-auto"
        >
          <CreateChannelForm />
        </motion.div>
      );
    }

    if (mode === "editChannel") {
      return (
        <motion.div
          key="editChannel"
          {...motionConfig}
          className="w-full max-w-2xl p-2.5 m-auto"
        >
          <EditChannelContainer />
        </motion.div>
      );
    }

    if (mode === "createAnnouncement") {
      return (
        <ScrollArea className="h-[calc(100vh-55px)]">
          <motion.div
            key="editChannel"
            {...motionConfig}
            className="w-full max-w-2xl p-2.5 m-auto"
          >
            <AnnouncementCreate />
          </motion.div>
        </ScrollArea>
      );
    }

    if (channelId) {
      return (
        <motion.div key={`chat-${channelId}`} {...motionConfig}>
          <ChatFeed channelId={channelId} />
        </motion.div>
      );
    }

    return (
      <motion.div key="chatsList" {...motionConfig}>
        <ScrollArea className="h-[calc(100vh-55px)]">
          <div className="w-full max-w-2xl m-auto">
            <ChatsList />
          </div>
        </ScrollArea>
      </motion.div>
    );
  };

  return (
    <div>
      <AnimatePresence mode="wait">{renderChildren()}</AnimatePresence>
    </div>
  );
}

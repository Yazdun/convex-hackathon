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

const motionConfig = {
  createChannel: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  editChannel: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  chatFeed: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  chatsList: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 },
  },
};

export function Chats() {
  const { channelId, mode } = useChat();

  const renderChildren = () => {
    if (mode === "inbox") {
      return (
        <motion.div
          key="inbox"
          {...motionConfig.createChannel}
          className="w-full max-w-2xl p-2.5 m-auto"
        >
          <Inbox />
        </motion.div>
      );
    }

    if (mode === "createChannel") {
      return (
        <motion.div
          key="createChannel"
          {...motionConfig.createChannel}
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
          {...motionConfig.editChannel}
          className="w-full max-w-2xl p-2.5 m-auto"
        >
          <EditChannelContainer />
        </motion.div>
      );
    }

    if (mode === "createAnnouncement") {
      return (
        <motion.div
          key="editChannel"
          {...motionConfig.editChannel}
          className="w-full max-w-2xl p-2.5 m-auto"
        >
          <AnnouncementCreate />
        </motion.div>
      );
    }

    if (channelId) {
      return (
        <motion.div key={`chat-${channelId}`} {...motionConfig.chatFeed}>
          <ChatFeed channelId={channelId} />
        </motion.div>
      );
    }

    return (
      <motion.div key="chatsList">
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

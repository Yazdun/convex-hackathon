"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ReactAction, useAction, useMutation } from "convex/react";
import { FunctionReference } from "convex/server";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { toast } from "sonner";

interface ContextProps {
  summarizeChat: ReactAction<
    FunctionReference<
      "action",
      "public",
      {
        channelId: Id<"channels">;
        threadId: string;
      },
      null,
      string | undefined
    >
  >;
  currentChannelId: string | undefined;
  threadId: string | undefined;
  setThreadId: Dispatch<SetStateAction<string | undefined>>;
  setCurrentChannelId: Dispatch<SetStateAction<string | undefined>>;

  summarizeChannelHistory: ({
    channelId,
  }: {
    channelId: string;
  }) => Promise<true | undefined>;
}

export const Context = createContext<ContextProps | undefined>(undefined);

export const AssistantProvider = (props: { children: React.ReactNode }) => {
  const summarizeChat = useAction(api.chats.summarizeChannelMessages);
  const createThread = useMutation(api.chats.createThread);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [currentChannelId, setCurrentChannelId] = useState<string | undefined>(
    undefined,
  );

  const summarizeChannelHistory = async ({
    channelId,
  }: {
    channelId: string;
  }) => {
    if (!channelId) {
      toast.error("Invalid channel id");
      return;
    }

    setCurrentChannelId(channelId);

    const aiThreadId = await createThread();
    setThreadId(aiThreadId);

    const convexChannelId = channelId as Id<"channels">;

    summarizeChat({ channelId: convexChannelId, threadId: aiThreadId });

    return true;
  };

  const value: ContextProps = {
    summarizeChat,
    threadId,
    setThreadId,
    summarizeChannelHistory,
    setCurrentChannelId,
    currentChannelId,
  };

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};

export const useAssistant = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useChat must be used within the Provider");
  }

  return context;
};

"use client";

import { api } from "@/convex/_generated/api";
import { ReactAction, useAction } from "convex/react";
import { FunctionReference } from "convex/server";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface ContextProps {
  sendMessageToAgent: ReactAction<
    FunctionReference<
      "action",
      "public",
      {
        threadId: string;
        prompt: string;
      },
      string,
      string | undefined
    >
  >;
  setThreadId: Dispatch<SetStateAction<string | null>>;
  threadId: string | null;
}

export const Context = createContext<ContextProps | undefined>(undefined);

export const AssistantProvider = (props: { children: React.ReactNode }) => {
  const sendMessageToAgent = useAction(api.chats.sendMessageToAgent);
  const [threadId, setThreadId] = useState<string | null>(null);

  const value: ContextProps = { sendMessageToAgent, threadId, setThreadId };

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};

export const useAssistant = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useChat must be used within the Provider");
  }

  return context;
};

"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { IMessage } from "./types";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

interface ContextProps {
  replyingTo?: IMessage;
  setReplyingTo?: Dispatch<SetStateAction<IMessage | undefined>>;
  channelId: Id<"channels">;
}

export const Context = createContext<ContextProps | undefined>(undefined);

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [replyingTo, setReplyingTo] = useState<IMessage | undefined>();
  const params = useParams();
  const channelId = params.chatId as Id<"channels">;

  const value: ContextProps = {
    replyingTo,
    setReplyingTo,
    channelId,
  };

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};

export const useChat = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useChat must be used within the Provider");
  }

  return context;
};

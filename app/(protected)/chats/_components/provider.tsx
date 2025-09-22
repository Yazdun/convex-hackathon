"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { IMessage } from "./types";
import { useQueryState } from "nuqs";
import { Id } from "@/convex/_generated/dataModel";

interface ContextProps {
  replyingTo?: IMessage;
  setReplyingTo?: Dispatch<SetStateAction<IMessage | undefined>>;
  channelId: Id<"channels"> | null;
  setChannelId: (val: string) => void;
}

export const Context = createContext<ContextProps | undefined>(undefined);

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [replyingTo, setReplyingTo] = useState<IMessage | undefined>();
  const [qchannel, qsetChannel] = useQueryState("channel");
  const channelId = qchannel as Id<"channels"> | null;

  const setChannelId = (val: string) => qsetChannel(val);

  const value: ContextProps = {
    replyingTo,
    setReplyingTo,
    channelId,
    setChannelId,
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

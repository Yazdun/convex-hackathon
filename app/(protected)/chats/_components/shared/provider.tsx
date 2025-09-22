"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { IMessage } from "./types";
import {
  Options,
  useQueryState,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import { Id } from "@/convex/_generated/dataModel";

interface ContextProps {
  replyingTo?: IMessage;
  setReplyingTo?: Dispatch<SetStateAction<IMessage | undefined>>;
  channelId: Id<"channels"> | null;
  setChannelId: (val: string | null) => void;
  setMode: (
    value: "create" | "edit" | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
  mode: "create" | "edit" | null;
}

export const Context = createContext<ContextProps | undefined>(undefined);

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [replyingTo, setReplyingTo] = useState<IMessage | undefined>();
  const [qchannel, qsetChannel] = useQueryState("channel", parseAsString);
  const [mode, setMode] = useQueryState(
    "mode",
    parseAsStringLiteral(["create", "edit"]),
  );
  const channelId = qchannel as Id<"channels"> | null;

  const setChannelId = (val: string | null) => qsetChannel(val);

  const value: ContextProps = {
    replyingTo,
    setReplyingTo,
    channelId,
    setChannelId,
    mode,
    setMode,
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

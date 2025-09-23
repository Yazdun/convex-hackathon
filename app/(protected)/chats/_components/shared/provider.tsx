"use client";

import {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
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
  setReplyingTo: Dispatch<SetStateAction<IMessage | undefined>>;
  channelId: Id<"channels"> | null;
  setChannelId: (val: string | null) => void;
  setMode: (
    value: "create" | "edit" | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
  mode: "create" | "edit" | null;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  setTextareaHeight: Dispatch<SetStateAction<number>>;
  textareaHeight: number;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  scrollToBottom: () => void;
}

export const Context = createContext<ContextProps | undefined>(undefined);

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [replyingTo, setReplyingTo] = useState<IMessage | undefined>();
  const [qchannel, qsetChannel] = useQueryState("channel", parseAsString);
  const [mode, setMode] = useQueryState(
    "mode",
    parseAsStringLiteral(["create", "edit"]),
  );

  const [inputValue, setInputValue] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const channelId = qchannel as Id<"channels"> | null;
  const setChannelId = (val: string | null) => qsetChannel(val);

  // Auto-resize textarea and track height changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
      textarea.style.height = `${newHeight}px`;
      setTextareaHeight(newHeight);
    }
  }, [inputValue]);

  const scrollToBottom = () => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const viewport = scrollArea.querySelector(
        '[data-slot="scroll-area-viewport"]',
      );
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const value: ContextProps = {
    replyingTo,
    setReplyingTo,
    channelId,
    setChannelId,
    mode,
    setMode,
    scrollAreaRef,
    textareaRef,
    inputValue,
    setInputValue,
    textareaHeight,
    setTextareaHeight,
    scrollToBottom,
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

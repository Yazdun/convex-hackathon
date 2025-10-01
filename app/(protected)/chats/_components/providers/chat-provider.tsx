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
import {
  Options,
  useQueryState,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import { Id } from "@/convex/_generated/dataModel";
import { IMessage } from "../types/types";

interface ContextProps {
  replyingTo?: IMessage;
  setReplyingTo: Dispatch<SetStateAction<IMessage | undefined>>;
  toEdit?: IMessage;
  setToEdit: Dispatch<SetStateAction<IMessage | undefined>>;
  channelId: Id<"channels"> | null;
  setChannelId: (val: string | null) => void;
  setMode: (
    value:
      | "createChannel"
      | "editChannel"
      | "createAnnouncement"
      | "inbox"
      | "search"
      | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
  mode:
    | "createChannel"
    | "editChannel"
    | "createAnnouncement"
    | "inbox"
    | "search"
    | null;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  setTextareaHeight: Dispatch<SetStateAction<number>>;
  textareaHeight: number;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  scrollToBottom: () => void;
  scrollToBottomIfAtBottom: () => void;
  isAtBottom: () => boolean;
  highlightedMessage: string | null;
  setHighlightedMessage: Dispatch<SetStateAction<string | null>>;
  scrollToMessage: (messageId: string) => void;
  scrollToTop: () => void;
  focusInput: () => void;
  messageRefs: RefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
  queryMsgId: string | null;
  setQueryMsgId: (val: string | null) => void;
}

export const Context = createContext<ContextProps | undefined>(undefined);

export const ChatProvider = (props: { children: React.ReactNode }) => {
  const [replyingTo, setReplyingTo] = useState<IMessage | undefined>();
  const [toEdit, setToEdit] = useState<IMessage | undefined>();
  const [qchannel, qsetChannel] = useQueryState("channel", parseAsString);
  const [queryMsgId, setQueryMsgId] = useQueryState("messageId");
  const [mode, setMode] = useQueryState(
    "mode",
    parseAsStringLiteral([
      "createChannel",
      "editChannel",
      "createAnnouncement",
      "inbox",
      "search",
    ]),
  );

  const [inputValue, setInputValue] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [highlightedMessage, setHighlightedMessage] = useState<string | null>(
    null,
  );

  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement && scrollAreaRef.current) {
      // Get the scroll area viewport
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        const messageRect = messageElement.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();

        // Calculate the scroll position to place the message at the top
        const scrollTop =
          viewport.scrollTop + messageRect.top - viewportRect.top;

        viewport.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });

        // Highlight the message temporarily
        setHighlightedMessage(messageId);
        setTimeout(() => setHighlightedMessage(null), 2000);
      }
    }
  };

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

  const isAtBottom = () => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const viewport = scrollArea.querySelector(
        '[data-slot="scroll-area-viewport"]',
      );
      if (viewport) {
        const scrollTop = viewport.scrollTop;
        const scrollHeight = viewport.scrollHeight;
        const clientHeight = viewport.clientHeight;
        // Consider "at bottom" if within 100px of the bottom
        return scrollTop + clientHeight >= scrollHeight - 200;
      }
    }
    return false;
  };

  const scrollToBottom = () => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const viewport = scrollArea.querySelector(
        '[data-slot="scroll-area-viewport"]',
      );
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight + 2000,
          behavior: "smooth",
        });
      }
    }
  };

  const scrollToBottomIfAtBottom = () => {
    if (isAtBottom()) {
      scrollToBottom();
    }
  };

  const scrollToTop = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const focusInput = () => {
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };

  // Auto-focus textarea on component mount
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
    }
  }, [replyingTo?._id, toEdit?._id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReplyingTo(undefined);
      setToEdit(undefined);
      setInputValue("");
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [channelId]);

  const handleQueryMsgChange = (val: string | null) => {
    setQueryMsgId(val);
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
    scrollToBottomIfAtBottom,
    isAtBottom,
    scrollToMessage,
    highlightedMessage,
    scrollToTop,
    focusInput,
    setHighlightedMessage,
    messageRefs,
    toEdit,
    setToEdit,
    queryMsgId,
    setQueryMsgId: handleQueryMsgChange,
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

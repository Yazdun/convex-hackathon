"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { PencilRuler, Reply, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { MediaUpload } from "./file-upload";
import { useChat } from "../providers/chat-provider";
import { IMessage } from "../types/types";

export function SendMessage() {
  const {
    inputValue,
    setInputValue,
    textareaRef,
    scrollToBottomIfAtBottom,
    replyingTo,
    toEdit,
    setToEdit,
    setReplyingTo,
    channelId,
    scrollToMessage,
  } = useChat();

  const sendMessage = useMutation(api.messages.send);
  const editMessage = useMutation(api.messages.edit);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (toEdit) {
        handleEditMessage();
        return;
      }
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!channelId) {
      toast.error("Missing message id!");
      return;
    }

    if (!inputValue || inputValue === "" || !inputValue) {
      toast.error("Message cannot be empty!");
      return;
    }

    try {
      await sendMessage({
        channelId,
        content: inputValue,
        type: "text",
        parentMessageId: replyingTo?._id,
      });
      setInputValue("");
      scrollToBottomIfAtBottom();
      setReplyingTo(undefined);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEditMessage = async () => {
    if (!inputValue.trim()) return;
    if (!toEdit) {
      toast.error("Missing message id!");
      return;
    }
    if (!channelId) {
      toast.error("Missing channel id!");
      return;
    }

    if (!inputValue || inputValue === "" || !inputValue) {
      toast.error("Message cannot be empty!");
      return;
    }

    try {
      await editMessage({
        content: inputValue,
        messageId: toEdit._id,
      });
      scrollToMessage(toEdit._id);
      setInputValue("");
      setReplyingTo(undefined);
      setToEdit(undefined);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const renderWidget = () => {
    if (replyingTo) {
      return (
        <PreviewWidget
          message={replyingTo}
          onClose={() => setReplyingTo(undefined)}
          key={replyingTo._id}
          type="reply"
        />
      );
    }

    if (toEdit) {
      return (
        <PreviewWidget
          message={toEdit}
          onClose={() => {
            setToEdit(undefined);
            setInputValue("");
          }}
          key={toEdit._id}
          type="edit"
        />
      );
    }

    return null;
  };

  return (
    <div className="flex gap-2 items-end relative">
      <AnimatePresence mode="wait" initial={false}>
        {renderWidget()}
      </AnimatePresence>
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
        className="flex-1 resize-none min-h-[44px] max-h-[200px]"
        rows={1}
      />
      {channelId ? <MediaUpload channelId={channelId} /> : null}
    </div>
  );
}

const PreviewWidget = ({
  message,
  onClose,
  type,
}: {
  message: IMessage;
  onClose: () => void;
  type: "edit" | "reply";
}) => {
  const { scrollToMessage } = useChat();
  const isEdit = type === "edit";

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="absolute left-0 right-0 -top-16 z-50 text-sm"
    >
      <div className="p-2.5 bg-popover w-full border flex items-center justify-between z-50 rounded-md">
        <button
          onClick={() => scrollToMessage(message._id)}
          className="flex justify-start text-left hover:cursor-pointer w-full items-center gap-2"
        >
          {isEdit ? <PencilRuler /> : <Reply />}
          <div>
            {isEdit ? (
              <span>Edit message</span>
            ) : (
              <span>Reply to {message.author}</span>
            )}
            <p className="text-muted-foreground">
              {message.content.slice(0, 50)}
              {message.content.length > 50 ? "..." : ""}
            </p>
          </div>
        </button>
        <Button onClick={() => onClose()} variant="ghost" size="icon">
          <X />
        </Button>
      </div>
    </motion.div>
  );
};

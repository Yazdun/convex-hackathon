"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChat } from "./provider";
import { toast } from "sonner";
import { Reply, Send, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";

export function SendMessage() {
  const { inputValue, setInputValue, textareaRef, scrollToBottom } = useChat();

  const { replyingTo, setReplyingTo, channelId, scrollToMessage } = useChat();

  const sendMessage = useMutation(api.messages.send);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!channelId) {
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
      scrollToBottom();
      setReplyingTo(undefined);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex gap-2 items-end relative">
      <AnimatePresence mode="wait" initial={false}>
        {replyingTo ? (
          <motion.div
            key={replyingTo._id}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 right-0 -top-16 text-sm"
          >
            <div className="p-2.5 bg-background w-full border flex items-center justify-between z-50 rounded-md">
              <button
                onClick={() => scrollToMessage(replyingTo._id)}
                className="flex justify-start text-left hover:cursor-pointer w-full items-center gap-2"
              >
                <Reply />
                <div>
                  <span>Reply to {replyingTo.author}</span>
                  <p className="text-muted-foreground">
                    {replyingTo.content.slice(0, 50)}
                    {replyingTo.content.length > 50 ? "..." : ""}
                  </p>
                </div>
              </button>
              <Button
                onClick={() => setReplyingTo(undefined)}
                variant="ghost"
                size="icon"
              >
                <X />
              </Button>
            </div>
          </motion.div>
        ) : null}
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
      <Button
        onClick={handleSendMessage}
        disabled={!inputValue.trim()}
        size="icon"
        variant="outline"
        className="shrink-0 size-11"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}

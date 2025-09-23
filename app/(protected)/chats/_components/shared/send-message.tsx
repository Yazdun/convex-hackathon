"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChat } from "./provider";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function SendMessage({
  textareaRef,
  inputValue,
  setInputValue,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { replyingTo, channelId } = useChat();

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
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex gap-2 items-end">
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

"use client";

import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChat } from "../providers/chat-provider";
import { IMessage } from "../types/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const PRESET_PROMPTS = [
  {
    label: "Review",
    prompt:
      "Generate a helpful code review comment for this message, focusing on code quality, best practices, and potential improvements",
  },
  {
    label: "Solution",
    prompt:
      "Provide a technical solution or alternative approach to solve the problem mentioned in this message",
  },
  {
    label: "Question",
    prompt:
      "Ask thoughtful clarifying questions about the implementation, requirements, or technical details",
  },
  {
    label: "Improve",
    prompt:
      "Suggest specific improvements, optimizations, or best practices that could enhance the code or approach",
  },
  {
    label: "Explain",
    prompt:
      "Explain the concept, code, or technical topic in simpler terms that beginners can understand",
  },
  {
    label: "Security",
    prompt:
      "Point out potential security vulnerabilities, privacy concerns, or security best practices related to this message",
  },
  {
    label: "Tools",
    prompt:
      "Recommend useful tools, libraries, frameworks, or resources that would be helpful for this task",
  },
  {
    label: "Pattern",
    prompt:
      "Share relevant coding patterns, design principles, or architectural approaches that apply to this situation",
  },
  {
    label: "Humor",
    prompt:
      "Generate a lighthearted, humorous response that adds some fun while still being helpful and relevant",
  },
  {
    label: "Thoughtful",
    prompt:
      "Provide a thoughtful, analytical response that considers multiple perspectives and deeper implications",
  },
  {
    label: "Critical",
    prompt:
      "Offer constructive criticism, identify potential issues, or challenge assumptions in a respectful way",
  },
  {
    label: "Supportive",
    prompt:
      "Generate an encouraging, supportive response that motivates and builds confidence while offering help",
  },
];

export function Replyer({
  message,
  onSuccess,
}: {
  message: IMessage;
  onSuccess?: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { channelId, setInputValue, setReplyingTo, setToEdit, focusInput } =
    useChat();

  const generateReply = useAction(api.chats.generateReply);

  React.useEffect(() => {
    setReplyingTo(message);
    setToEdit(undefined);
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim() || !channelId || isLoading) return;

    try {
      setIsLoading(true);

      const result = await generateReply({
        channelId,
        messageId: message._id,
        prompt: prompt.trim(),
      });

      console.log("Generated reply:", result);
      toast.success("Reply generated successfully!");
      setPrompt("");
      setInputValue(result.reply);
      focusInput();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error generating reply:", error);
      toast.error("Failed to generate reply. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  if (!channelId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Please select a channel to generate replies
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="prompt" className="text-sm font-medium">
          What kind of reply would you like to generate?
        </label>
        <Textarea
          id="prompt"
          placeholder="Describe the type of reply you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="min-h-[80px] resize-none"
        />
        <div className="text-xs text-muted-foreground">
          Press Enter to generate, Shift+Enter for new line
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Quick prompts:</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(preset.prompt)}
              disabled={isLoading}
              className="text-xs h-8"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Generate Reply
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

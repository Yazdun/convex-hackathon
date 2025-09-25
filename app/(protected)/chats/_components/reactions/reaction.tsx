"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IReaction, TReactionType } from "../types/types";

interface ReactionProps {
  messageId: Id<"messages">;
  reactions: IReaction[];
  className?: string;
}

const REACTION_EMOJIS: Record<TReactionType, string> = {
  laugh: "😂",
  heart: "❤️",
  thumbs_up: "👍",
  thumbs_down: "👎",
  shit: "💩",
  gem: "💎",
};

export function Reactions({ messageId, reactions, className }: ReactionProps) {
  const toggleReaction = useMutation(api.reactions.toggleReaction);

  const handleReactionClick = async (reactionType: TReactionType) => {
    try {
      await toggleReaction({
        messageId,
        reactionType,
      });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  const activeReactions = reactions.filter((reaction) => reaction.count > 0);

  if (activeReactions.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {activeReactions.map((reaction) => (
        <Button
          key={reaction.reactionType}
          variant="secondary"
          size="sm"
          onClick={() => handleReactionClick(reaction.reactionType)}
          className={cn(
            "h-7 px-2 py-1 text-xs font-medium transition-all duration-200",
            reaction.hasCurrentUser
              ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
              : "hover:bg-secondary/80",
          )}
        >
          <span className="mr-1">
            {REACTION_EMOJIS[reaction.reactionType] || "❓"}
          </span>
          <span>{reaction.count}</span>
        </Button>
      ))}
    </div>
  );
}

export function ReactionPicker({
  messageId,
  reactions,
  className,
}: ReactionProps) {
  const toggleReaction = useMutation(api.reactions.toggleReaction);

  const handleReactionClick = async (reactionType: TReactionType) => {
    try {
      await toggleReaction({
        messageId,
        reactionType: reactionType,
      });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {reactions.map((reaction) => (
        <Button
          key={reaction.reactionType}
          variant="ghost"
          size="icon"
          onClick={() => handleReactionClick(reaction.reactionType)}
          className={cn(
            "h-8 w-8 p-1 text-lg hover:scale-110 transition-all duration-200",
            reaction.hasCurrentUser
              ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
              : "hover:bg-secondary",
          )}
          title={`${reaction.reactionType} (${reaction.count})`}
        >
          {REACTION_EMOJIS[reaction.reactionType] || "❓"}
        </Button>
      ))}
    </div>
  );
}

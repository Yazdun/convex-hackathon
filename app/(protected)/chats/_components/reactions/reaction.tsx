"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IReaction, TReactionType } from "../types/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Laugh } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <ReactionPicker messageId={messageId} reactions={reactions} />
      {activeReactions.map((reaction) => (
        <button
          key={reaction.reactionType}
          // variant="secondary"
          // size="sm"
          onClick={() => handleReactionClick(reaction.reactionType)}
          className={cn(
            "h-7 rounded-full hover:cursor-pointer px-3 py-1 text-xs font-medium transition-all duration-200",
            reaction.hasCurrentUser
              ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-500 dark:text-blue-300 hover:opacity-80"
              : "hover:bg-secondary/80 dark:bg-secondary bg-muted",
          )}
        >
          <span className="mr-1">
            {REACTION_EMOJIS[reaction.reactionType] || "❓"}
          </span>
          <span>{reaction.count}</span>
        </button>
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
    <Tooltip>
      <Popover>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 rounded-full w-8"
            >
              <Laugh />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Reactions</p>
        </TooltipContent>
        <PopoverContent side="top" align="center" className="p-1 w-auto">
          <div className={cn("flex gap-0.5", className)}>
            {reactions.map((reaction) => (
              <Button
                key={reaction.reactionType}
                variant={reaction.hasCurrentUser ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleReactionClick(reaction.reactionType)}
                className={cn("h-9 w-8 p-1 transition-all duration-200")}
                title={`${reaction.reactionType} (${reaction.count})`}
              >
                {REACTION_EMOJIS[reaction.reactionType] || "❓"}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </Tooltip>
  );
}

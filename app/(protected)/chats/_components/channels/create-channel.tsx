import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChat } from "../providers/chat-provider";

export function CreateChannel() {
  const { setMode } = useChat();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => setMode("createChannel")}
          variant="ghost"
          size="icon"
        >
          <Plus />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>New channel</p>
      </TooltipContent>
    </Tooltip>
  );
}

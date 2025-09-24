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
        <Button onClick={() => setMode("create")} variant="ghost" size="icon">
          <Plus />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Create new channel</p>
      </TooltipContent>
    </Tooltip>
  );
}

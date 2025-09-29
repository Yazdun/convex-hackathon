import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { WandSparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { IMessage } from "../types/types";
import { useChat } from "../providers/chat-provider";

export function PromptPopover({ message }: { message: IMessage }) {
  const [open, setOpen] = useState(false);
  const { setGenReplyFor, setReplyingTo, setToEdit } = useChat();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className={cn(
                "h-8 rounded-full w-8 opacity-0 group-hover:opacity-100",
                open && "opacity-100",
              )}
            >
              <WandSparkles size={14} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>AI Tools</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent side="top" className="p-0.5 flex flex-col gap-0.5">
        <Button
          onClick={() => {
            setToEdit(undefined);
            setReplyingTo(undefined);
            setGenReplyFor(message);
          }}
          variant="ghost"
          className="flex items-center justify-baseline"
        >
          Generate Reply
        </Button>
        <Button variant="ghost" className="flex items-center justify-baseline">
          Scan URLs
        </Button>
      </PopoverContent>
    </Popover>
  );
}

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
import { ReplyerDialog } from "./replyer-dialog";
import { ScannerButton } from "../scanner/scanner-button";

export function PromptPopover({ message }: { message: IMessage }) {
  const [open, setOpen] = useState(false);
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
        <ReplyerDialog
          key={message._id + "-replyer-dialog"}
          message={message}
        />
        <ScannerButton message={message} />
      </PopoverContent>
    </Popover>
  );
}

import { Bell } from "lucide-react";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Alerts() {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost">
              <Bell size={19} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent>Place content for the popover here.</PopoverContent>
    </Popover>
  );
}

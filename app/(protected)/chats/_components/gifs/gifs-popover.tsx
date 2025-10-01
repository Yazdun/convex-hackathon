import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ImagePlay } from "lucide-react";
import { Gifs } from "./gifs";

export function GifsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="shrink-0 size-11" variant="ghost">
          <ImagePlay />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px]">
        <Gifs width={550} columns={3} />
      </PopoverContent>
    </Popover>
  );
}

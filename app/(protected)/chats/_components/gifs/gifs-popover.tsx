import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ImagePlay } from "lucide-react";
import { Gifs } from "./gifs";
import { useChat } from "../providers/chat-provider";

export function GifsPopover() {
  const { toEdit } = useChat();
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [toEdit?._id]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={toEdit?._id ? true : false}
          className="shrink-0 size-11"
          variant="ghost"
        >
          <ImagePlay />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px]">
        <Gifs onSuccess={() => setOpen(false)} width={550} columns={3} />
      </PopoverContent>
    </Popover>
  );
}

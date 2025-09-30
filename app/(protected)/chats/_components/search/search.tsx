import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchForm } from "./search-form";
import { IChannelData } from "../types/types";

export function SearchSheet({ channel }: { channel?: IChannelData | null }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Search />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Search</p>
        </TooltipContent>
      </Tooltip>

      <SheetContent className="w-[500px] flex flex-col border-l-destructive border-l-2 gap-0 sm:max-w-[500px]">
        <SheetHeader className="border-b bg-destructive border-destructive">
          <SheetTitle className="font-mono text-black">
            {channel?.name
              ? `Search in #${channel.name}`
              : "Search in messages"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Search in messages
          </SheetDescription>
        </SheetHeader>
        <SearchForm
          onClose={() => setOpen(false)}
          channelId={channel?._id ?? null}
        />
      </SheetContent>
    </Sheet>
  );
}

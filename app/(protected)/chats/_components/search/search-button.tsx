import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQueryState } from "nuqs";

export function SearchButton() {
  const [_, setMode] = useQueryState("mode");
  console.log(_);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button onClick={() => setMode("search")} variant="ghost" size="icon">
          <Search />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Search</p>
      </TooltipContent>
    </Tooltip>
  );
}

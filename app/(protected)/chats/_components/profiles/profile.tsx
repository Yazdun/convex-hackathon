import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AvatarForm } from "./avatar-form";
import { ProfileForm } from "./profile-form";

export function Profile() {
  const profile = useQuery(api.profiles.get);

  if (!profile) {
    return (
      <Button variant="ghost" disabled size="icon">
        <Skeleton className="w-7 h-7" />
      </Button>
    );
  }

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <div className="h-7 overflow-hidden w-7">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={profile?.avatarUrl ?? undefined} />
                  <AvatarFallback className="rounded-none min-w-7 min-h-7">
                    {profile?.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Your profile</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-[400px]">
        <div>
          <AvatarForm profile={profile} />
          <ProfileForm profile={profile} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProfileForm } from "../../shared/profile-form";
import { AvatarForm } from "../../shared/avatar-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Profile() {
  const profile = useQuery(api.profiles.get);

  if (!profile) {
    return <Skeleton className="w-7 h-7" />;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <div className="h-7 overflow-hidden w-7">
            <Avatar className="w-7 h-7">
              <AvatarImage src={profile?.avatarUrl ?? ""} />
              <AvatarFallback className="rounded-none min-w-7 min-h-7">
                {profile?.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <div>
          <AvatarForm profile={profile} />
          <ProfileForm profile={profile} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function Profile() {
  const profile = useQuery(api.profiles.get);

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="ml-2">
        <div>
          <Avatar>
            <AvatarImage src={profile?.avatarUrl ?? ""} />
            <AvatarFallback>
              {profile?.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </NavigationMenuTrigger>
      <NavigationMenuContent>hello</NavigationMenuContent>
    </NavigationMenuItem>
  );
}

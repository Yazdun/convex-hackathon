import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Bell } from "lucide-react";
import React from "react";

export function Alerts() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="w-9 h-9 ">
        <div>
          <Bell size={19} />
        </div>
      </NavigationMenuTrigger>
      <NavigationMenuContent>hello</NavigationMenuContent>
    </NavigationMenuItem>
  );
}

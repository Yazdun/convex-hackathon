"use client";

import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Profile } from "./profile";
import { Alerts } from "./alerts";
import { Directs } from "./directs";

export function Menu() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <Directs />
        <Alerts />
        <Profile />
      </NavigationMenuList>
    </NavigationMenu>
  );
}

import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Inbox } from "lucide-react";

export function Directs() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="w-9 h-9">
        <div>
          <Inbox size={19} />
        </div>
      </NavigationMenuTrigger>
      <NavigationMenuContent>hello</NavigationMenuContent>
    </NavigationMenuItem>
  );
}

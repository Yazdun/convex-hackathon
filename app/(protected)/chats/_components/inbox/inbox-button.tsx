import { Inbox as InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "../providers/chat-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function InboxButton() {
  const inbox = useQuery(api.inbox.getUserInbox);
  const { setMode, setChannelId } = useChat();

  const unread = inbox?.filter((i) => i.status === "delivered") ?? [];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          onClick={() => {
            setMode("inbox");
            setChannelId(null);
          }}
          className="relative"
          size="icon"
        >
          <InboxIcon size={19} />
          <AnimatePresence mode="wait">
            {unread?.length ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                key={`${unread.length}-inbox-key`}
                className="absolute bg-red-500 font-bold font-mono flex items-center justify-center text-[10px] rounded-full w-4 h-4 right-0 mt-3"
              >
                {unread?.length}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Inbox</p>
      </TooltipContent>
    </Tooltip>
  );
}

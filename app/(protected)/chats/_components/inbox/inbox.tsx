import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { IInbox } from "../types/types";
import { useEffect, useState } from "react";
import { MarkdownFormatter } from "../markdown/mdx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChat } from "../providers/chat-provider";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox as InboxIcon } from "lucide-react";
import { motionConfig } from "../chats/motion";

dayjs.extend(relativeTime);

export function Inbox() {
  const inbox = useQuery(api.inbox.getUserInbox);
  const markAllAsRead = useMutation(api.inbox.markAllAsRead);

  const [showLoading, setShowLoading] = useState(false);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);

  useEffect(() => {
    if (inbox === undefined) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [inbox]);

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAllAsRead(true);
      const result = await markAllAsRead();
      if (result.success) {
        toast.success(`Marked ${result.markedAsReadCount} messages as read`);
      }
    } catch (error: unknown) {
      console.log(error);
      toast.error("Failed to mark all messages as read");
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  if (inbox === undefined && showLoading) {
    return <div className="p-2.5 grid gap-2.5">loading</div>;
  }

  const renderContent = () => {
    if (!inbox || !inbox.length) {
      return (
        <motion.div {...motionConfig} key="empty-inbox" className=" font-mono">
          <div className="p-[1px] bg-gradient-to-b from-input to-transparent">
            <div className="p-5 border-dashed rounded-lg text-lg flex-col text-muted-foreground gap-2  bg-background flex items-center text-center justify-center  py-20">
              <motion.div
                initial={{
                  y: 20,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <div className="absolute left-0 right-0 bottom-0 h-[100px] bg-gradient-to-t from-background to-transparent" />
                <InboxIcon size={90} strokeWidth={1} />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold"
              >
                Your Inbox is Empty!
              </motion.h2>
            </div>
          </div>
        </motion.div>
      );
    }

    const unreadCount = inbox.filter(
      (item) => item.status === "delivered",
    ).length;

    return (
      <motion.div {...motionConfig} key="inbox-full">
        <AnimatePresence mode="sync">
          <div className="flex flex-col gap-2.5">
            {unreadCount > 0 && (
              <motion.div
                layout
                key="inbox-unread-messages"
                initial={{
                  opacity: 0,
                }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-between items-center p-4 bg-muted/50 border border-border rounded-lg"
              >
                <span className="text-sm text-muted-foreground">
                  {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  {isMarkingAllAsRead ? "Marking..." : "Mark all as read"}
                </Button>
              </motion.div>
            )}

            {inbox.map((item) => {
              return (
                <motion.div
                  layout
                  transition={{ type: "tween" }}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={item._id}
                >
                  <InboxItem data={item} />
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      {renderContent()}
    </AnimatePresence>
  );
}

function InboxItem({ data }: { data: IInbox }) {
  const { setChannelId, setMode } = useChat();
  const toggleStatus = useMutation(api.inbox.toggleInboxStatus);

  const [isToggling, setIsToggling] = useState(false);

  const handleMarkAsRead = async () => {
    try {
      setIsToggling(true);
      const result = await toggleStatus({ inboxId: data._id });
      if (result.success) {
        const action = result.newStatus === "read" ? "read" : "unread";
        toast.success(`Marked as ${action}`);
      }
    } catch (error: unknown) {
      console.error("Failed to update message status:", error);
      toast.error("Failed to update message status");
    } finally {
      setIsToggling(false);
    }
  };

  const timeAgo = dayjs(data._creationTime).fromNow();
  const isUnread = data.status === "delivered";

  return (
    <div
      className={`p-5 relative border w-full grid gap-2 rounded-lg transition-colors bg-background`}
    >
      {isUnread && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}

      <div className="flex items-center gap-1 text-sm">
        <Avatar className="h-6 w-6">
          <AvatarImage src={data.announcement.creatorAvatarUrl ?? undefined} />
          <AvatarFallback className="text-xs">
            {data.announcement.creatorName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{data.announcement.creatorName}</span>
        <span className="text-muted-foreground">from</span>
        <button
          className="text-left flex underline cursor-pointer hover:opacity-80 font-bold font-mono underline-offset-4"
          onClick={() => {
            setMode(null);
            if (data.channel?._id) {
              setChannelId(data.channel?._id);
            } else {
              toast.error("Failed to retrieve channel id");
            }
          }}
        >
          #{data?.channel?.name ?? "Unknown"}
        </button>
        <span className="ml-auto text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      <div className="mt-2">
        <h4 className="font-semibold text-lg mb-1">
          {data.announcement.title}
        </h4>
        <MarkdownFormatter text={data.announcement.content} />
      </div>

      <div className="flex justify-end mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkAsRead}
          disabled={isToggling}
          className="gap-2"
        >
          {isToggling
            ? "Updating..."
            : isUnread
              ? "Mark as read"
              : "Mark as unread"}
        </Button>
      </div>
    </div>
  );
}

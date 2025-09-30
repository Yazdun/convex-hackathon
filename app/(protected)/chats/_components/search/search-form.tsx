import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownFormatter } from "../markdown/mdx";
import { useChat } from "../providers/chat-provider";
import { AnimatePresence, motion } from "framer-motion";

export function SearchForm() {
  const { channelId, setMode } = useChat();
  const searchScope = channelId ? "current" : "all";
  const [query, setQuery] = useQueryState("query");
  const [_, setChannel] = useQueryState("channel");
  const [messageId, setMessageId] = useQueryState("messageId");
  console.log(_, messageId);

  const searchResults =
    useQuery(
      api.messages.search,
      query?.trim()
        ? {
            query: query.trim(),
            channelId:
              searchScope === "current" ? channelId || undefined : undefined,
          }
        : "skip",
    ) || [];

  const renderContent = () => {
    if (!query?.trim()) {
      return (
        <motion.div
          key="no-query"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="border  font-mono text-center p-10">
            <p>Start typing to search</p>
          </div>
        </motion.div>
      );
    }

    if (!searchResults.length) {
      return (
        <motion.div
          key="no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-10 border font-mono text-center py-10">
            No messages found for{" "}
            <span className="font-mono font-bold">{query}</span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="search-results"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="divide-y flex flex-col gap-2.5"
      >
        {searchResults.map((result) => (
          <button
            key={result._id}
            onClick={() => {
              setChannel(result.channelId);
              setMessageId(result._id);
              setMode(null);
            }}
            className="p-4 w-full border text-left hover:bg-secondary/20 cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-1">
                <Avatar>
                  <AvatarImage src={result.avatarUrl ?? undefined} />
                  <AvatarFallback>
                    {result.displayName[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <span className="">{result.displayName}</span>
                  <span>in #{result.channelName}</span>
                </div>
              </div>
              <div className="">
                <MarkdownFormatter text={result.content} />
              </div>
            </div>
          </button>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="text"
            value={query ?? ""}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            autoFocus
          />
        </div>
      </div>
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  );
}

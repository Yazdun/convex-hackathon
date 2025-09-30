import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownFormatter } from "../markdown/mdx";
import { useChat } from "../providers/chat-provider";

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

  return (
    <div>
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

      {query?.trim() && (
        <div>
          {searchResults.length === 0 ? (
            <div className="p-4">
              <div className="p-4 border text-center py-10">
                No messages found for{" "}
                <span className="font-mono font-bold">{query}</span>
              </div>
            </div>
          ) : (
            <div className="divide-y flex flex-col gap-2.5 mt-4">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

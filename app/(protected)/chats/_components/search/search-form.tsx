import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownFormatter } from "../markdown/mdx";

interface SearchBarProps {
  channelId: Id<"channels"> | null;
  onClose: () => void;
}

export function SearchForm({ channelId, onClose }: SearchBarProps) {
  const searchScope = channelId ? "current" : "all";
  const [query, setQuery] = useQueryState("query");
  const [_, setChannel] = useQueryState("channel");
  console.log(_);

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
      <div className="flex items-center gap-4 p-4 border-b border-input">
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

      <ScrollArea className="h-[calc(100vh-120px)]">
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
              <div className="divide-y">
                {searchResults.map((result) => (
                  <button
                    key={result._id}
                    onClick={() => {
                      setChannel(result.channelId);
                      onClose();
                    }}
                    className="p-4 w-full border-b border-input text-left hover:bg-secondary/20 cursor-pointer"
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
      </ScrollArea>
    </div>
  );
}

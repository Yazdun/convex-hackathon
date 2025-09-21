import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  channelId: Id<"channels"> | null;
  onClose: () => void;
}

export function SearchBar({
  query,
  onQueryChange,
  channelId,
  onClose,
}: SearchBarProps) {
  const [searchScope, setSearchScope] = useState<"current" | "all">("current");

  const searchResults =
    useQuery(
      api.messages.search,
      query.trim()
        ? {
            query: query.trim(),
            channelId:
              searchScope === "current" ? channelId || undefined : undefined,
          }
        : "skip",
    ) || [];

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="searchScope"
              value="current"
              checked={searchScope === "current"}
              onChange={(e) => setSearchScope(e.target.value as "current")}
            />
            Current channel
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="searchScope"
              value="all"
              checked={searchScope === "all"}
              onChange={(e) => setSearchScope(e.target.value as "all")}
            />
            All channels
          </label>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-2 text-gray-600 hover:text-gray-800"
        >
          Close
        </button>
      </div>

      {/* Search Results */}
      {query.trim() && (
        <div className="max-h-64 overflow-y-auto border rounded-lg bg-white">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No messages found for {query}
            </div>
          ) : (
            <div className="divide-y">
              {searchResults.map((result) => (
                <div key={result._id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {result.displayName[0]?.toUpperCase() || "?"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span className="font-medium">
                          {result.displayName}
                        </span>
                        <span>in #{result.channelName}</span>
                        <span>{formatTime(result._creationTime)}</span>
                      </div>
                      <div className="text-sm text-gray-900 truncate">
                        {result.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

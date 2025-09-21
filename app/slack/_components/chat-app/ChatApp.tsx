"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { ChannelSidebar } from "./ChannelSidebar";
import { MessageArea } from "./MessageArea";
import { ProfileModal } from "./ProfileModal";
import { SearchBar } from "./SearchBar";
import { UserListModal } from "./UserListModal";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

export function ChatApp() {
  const [selectedChannelId, setSelectedChannelId] =
    useState<Id<"channels"> | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const channels = useQuery(api.channels.list) || [];
  const profile = useQuery(api.profiles.get);

  // Auto-select first channel if none selected
  if (!selectedChannelId && channels.length > 0) {
    setSelectedChannelId(channels[0]._id);
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-16 bg-purple-600 text-white flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">SlackChat</h1>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-3 py-1 bg-purple-500 hover:bg-purple-400 rounded text-sm transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setShowUserList(true)}
            className="px-3 py-1 bg-purple-500 hover:bg-purple-400 rounded text-sm transition-colors"
          >
            New DM
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 hover:bg-purple-500 px-2 py-1 rounded transition-colors"
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-xs">
                {profile?.displayName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className="text-sm">{profile?.displayName}</span>
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="border-b bg-gray-50 p-4">
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            channelId={selectedChannelId}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ChannelSidebar
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelectChannel={setSelectedChannelId}
        />
        <MessageArea channelId={selectedChannelId} />
      </div>

      {/* Modals */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {showUserList && (
        <UserListModal
          onClose={() => setShowUserList(false)}
          onSelectUser={(channelId) => {
            setSelectedChannelId(channelId);
            setShowUserList(false);
          }}
        />
      )}
    </div>
  );
}

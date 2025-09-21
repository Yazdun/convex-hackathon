import { useState } from "react";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

interface Channel {
  _id: Id<"channels">;
  name: string;
  description?: string;
  type?: "channel" | "dm";
  otherUserId?: Id<"users">;
}

interface ChannelSidebarProps {
  channels: Channel[];
  selectedChannelId: Id<"channels"> | null;
  onSelectChannel: (channelId: Id<"channels">) => void;
}

export function ChannelSidebar({
  channels,
  selectedChannelId,
  onSelectChannel,
}: ChannelSidebarProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");

  const createChannel = useMutation(api.channels.create);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const channelId = await createChannel({
        name: newChannelName.trim(),
        description: newChannelDescription.trim() || undefined,
      });
      onSelectChannel(channelId);
      setNewChannelName("");
      setNewChannelDescription("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  const regularChannels = channels.filter(
    (c) => !c.type || c.type === "channel",
  );
  const dmChannels = channels.filter((c) => c.type === "dm");

  return (
    <div className="w-64 bg-purple-800 text-white flex flex-col">
      {/* Channels Header */}
      <div className="p-4 border-b border-purple-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Channels</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-6 h-6 bg-purple-600 hover:bg-purple-500 rounded flex items-center justify-center text-sm transition-colors"
            title="Create Channel"
          >
            +
          </button>
        </div>
      </div>

      {/* Create Channel Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-purple-700 bg-purple-700">
          <form onSubmit={handleCreateChannel} className="space-y-2">
            <input
              type="text"
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="w-full px-2 py-1 text-black rounded text-sm"
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newChannelDescription}
              onChange={(e) => setNewChannelDescription(e.target.value)}
              className="w-full px-2 py-1 text-black rounded text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {/* Regular Channels */}
        {regularChannels.length > 0 && (
          <div>
            {regularChannels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => onSelectChannel(channel._id)}
                className={`w-full text-left px-4 py-2 hover:bg-purple-700 transition-colors ${
                  selectedChannelId === channel._id ? "bg-purple-600" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">#</span>
                  <span className="truncate">{channel.name}</span>
                </div>
                {channel.description && (
                  <div className="text-xs text-gray-300 mt-1 truncate">
                    {channel.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Direct Messages */}
        {dmChannels.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs text-gray-300 font-semibold border-t border-purple-700 mt-2">
              DIRECT MESSAGES
            </div>
            {dmChannels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => onSelectChannel(channel._id)}
                className={`w-full text-left px-4 py-2 hover:bg-purple-700 transition-colors ${
                  selectedChannelId === channel._id ? "bg-purple-600" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="truncate">{channel.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

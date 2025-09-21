import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

interface UserListModalProps {
  onClose: () => void;
  onSelectUser: (channelId: Id<"channels">) => void;
}

export function UserListModal({ onClose, onSelectUser }: UserListModalProps) {
  const users = useQuery(api.channels.listUsers) || [];
  const createDM = useMutation(api.channels.createDM);

  const handleUserSelect = async (userId: Id<"users">) => {
    try {
      const channelId = await createDM({ otherUserId: userId });
      onSelectUser(channelId);
    } catch (error) {
      console.error("Failed to create DM:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Start a Direct Message</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-64">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserSelect(user._id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.displayName[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">
                  {user.displayName}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </button>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No other users found
          </div>
        )}
      </div>
    </div>
  );
}

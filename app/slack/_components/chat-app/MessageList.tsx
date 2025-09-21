import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

interface Message {
  _id: Id<"messages">;
  content: string;
  type: "text" | "image" | "audio";
  authorId: Id<"users">;
  author: string;
  displayName: string;
  avatarUrl: string | null;
  fileUrl: string | null;
  parentMessageId?: Id<"messages">;
  parentMessage?: {
    _id: Id<"messages">;
    content: string;
    type: "text" | "image" | "audio";
    authorDisplayName: string;
    _creationTime: number;
  } | null;
  editedAt?: number;
  _creationTime: number;
}

interface MessageListProps {
  messages: Message[];
  onReply: (messageId: Id<"messages">) => void;
  replyingTo: Id<"messages"> | null;
}

export function MessageList({
  messages,
  onReply,
  replyingTo,
}: MessageListProps) {
  const [editingMessage, setEditingMessage] = useState<Id<"messages"> | null>(
    null,
  );
  const [editContent, setEditContent] = useState("");
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const editMessage = useMutation(api.messages.edit);
  const deleteMessage = useMutation(api.messages.remove);

  const handleEdit = async (messageId: Id<"messages">) => {
    if (!editContent.trim()) return;

    try {
      await editMessage({ messageId, content: editContent.trim() });
      setEditingMessage(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDelete = async (messageId: Id<"messages">) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessage({ messageId });
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
  };

  const startEdit = (message: Message) => {
    setEditingMessage(message._id);
    setEditContent(message.content);
  };

  const scrollToMessage = (messageId: Id<"messages">) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight the message briefly
      element.classList.add("bg-yellow-100");
      setTimeout(() => {
        element.classList.remove("bg-yellow-100");
      }, 2000);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: Message) => (
    <div
      key={message._id}
      ref={(el) => {
        messageRefs.current[message._id] = el;
      }}
      className={`group hover:bg-gray-50 p-3 rounded transition-colors ${
        replyingTo === message._id
          ? "bg-blue-50 border-l-4 border-blue-400"
          : ""
      }`}
    >
      {/* Reply Preview */}
      {message.parentMessage && (
        <div
          className="mb-2 ml-11 p-2 bg-gray-100 rounded border-l-2 border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => scrollToMessage(message.parentMessage!._id)}
        >
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
            <span>↳ Replying to {message.parentMessage.authorDisplayName}</span>
          </div>
          <div className="text-sm text-gray-700 truncate">
            {message.parentMessage.type === "text"
              ? message.parentMessage.content
              : `[${message.parentMessage.type}]`}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {message.avatarUrl ? (
            <img
              src={message.avatarUrl}
              alt={message.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {message.displayName[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{message.displayName}</span>
            <span className="text-xs text-gray-500">
              {formatTime(message._creationTime)}
            </span>
            {message.editedAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {/* Content */}
          {editingMessage === message._id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(message._id)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingMessage(null)}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm">
                {message.type === "text" && message.content}
                {message.type === "image" && message.fileUrl && (
                  <div>
                    {message.content && (
                      <p className="mb-2">{message.content}</p>
                    )}
                    <img
                      src={message.fileUrl}
                      alt="Shared image"
                      className="max-w-sm rounded border"
                    />
                  </div>
                )}
                {message.type === "audio" && message.fileUrl && (
                  <div>
                    {message.content && (
                      <p className="mb-2">{message.content}</p>
                    )}
                    <audio controls className="max-w-sm">
                      <source src={message.fileUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                <div className="flex gap-2">
                  <button
                    onClick={() => onReply(message._id)}
                    className="text-xs text-gray-500 hover:text-blue-600"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => startEdit(message)}
                    className="text-xs text-gray-500 hover:text-green-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(message._id)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-1">
      {messages.map((message) => renderMessage(message))}
    </div>
  );
}

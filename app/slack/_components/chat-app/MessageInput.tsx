import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface MessageInputProps {
  channelId: Id<"channels">;
  replyingTo: Id<"messages"> | null;
  onCancelReply: () => void;
}

export function MessageInput({
  channelId,
  replyingTo,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sendMessage = useMutation(api.messages.send);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        channelId,
        content: message.trim(),
        type: "text",
        parentMessageId: replyingTo || undefined,
      });
      setMessage("");
      if (replyingTo) onCancelReply();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileUpload = async (file: File, type: "image" | "audio") => {
    try {
      const uploadUrl = await generateUploadUrl();

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      await sendMessage({
        channelId,
        content: message.trim() || `Shared ${type}`,
        type,
        fileId: storageId,
        parentMessageId: replyingTo || undefined,
      });

      setMessage("");
      if (replyingTo) onCancelReply();
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file, "image");
    }
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mpeg",
        });
        const audioFile = new File([audioBlob], "voice-message.mp3", {
          type: "audio/mpeg",
        });
        await handleFileUpload(audioFile, "audio");

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-2">
      {replyingTo && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
          <span>Replying to message</span>
          <button
            onClick={onCancelReply}
            className="text-red-600 hover:text-red-800"
          >
            Cancel
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 border rounded-lg p-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message #${channelId}`}
            className="flex-1 outline-none"
          />

          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Upload Image"
          >
            📎
          </button>

          {/* Voice Recording */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-1 ${isRecording ? "text-red-600" : "text-gray-500 hover:text-gray-700"}`}
            title={isRecording ? "Stop Recording" : "Record Voice Message"}
          >
            {isRecording ? "⏹️" : "🎤"}
          </button>
        </div>

        <button
          type="submit"
          disabled={!message.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}

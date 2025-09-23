import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useChat } from "./provider";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AudioLines, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MediaUpload({ channelId }: { channelId: Id<"channels"> }) {
  const { replyingTo, setReplyingTo, inputValue, setInputValue, toEdit } =
    useChat();
  const [isRecording, setIsRecording] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isVoiceUploading, setIsVoiceUploading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sendMessage = useMutation(api.messages.send);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      await sendMessage({
        channelId,
        content: inputValue.trim(),
        type: "text",
        parentMessageId: replyingTo?._id || undefined,
      });
      setInputValue("");
      setReplyingTo(undefined);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileUpload = async (
    file: File,
    type: "image" | "audio",
    setLoading: (loading: boolean) => void,
  ) => {
    setLoading(true);
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
        content: inputValue.trim() || `Shared ${type}`,
        type,
        fileId: storageId,
        parentMessageId: replyingTo?._id || undefined,
      });

      setInputValue("");
      if (replyingTo) setReplyingTo(undefined);
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file, "image", setIsImageUploading);
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
        await handleFileUpload(audioFile, "audio", setIsVoiceUploading);

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

  const isDisabled = toEdit ? true : false;

  return (
    <div>
      <form onSubmit={handleSend}>
        <div className="flex-1 flex items-center">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
            className="shrink-0 size-11"
            disabled={isImageUploading || isDisabled}
          >
            {isImageUploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Camera size={18} />
            )}
          </Button>

          {/* Voice Recording */}
          <Button
            type="button"
            variant="ghost"
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Stop Recording" : "Record Voice Message"}
            className="shrink-0 size-11"
            disabled={isVoiceUploading || isDisabled}
          >
            {isVoiceUploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <AudioLines
                className={cn(
                  isRecording ? "text-red-500 animate-pulse" : "text-2xl",
                )}
              />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

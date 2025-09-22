import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IProfile } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AvatarForm({ profile }: { profile: IProfile }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useMutation(api.profiles.update);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setIsUploading(true);
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

      await updateProfile({
        displayName: profile.displayName,
        username: profile.username ?? "",
        avatarId: storageId,
      });
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  if (!profile) return null;

  return (
    <div className="text-center">
      <div className="relative inline-block">
        <Avatar className="w-[100px] h-[100px]">
          <AvatarImage src={profile.avatarUrl ?? undefined} />
          <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
        </Avatar>

        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center text-sm"
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
    </div>
  );
}

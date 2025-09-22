import { Id } from "@/convex/_generated/dataModel";

export interface IMessage {
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
  isOwner: boolean;
  _creationTime: number;
}

export interface IProfile {
  userId: Id<"users">;
  email: string | undefined;
  displayName: string;
  avatarUrl: string | null;
  avatarId: Id<"_storage"> | undefined;
}

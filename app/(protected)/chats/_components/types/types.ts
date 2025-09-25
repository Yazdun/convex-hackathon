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
    avatarUrl: string | null;
  } | null;
  editedAt?: number;
  isOwner: boolean;
  _creationTime: number;
  reactions: IReaction[];
}

export interface IProfile {
  userId: Id<"users">;
  email: string | undefined;
  displayName: string;
  avatarUrl: string | null;
  avatarId: Id<"_storage"> | undefined;
  username?: string;
}

export interface IChannel {
  users: IProfile[];
  _id: Id<"channels">;
  _creationTime: number;
  description?: string | undefined;
  avatarId?: Id<"_storage"> | undefined;
  type?: "channel" | "dm" | undefined;
  participants?: Id<"users">[] | undefined;
  tags?: string[] | undefined;
  name: string;
  createdBy: Id<"users">;
  isSubscribed: boolean;
}

export interface IChannelMin {
  _id: Id<"channels">;
  _creationTime: number;
  description?: string | undefined;
  avatarId?: Id<"_storage"> | undefined;
  type?: "channel" | "dm" | undefined;
  participants?: Id<"users">[] | undefined;
  tags?: string[] | undefined;
  name: string;
  createdBy: Id<"users">;
  isOwner: boolean;
  isSubscribed: boolean;
  users: IProfile[];
}

export type TReactionType =
  | "laugh"
  | "heart"
  | "thumbs_up"
  | "thumbs_down"
  | "shit"
  | "gem";

export interface IReaction {
  reactionType: TReactionType;
  hasCurrentUser: boolean;
  count: number;
}

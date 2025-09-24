import { useState } from "react";
import { IChannelMin } from "../types/types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChat } from "../providers/chat-provider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function DeleteChannel({
  channel,
  onClose,
}: {
  channel: IChannelMin;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [loading, setLoading] = useState(false);
  const deleteChannel = useMutation(api.channels.deleteChannel);
  const { setChannelId } = useChat();

  const isConfirmationValid = confirmationName === channel.name;

  const handleDelete = async () => {
    if (!isConfirmationValid) return;

    const promise = async () => {
      try {
        setLoading(true);
        await deleteChannel({
          channelId: channel._id,
        });
        setChannelId(null);
        onClose();
        setOpen(false);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to delete channel:", error);
        throw error;
      }
    };

    toast.promise(promise, {
      loading: "Deleting channel...",
      success: "Channel deleted successfully!",
      error: "Failed to delete channel!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Channel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Channel</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            channel and all its messages.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <span className="font-semibold">{channel.name}</span> to
              confirm:
            </Label>
            <Input
              id="confirmation"
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isConfirmationValid && !loading) {
                  handleDelete();
                }
              }}
              placeholder={`#${channel.name}`}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

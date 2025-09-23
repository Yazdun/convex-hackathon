import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function DeleteMessage({
  triggerComponent,
  messageId,
}: {
  triggerComponent: React.ReactElement;
  messageId: Id<"messages">;
}) {
  const deleteMessage = useMutation(api.messages.remove);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteMessage({ messageId });
      setOpen(false);
      toast.success("Your message was deleted!");
    } catch (error) {
      setLoading(false);
      toast.error("Failed to delete your message!");
      console.error("Failed to delete message:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            message and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-1 items-center">
          <Button onClick={() => setOpen(false)} variant="ghost" size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-1">
                <Loader2 className="animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              <span>Delete Forever</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

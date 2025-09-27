"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/multi-select";
import { Send, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useChat } from "../providers/chat-provider";
import { Id } from "@/convex/_generated/dataModel";
import { PromptPopover } from "./prompt-popover";
import { Switch } from "@/components/ui/switch";

const FormSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .max(100, {
      message: "Title must be less than 100 characters.",
    }),
  content: z
    .string()
    .min(5, {
      message: "Content must be at least 5 characters.",
    })
    .max(1000, {
      message: "Content must be less than 1000 characters.",
    }),
  participants: z
    .array(z.string())
    .min(1, { message: "Please select at least one participant." }),
  isWelcomeMessage: z.boolean(),
});

export function AnnouncementCreate() {
  const [loading, setLoading] = useState(false);
  const { channelId, setMode } = useChat();

  const channel = useQuery(
    api.channels.get,
    channelId ? { channelId } : "skip",
  );

  const createAnnouncement = useMutation(api.announcements.create);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      content: "",
      participants: [],
      isWelcomeMessage: false,
    },
  });

  // Convert channel participants to MultiSelect options
  const participantOptions =
    channel?.users?.map((user) => ({
      label: user.displayName,
      value: user.userId,
    })) || [];

  // Function to programmatically update form values
  const updateFormValues = (props: { title: string; content: string }) => {
    form.setValue("title", props.title);
    form.setValue("content", props.content);
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const promise = async () => {
      if (!channelId) {
        toast.error("Missing channel id");
        return;
      }
      setLoading(true);
      try {
        await createAnnouncement({
          title: data.title,
          content: data.content,
          participants: data.participants as Id<"users">[],
          channelId,
          isWelcomeMessage: data.isWelcomeMessage,
        });
        setMode(null);
        form.reset();
      } catch (error) {
        console.error("Failed to create announcement:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    };

    toast.promise(promise, {
      loading: "Creating announcement...",
      success: "Announcement sent successfully!",
      error: "Failed to create announcement",
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-2.5">
      <div className="flex items-start w-full justify-between">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Create Announcement
          </h2>
          <p className="text-sm text-muted-foreground">
            Send welcome messages for new participants, announcements about
            channel status, updates, and more to keep everyone informed.
          </p>
        </div>
        <div className="flex items-center">
          <PromptPopover callback={updateFormValues} />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter announcement title..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A clear and concise title for your announcement.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[120px]"
                    placeholder="Write your announcement content..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The main content of your announcement. *Markdown supported.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="participants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipients</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={participantOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select participants..."
                    disabled={loading}
                    searchable={true}
                    hideSelectAll={false}
                  />
                </FormControl>
                <FormDescription>
                  Choose which channel participants should receive this
                  announcement.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isWelcomeMessage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Welcome Message</FormLabel>
                  <FormDescription>
                    Mark this as a welcome message for new participants.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setMode(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Send size={18} className="mr-2" />
              )}
              {loading ? "Sending..." : "Send Announcement"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

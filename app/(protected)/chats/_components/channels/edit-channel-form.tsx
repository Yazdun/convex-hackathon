"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useChat } from "../providers/chat-provider";
import { tagsList } from "./tags";
import { IChannelMin } from "../types/types";

// edit channel comps
const FormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Name can only contain letters, numbers, underscores, and dashes. Spaces and other special characters are not allowed.",
    }),
  description: z
    .string()
    .min(2, {
      message: "Description must be at least 10 characters.",
    })
    .max(250, {
      message: "Description must be less than 250 characters.",
    }),
  tags: z
    .array(z.string())
    .min(1, { message: "Please select at least one framework." }),
});

export function EditChannelContainer() {
  const { channelId } = useChat();
  const channel = useQuery(
    api.channels.get,
    channelId ? { channelId } : "skip",
  );

  if (!channelId) {
    return <div>No channel selected</div>;
  }

  if (!channel) {
    return <div>Loading...</div>;
  }

  return <EditChannelForm channel={channel} />;
}

export function EditChannelForm({ channel }: { channel: IChannelMin }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: channel.name || "",
      description: channel.description || "",
      tags: channel.tags ?? [],
    },
  });

  const { setMode } = useChat();
  const updateChannel = useMutation(api.channels.update);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const promise = async () => {
      try {
        await updateChannel({
          channelId: channel._id,
          name: data.name,
          description: data.description,
          tags: data.tags,
        });
        setMode(null);
      } catch (error) {
        console.error("Failed to update channel:", error);
        throw error;
      }
    };

    toast.promise(promise, {
      loading: "Updating channel...",
      success: "Channel updated successfully!",
      error: "Failed to update the channel",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Start typing..." {...field} />
              </FormControl>
              <FormDescription>
                This is your channel&apos;s public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  className="max-h-[100px]"
                  placeholder="Start typing..."
                  {...field}
                />
              </FormControl>
              <FormDescription>*Markdown supported.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Tags</FormLabel>
              <FormControl>
                <MultiSelect
                  options={tagsList}
                  defaultValue={field.value}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Choose tags..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}

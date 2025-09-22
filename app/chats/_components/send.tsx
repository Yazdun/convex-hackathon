"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChat } from "./provider";

const FormSchema = z.object({
  message: z.string().min(1, {
    message: "Message must be at least 2 characters.",
  }),
});

export function Send() {
  const { replyingTo, channelId } = useChat();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!channelId) {
      return;
    }

    try {
      await sendMessage({
        channelId,
        content: data.message,
        type: "text",
        parentMessageId: replyingTo?._id,
      });
      form.reset();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  const sendMessage = useMutation(api.messages.send);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center px-2.5 gap-1 w-full"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="sr-only">Message</FormLabel>
              <FormControl>
                <Input placeholder="Start typing..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

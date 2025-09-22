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
import { IProfile } from "../types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { LogoutButton } from "./logout-button";

const FormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  userName: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Username can only contain letters and numbers.",
    }),
});

export function ProfileForm({ profile }: { profile: IProfile }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      displayName: profile.displayName,
      userName: profile?.username,
    },
  });
  const [loading, setLoading] = useState(false);

  const updateProfile = useMutation(api.profiles.update);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    toast.loading("Updating...", {
      id: "profile-loading-toast",
    });

    try {
      await updateProfile({
        displayName: data.displayName.trim(),
        username: data.userName.trim(),
      });
      setLoading(false);
      toast.dismiss("profile-loading-toast");
      toast.success("Success!");
    } catch (error: unknown) {
      setLoading(false);
      console.log(error);
      toast.dismiss("profile-loading-toast");

      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      if (errorMessage.includes("Username is already taken")) {
        toast.error("Username is already taken");
        return;
      }

      toast.error(errorMessage || "Failed to update your profile!");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-3">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="JohnDoe" {...field} />
              </FormControl>
              <FormDescription>This is your unique username.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <LogoutButton />
          <Button disabled={loading} size="sm" variant="outline" type="submit">
            {loading ? "Loading..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

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
});

export function ProfileForm({ profile }: { profile: IProfile }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      displayName: profile.displayName,
    },
  });
  const [loading, setLoading] = useState(false);

  const updateProfile = useMutation(api.profiles.update);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    const promise = async () => {
      try {
        await updateProfile({
          displayName: data.displayName.trim(),
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to update profile:", error);
      }
    };

    toast.promise(promise, {
      loading: "Updating...",
      success: "Success!",
      error: "Failed to update your profile!",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-3">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
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

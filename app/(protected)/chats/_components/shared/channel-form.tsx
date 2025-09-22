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
import { SiTypescript } from "react-icons/si";
import { IoLogoJavascript } from "react-icons/io5";
import { SiPython, SiGo } from "react-icons/si";
import { RiJavaLine } from "react-icons/ri";
import { TbBrandCSharp } from "react-icons/tb";
import { FaRust } from "react-icons/fa";
import { RiPhpLine } from "react-icons/ri";

import { MultiSelect } from "@/components/multi-select";
import { Plus } from "lucide-react";

export const tagsList = [
  { value: "TypeScript", label: "TypeScript", icon: SiTypescript },
  { value: "JavaScript", label: "JavaScript", icon: IoLogoJavascript },
  { value: "Python", label: "Python", icon: SiPython },
  { value: "Java", label: "Java", icon: RiJavaLine },
  { value: "C#", label: "C#", icon: TbBrandCSharp },
  { value: "Go", label: "Go", icon: SiGo },
  { value: "Rust", label: "Rust", icon: FaRust },
  { value: "PHP", label: "PHP", icon: RiPhpLine },
];

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "description must be at least 10 characters.",
  }),
  frameworks: z
    .array(z.string())
    .min(1, { message: "Please select at least one framework." }),
});

export function ChannelForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      frameworks: [],
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
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
          name="frameworks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Tags</FormLabel>
              <FormControl>
                <MultiSelect
                  options={tagsList}
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
          <Button type="submit">
            <Plus size={18} />
            Create New Channel
          </Button>
        </div>
      </form>
    </Form>
  );
}

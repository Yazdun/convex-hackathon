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
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export function AuthForm({ flow }: { flow: "signIn" | "signUp" }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { signIn } = useAuthActions();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.set("flow", flow);

    async function promise(): Promise<TResponseOverload<{ success: true }>> {
      setLoading(true);
      try {
        await signIn("password", formData);
        setLoading(false);
        return { data: { success: true }, error: null };
      } catch (error: unknown) {
        setLoading(false);
        console.log(error);
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(errorMessage);
      }
    }

    toast.promise(promise, {
      loading:
        flow === "signIn" ? "Logging you in..." : "Creating your account...",
      success: () => {
        startTransition(() => router.push("/chats"));
        return "Success!";
      },
      error: () => {
        if (flow === "signUp") return <div>Email already exists!</div>;
        return "Wrong credentials!";
      },
    });
  }

  function anonLogin() {
    const promise = async () => {
      setLoading(true);
      try {
        await signIn("anonymous");
        setLoading(false);
        return { data: { success: true }, error: null };
      } catch (error: unknown) {
        setLoading(false);
        console.log(error);
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(errorMessage);
      }
    };

    toast.promise(promise, {
      loading: "Creating your account...",
      success: () => {
        startTransition(() => router.push("/chats"));
        return "Success!";
      },
      error: () => {
        return <div>Anon login failed!</div>;
      },
    });
  }

  const label = (text: string) => {
    if (isPending) return "Redirecting you...";
    if (loading) return "Loading...";
    return text;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 w-full md:p-10 md:border rounded-lg"
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl">
            {flow === "signUp" ? `Let's Get Started` : "Welcome Back"}
          </h2>
          <p>Enter an email and password and hit continue</p>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={loading || isPending}
          className="w-full"
          type="submit"
        >
          {label("Continue")}
        </Button>
        <Button
          disabled={loading || isPending}
          className="w-full"
          type="button"
          variant="ghost"
          onClick={anonLogin}
        >
          Anonymous Login
        </Button>
      </form>
    </Form>
  );
}

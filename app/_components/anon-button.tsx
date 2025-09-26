"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AnonLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { signIn } = useAuthActions();

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
    <Button
      disabled={loading || isPending}
      className="w-full"
      type="button"
      variant="ghost"
      onClick={anonLogin}
    >
      {label("Anonymous Login")}
    </Button>
  );
}

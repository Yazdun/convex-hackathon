"use client";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleSignout = () => {
    const promise = async () => {
      try {
        setLoading(true);
        await signOut();
        setLoading(false);
      } catch (error: unknown) {
        setLoading(false);
        console.log(error);
        throw new Error("Failed to signout!");
      }
    };

    toast.promise(promise, {
      success: "Success!",
      error: "Logout failed!",
      loading: "Logging out...",
    });
  };

  return (
    <Button type="button" size="sm" variant="ghost" onClick={handleSignout}>
      {loading ? "Loading..." : "Logout"}
    </Button>
  );
}

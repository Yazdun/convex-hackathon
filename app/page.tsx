"use client";

import React from "react";
import Image from "next/image";
import { AuthForm } from "./_components/auth-form";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import chikaGif from "./_components/assets/chika.gif";

export default function Page() {
  const [state, setState] = useQueryState("state");

  const renderChildren = () => {
    if (state === "signUp") {
      return (
        <motion.div
          key="signup"
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -30,
          }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md z-10"
        >
          <AuthForm flow="signUp" />
          <p className="text-center text-muted-foreground mt-5">
            Already have an account?{" "}
            <button
              className="text-foreground hover:underline underline-offset-2"
              onClick={() => setState("signin")}
            >
              Login
            </button>
          </p>
        </motion.div>
      );
    }

    if (state === "signin") {
      return (
        <motion.div
          key="login"
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -30,
          }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md z-10"
        >
          <AuthForm flow="signIn" />
          <p className="text-center mt-5 text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              className="text-foreground hover:underline underline-offset-2"
              onClick={() => setState("signUp")}
            >
              Get started
            </button>
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        key="hero"
        className="h-full z-10 w-full flex justify-center items-center max-w-xl"
      >
        <div className="flex flex-col gap-2">
          <div className="relative">
            <div className="flex flex-col gap-1">
              <Badge
                variant="outline"
                className="px-4 py-1.5 text-xs font-mono uppercase tracking-wider border-2 border-primary bg-transparent text-primary"
              >
                Convex Hackathon
              </Badge>

              <h1 className="text-7xl font-mono">Kyx8n Chat</h1>
              <p className="text-xl">
                Find like minded people, build communities and have fun!
              </p>

              <div className="absolute -right-24 -top-16 rotate-3">
                <Image
                  src={chikaGif}
                  alt="Chika dancing"
                  width={160}
                  height={160}
                  className="rounded-full aspect-square object-cover"
                  unoptimized
                />
              </div>
            </div>
            <div className="flex justify-end gap-1 mt-3">
              <Button
                size="lg"
                onClick={() => setState("signin")}
                variant="outline"
              >
                Login
              </Button>
              <Button size="lg" onClick={() => setState("signUp")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        "h-screen relative flex transition-all justify-center items-center",
        state === null ? "dark:bg-background bg-background/60" : "",
      )}
    >
      {/* Retro grid background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
               linear-gradient(to right, currentColor 1px, transparent 1px),
               linear-gradient(to bottom, currentColor 1px, transparent 1px)
             `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      {/* Vintage corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-primary" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-primary " />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-primary " />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-primary " />

      <AnimatePresence mode="wait">{renderChildren()}</AnimatePresence>
    </div>
  );
}

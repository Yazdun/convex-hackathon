"use client";

import React from "react";
import { AuthForm } from "./_components/auth-form";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";

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
        >
          <AuthForm flow="signUp" />
          <p className="text-center text-muted-foreground mt-5">
            Already have an account?{" "}
            <button
              className="text-foreground hover:underline underline-offset-2"
              onClick={() => setState(null)}
            >
              Login
            </button>
          </p>
        </motion.div>
      );
    }

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
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">{renderChildren()}</AnimatePresence>
      </div>
    </div>
  );
}

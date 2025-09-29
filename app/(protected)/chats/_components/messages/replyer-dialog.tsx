"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IMessage } from "../types/types";
import { Replyer } from "./replyer-form";
import { Button } from "@/components/ui/button";
import { useChat } from "../providers/chat-provider";

export function ReplyerDialog({ message }: { message: IMessage }) {
  const [open, setOpen] = useState(false);
  const { setToEdit } = useChat();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center justify-baseline"
          >
            Generate Reply
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="sr-only">
            <DialogTitle>Generate response with AI</DialogTitle>
            <DialogDescription>
              Use AI to generate response for a message
            </DialogDescription>
          </DialogHeader>
          <Replyer message={message} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

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

export function ReplyerDialog({
  triggerComponent,
  message,
}: {
  triggerComponent: React.ReactElement;
  message: IMessage;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent className="max-w-[600px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Generate response with AI</DialogTitle>
          <DialogDescription>
            Use AI to generate response for a message
          </DialogDescription>
        </DialogHeader>
        <Replyer message={message} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

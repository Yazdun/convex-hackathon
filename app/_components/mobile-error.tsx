import { cn } from "@/lib/utils";
import React from "react";

export function MobileError() {
  return (
    <div
      className={cn(
        "h-screen relative flex transition-all justify-center items-center bg-background",
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
      <div className="flex flex-col items-center text-center mx-auto px-6 z-10">
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-mono font-bold mb-2">
              Desktop Only Experience
            </h1>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              This is a hackathon project built under tight time constraints.
              Due to some mobile compatibility issues, I decided to focus on
              delivering a great desktop experience instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

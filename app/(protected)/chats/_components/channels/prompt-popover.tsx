import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WandSparkles, Send } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function PromptPopover({
  callback,
}: {
  callback: (props: { title: string; content: string }) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = React.useState(false);

  const createNewChannel = useAction(api.chats.createNewChannel);

  const presetPrompts = [
    "Create a channel for Convex developers to discuss real-time databases, serverless functions, and building full-stack applications with Convex",
    "Create a channel for React developers to share knowledge about components, hooks, state management, and modern React development practices",
    "Create a channel for TypeScript enthusiasts to discuss type safety, advanced TypeScript features, and best practices for typed JavaScript development",
    "Create a channel for Node.js developers to discuss backend development, APIs, server-side JavaScript, and Node.js ecosystem tools",
    "Create a channel for full-stack developers to share knowledge about end-to-end development, architecture patterns, and integrating frontend and backend technologies",
    "Create a channel for general programming discussions covering algorithms, code reviews, debugging techniques, and software development best practices",
  ];

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await createNewChannel({ prompt });
      console.log("Generated announcement:", result);
      const values = {
        title: result.title as string,
        content: result.description as string,
      };
      callback(values);
      setOpen(false);
      toast.success("Success!");
    } catch (error) {
      console.error("Error generating announcement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip>
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" type="button">
              <WandSparkles />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Generate from prompt</p>
        </TooltipContent>
        <PopoverContent className="w-[480px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="prompt"
                className="text-sm font-medium mb-2 block"
              >
                Describe your new channel
              </label>
              <div className="space-y-2 mb-3">
                <p className="text-xs text-muted-foreground">Quick options:</p>
                <div className="flex flex-wrap gap-2">
                  {presetPrompts.map((preset, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1 px-2"
                      onClick={() => handlePresetClick(preset)}
                    >
                      {index === 0 && "Convex"}
                      {index === 1 && "React"}
                      {index === 2 && "TypeScript"}
                      {index === 3 && "Node.js"}
                      {index === 4 && "Full-stack"}
                      {index === 5 && "General"}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                id="prompt"
                placeholder="Describe the type of developer channel you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-[200px]"
              />
            </div>
            <Button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="w-full"
              variant="secondary"
            >
              {isLoading ? (
                <>Generating...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Channel
                </>
              )}
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </Tooltip>
  );
}

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

export function PromptPopover() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const generateAnnouncement = useAction(api.chats.generateAnnouncement);

  const presetPrompts = [
    "Create a warm welcome announcement for new members joining our community channel. Include an introduction to what this channel is about, how to get started, and encourage them to introduce themselves and participate in discussions.",
    "Create an exciting announcement about upcoming community events, activities, or special occasions. Include details about participation, timing, and what members can expect. Make it engaging and encourage attendance.",
    "Create a clear and friendly announcement about community guidelines and rules. Explain expected behavior, posting standards, and how to maintain a positive environment for all members.",
    "Create an announcement celebrating community milestones, achievements, or thanking active members. Highlight the community's growth and encourage continued participation.",
    "Create an announcement about new features, updates, or changes in the channel. Explain what's new, how it benefits members, and any actions they need to take.",
    "Create an announcement for a special discussion topic, Q&A session, or community challenge. Encourage participation and explain how members can get involved.",
  ];

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await generateAnnouncement({ prompt });
      console.log("Generated announcement:", result);
    } catch (error) {
      console.error("Error generating announcement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip>
      <Popover>
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
        <PopoverContent className="w-[400px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="prompt"
                className="text-sm font-medium mb-2 block"
              >
                Describe your announcement
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
                      {index === 0 && "Welcome"}
                      {index === 1 && "Events"}
                      {index === 2 && "Rules"}
                      {index === 3 && "Celebrate"}
                      {index === 4 && "Updates"}
                      {index === 5 && "Discussion"}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                id="prompt"
                placeholder="Describe the type of announcement you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>Generating...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Announcement
                </>
              )}
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </Tooltip>
  );
}

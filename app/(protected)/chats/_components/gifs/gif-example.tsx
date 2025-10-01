"use client";

import React, { useState } from "react";
import { Gifs } from "./gifs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, ExternalLink } from "lucide-react";
import type { IGif } from "@giphy/js-types";

export const GifExample: React.FC = () => {
  const [selectedGifs, setSelectedGifs] = useState<IGif[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGifSelect = (gif: IGif) => {
    // Check if GIF is already selected to avoid duplicates
    if (!selectedGifs.find((selectedGif) => selectedGif.id === gif.id)) {
      setSelectedGifs((prev) => [...prev, gif]);
    }

    // Close the dialog after selection
    setIsDialogOpen(false);
  };

  const removeGif = (gifId: string) => {
    setSelectedGifs((prev) => prev.filter((gif) => gif.id !== gifId));
  };

  const clearAllGifs = () => {
    setSelectedGifs([]);
  };

  const copyGifUrl = async (gif: IGif) => {
    try {
      await navigator.clipboard.writeText(gif.images.original.url);
      // You could add a toast notification here
      console.log("GIF URL copied to clipboard");
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Giphy React Components Example</h1>
        <p className="text-muted-foreground">
          Search and select GIFs using the official Giphy React components
        </p>
      </div>

      {/* GIF Selection Dialog */}
      <div className="flex justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="lg">
              Search GIFs
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Search and Select GIFs</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto pr-2" style={{ maxHeight: "70vh" }}>
              <Gifs
                onGifSelect={handleGifSelect}
                width={800}
                columns={4}
                className="w-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected GIFs Display */}
      {selectedGifs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Selected GIFs</h2>
              <Badge variant="secondary">{selectedGifs.length}</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllGifs}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedGifs.map((gif) => (
              <div
                key={gif.id}
                className="relative group border rounded-lg overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={gif.images.fixed_width.url}
                    alt={gif.title}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => copyGifUrl(gif)}
                      className="bg-blue-500 text-white rounded-full p-1.5 hover:bg-blue-600 transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => window.open(gif.url, "_blank")}
                      className="bg-green-500 text-white rounded-full p-1.5 hover:bg-green-600 transition-colors"
                      title="Open on Giphy"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeGif(gif.id as string)}
                      className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      title="Remove GIF"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* GIF info */}
                <div className="p-3 space-y-2">
                  {gif.title && (
                    <div
                      className="text-sm font-medium truncate"
                      title={gif.title}
                    >
                      {gif.title}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      Size: {gif.images.original.width}x
                      {gif.images.original.height}
                    </div>
                    <div>Type: {gif.type}</div>
                    {gif.username && <div>By: @{gif.username}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedGifs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-6xl mb-4">🎬</div>
          <p>No GIFs selected yet</p>
          <p className="text-sm">Click Search GIFs to get started</p>
        </div>
      )}
    </div>
  );
};

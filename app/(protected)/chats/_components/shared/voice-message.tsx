"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceMessageProps {
  fileUrl: string;

  className?: string;
}

export function VoiceMessage({ fileUrl, className }: VoiceMessageProps) {
  // Generate simple waveform data like Telegram
  const generateWaveform = (length = 30) => {
    return Array.from({ length }, () => Math.random() * 0.8 + 0.2);
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformData = useMemo(() => generateWaveform(), [fileUrl]);

  console.log(waveformData);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleWaveformClick = (index: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const clickPosition = index / waveformData.length;
    audio.currentTime = clickPosition * duration;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("max-w-xs", className)}>
      <div className="flex items-center gap-2 bg-blue-500 dark:bg-accent text-white rounded-2xl px-3 py-2">
        {/* Play/Pause Button - Telegram style circular button */}
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-white" />
          ) : (
            <Play className="h-4 w-4 text-white ml-0.5" />
          )}
        </button>

        {/* Waveform - Simple bars like Telegram */}
        <div className="flex items-center gap-0.5 flex-1 h-8">
          {waveformData.map((height, index) => {
            const isActive = (index / waveformData.length) * 100 <= progress;
            return (
              <button
                key={index}
                onClick={() => handleWaveformClick(index)}
                className="w-0.5 bg-white/40 hover:bg-white/60 rounded-full transition-colors"
                style={{
                  height: `${Math.max(height * 16, 4)}px`,
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.4)",
                }}
              />
            );
          })}
        </div>

        {/* Duration - Simple text like Telegram */}
        <div className="flex-shrink-0 text-xs font-medium text-white/80">
          {formatTime(duration - currentTime)}
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={fileUrl}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
}

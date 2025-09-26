import { Skeleton } from "@/components/ui/skeleton";
import { motionConfig } from "./motion";
import { motion } from "framer-motion";

export function ChannelSkeletonCard({ idx }: { idx: number }) {
  return (
    <motion.div {...motionConfig}>
      <div
        className="p-5 relative border w-full grid gap-2 rounded-lg"
        style={{
          opacity: 1 - idx * 0.19,
        }}
      >
        {/* Chat Summary Button Skeleton */}
        <div className="absolute right-3 top-3">
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>

        {/* Channel Info Skeleton */}
        <div className="text-left grid gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-3/4" />
        </div>

        {/* Bottom Section Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <div className="flex items-center gap-3">
            {/* Button Skeleton */}
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn("shimmer rounded-xl", className)}
      style={{ width, height }}
    />
  );
}

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function StatusBar({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      aria-label="Application status"
      className={cn(
        "flex h-8 shrink-0 items-center justify-between gap-3 border-t border-border bg-muted/30 px-3 text-[11px] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
export function StatusBarItem({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

"use client";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
export function Workspace({
  sidebar,
  children,
  sidebarLabel = "Sidebar width",
  defaultWidth = 220,
  minWidth = 160,
  maxWidth = 360,
  collapsed = false,
  className,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarLabel?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  collapsed?: boolean;
  className?: string;
}) {
  const clamp = (n: number) => Math.min(maxWidth, Math.max(minWidth, n));
  const [width, setWidth] = useState(clamp(defaultWidth));
  const start = useRef<{ x: number; width: number } | null>(null);
  return (
    <div className={cn("flex min-h-0 flex-1 overflow-hidden", className)}>
      {!collapsed && (
        <>
          <aside
            style={{ width }}
            className="shrink-0 overflow-auto bg-muted/15"
          >
            {sidebar}
          </aside>
          <div
            role="separator"
            aria-label={sidebarLabel}
            aria-orientation="vertical"
            aria-valuemin={minWidth}
            aria-valuemax={maxWidth}
            aria-valuenow={width}
            tabIndex={0}
            className="relative z-10 w-1 shrink-0 cursor-col-resize touch-none bg-border outline-none before:absolute before:inset-y-0 before:-left-1 before:w-3 hover:bg-primary focus-visible:bg-primary"
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              start.current = { x: e.clientX, width };
            }}
            onPointerMove={(e) => {
              if (start.current)
                setWidth(
                  clamp(start.current.width + e.clientX - start.current.x),
                );
            }}
            onPointerUp={(e) => {
              start.current = null;
              if (e.currentTarget.hasPointerCapture(e.pointerId))
                e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={() => {
              start.current = null;
            }}
            onLostPointerCapture={() => {
              start.current = null;
            }}
            onDoubleClick={() => setWidth(clamp(defaultWidth))}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                setWidth((w) =>
                  e.key === "Home"
                    ? minWidth
                    : e.key === "End"
                      ? maxWidth
                      : clamp(
                          w +
                            (e.key === "ArrowRight" ? 1 : -1) *
                              (e.shiftKey ? 32 : 8),
                        ),
                );
              }
            }}
          />
        </>
      )}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

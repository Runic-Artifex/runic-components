"use client";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  useWindowHost,
  useWindowAction,
  type WindowPlatform,
} from "./window-host";
import { WindowControls } from "./window-controls";
export function TitleBar({
  title,
  icon,
  actions,
  platform = "windows",
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  platform?: WindowPlatform;
  className?: string;
}) {
  const host = useWindowHost();
  const run = useWindowAction();
  return (
    <header
      className={cn(
        "flex h-11 shrink-0 select-none items-center border-b border-border bg-muted/30",
        !host.state.focused && "opacity-65",
        className,
      )}
    >
      {platform === "macos" && <WindowControls platform={platform} />}
      <div
        data-runic-drag-region
        style={
          {
            "--webui-app-region": host.capabilities.move ? "drag" : "no-drag",
            touchAction: "none",
          } as CSSProperties
        }
        className="flex h-full min-w-0 flex-1 items-center gap-2.5 px-4 text-xs text-muted-foreground"
        onPointerDown={(event) => {
          if (
            event.button === 0 &&
            event.detail !== 2 &&
            host.capabilities.move &&
            host.startDragging
          )
            run(() => host.startDragging!());
        }}
        onDoubleClick={() => {
          if (host.capabilities.maximize) run(() => host.toggleMaximize());
        }}
      >
        {icon}
        <span className="truncate">{title}</span>
      </div>
      {actions && (
        <div
          data-runic-no-drag
          style={{ "--webui-app-region": "no-drag" } as CSSProperties}
          className="flex items-center gap-1 px-2"
        >
          {actions}
        </div>
      )}
      {platform !== "macos" && <WindowControls platform={platform} />}
    </header>
  );
}

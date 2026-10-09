"use client";
import { Minus, Square, Copy, X } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  useWindowHost,
  useWindowAction,
  type WindowPlatform,
} from "./window-host";
export function WindowControls({
  platform = "windows",
  className,
}: {
  platform?: WindowPlatform;
  className?: string;
}) {
  const host = useWindowHost();
  const run = useWindowAction();
  const mac = platform === "macos";
  const controls = [
    {
      name: "Minimize window",
      icon: Minus,
      action: () => host.minimize(),
      enabled: host.capabilities.minimize,
      color: "bg-amber-400",
    },
    {
      name: host.state.maximized ? "Restore window" : "Maximize window",
      icon: host.state.maximized ? Copy : Square,
      action: () => host.toggleMaximize(),
      enabled: host.capabilities.maximize,
      color: "bg-green-500",
    },
    {
      name: "Close window",
      icon: X,
      action: () => host.close(),
      enabled: host.capabilities.close,
      color: "bg-red-400",
    },
  ];
  const ordered = mac ? [controls[2], controls[0], controls[1]] : controls;
  return (
    <div
      data-runic-no-drag
      style={{ "--webui-app-region": "no-drag" } as CSSProperties}
      className={cn(
        "flex shrink-0 items-center",
        mac && "gap-2 px-4",
        className,
      )}
    >
      {ordered.map(({ name, icon: Icon, action, enabled, color }) => (
        <button
          type="button"
          key={name}
          aria-label={name}
          title={name}
          disabled={!enabled}
          onClick={() => run(action)}
          className={cn(
            "group grid place-items-center outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:pointer-events-none",
            mac
              ? cn(
                  "size-3.5 rounded-full",
                  color,
                  !host.state.focused && "!bg-muted-foreground",
                )
              : "h-11 w-11 text-muted-foreground hover:bg-accent",
            !mac &&
              name === "Close window" &&
              "hover:bg-red-600 hover:text-white",
          )}
        >
          <Icon
            aria-hidden
            className={cn(
              mac
                ? "size-2.5 text-black opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70"
                : "size-3.5",
            )}
          />
        </button>
      ))}
    </div>
  );
}

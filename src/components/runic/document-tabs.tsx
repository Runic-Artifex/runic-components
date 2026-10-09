"use client";
import { useId, useRef, type ReactNode } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
export interface DocumentTab {
  id: string;
  title: string;
  dirty?: boolean;
  icon?: ReactNode;
}
export function DocumentTabs({
  tabs,
  value,
  onValueChange,
  onClose,
  onAdd,
  children,
  className,
}: {
  tabs: DocumentTab[];
  value: string;
  onValueChange: (id: string) => void;
  onClose?: (id: string) => void;
  onAdd?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const prefix = useId();
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const tabId = (id: string) => prefix + "-tab-" + id;
  const panelId = prefix + "-panel";
  const select = (index: number) => {
    const tab = tabs[index];
    if (tab) {
      onValueChange(tab.id);
      refs.current.get(tab.id)?.focus();
    }
  };
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex shrink-0 items-center border-b border-border bg-muted/20">
        <div
          role="tablist"
          aria-label="Open documents"
          className="flex min-w-0 flex-1 overflow-x-auto"
        >
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={cn(
                "relative flex shrink-0 items-center border-r border-border",
                value === tab.id &&
                  "bg-background after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-primary",
              )}
            >
              <button
                type="button"
                role="tab"
                id={tabId(tab.id)}
                aria-controls={panelId}
                aria-selected={value === tab.id}
                tabIndex={value === tab.id ? 0 : -1}
                ref={(el) => {
                  if (el) refs.current.set(tab.id, el);
                  else refs.current.delete(tab.id);
                }}
                className="flex h-10 items-center gap-2 pl-4 pr-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                onClick={() => onValueChange(tab.id)}
                onKeyDown={(e) => {
                  const next =
                    e.key === "ArrowRight"
                      ? (index + 1) % tabs.length
                      : e.key === "ArrowLeft"
                        ? (index - 1 + tabs.length) % tabs.length
                        : e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? tabs.length - 1
                            : null;
                  if (next !== null) {
                    e.preventDefault();
                    select(next);
                  }
                  if (e.key === "Delete" && onClose) {
                    e.preventDefault();
                    onClose(tab.id);
                  }
                }}
              >
                {tab.icon}
                <span>{tab.title}</span>
                {tab.dirty && (
                  <span
                    className="size-1.5 rounded-full bg-primary"
                    aria-label="Unsaved changes"
                  />
                )}
              </button>
              {onClose && (
                <button
                  type="button"
                  aria-label={"Close " + tab.title}
                  onClick={() => onClose(tab.id)}
                  className="mr-2 grid size-6 place-items-center rounded text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <X aria-hidden className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        {onAdd && (
          <button
            type="button"
            aria-label="New document"
            onClick={onAdd}
            className="m-1 grid size-8 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Plus aria-hidden className="size-4" />
          </button>
        )}
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={
          tabs.some((t) => t.id === value) ? tabId(value) : undefined
        }
        aria-label={tabs.length ? undefined : "No open documents"}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {children}
      </div>
    </div>
  );
}

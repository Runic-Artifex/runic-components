<script module lang="ts">
  import type { Snippet } from "svelte";
  export interface DocumentTab {
    id: string;
    title: string;
    dirty?: boolean;
    icon?: Snippet;
  }
</script>

<script lang="ts">
  import { tick } from "svelte";
  import { X, Plus } from "@lucide/svelte";
  import { cn } from "./utils";
  let {
    tabs,
    value,
    onValueChange,
    onClose,
    onAdd,
    children,
    class: className,
  }: {
    tabs: DocumentTab[];
    value: string;
    onValueChange: (id: string) => void;
    onClose?: (id: string) => void;
    onAdd?: () => void;
    children: Snippet;
    class?: string;
  } = $props();
  const prefix = $props.id();
  const tabId = (id: string) => `${prefix}-tab-${id}`;
  const panelId = `${prefix}-panel`;
  async function select(index: number) {
    const tab = tabs[index];
    if (tab) {
      onValueChange(tab.id);
      await tick();
      document.getElementById(tabId(tab.id))?.focus();
    }
  }
  function keydown(event: KeyboardEvent, index: number, id: string) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      void select(next);
    }
    if (event.key === "Delete" && onClose) {
      event.preventDefault();
      onClose(id);
    }
  }
</script>

<div class={cn("flex min-h-0 flex-1 flex-col", className)}>
  <div class="flex shrink-0 items-center border-b border-border bg-muted/20">
    <div
      role="tablist"
      aria-label="Open documents"
      class="flex min-w-0 flex-1 overflow-x-auto"
    >
      {#each tabs as tab, index (tab.id)}
        <div
          class={cn(
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
            tabindex={value === tab.id ? 0 : -1}
            class="flex h-10 items-center gap-2 pl-4 pr-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            onclick={() => onValueChange(tab.id)}
            onkeydown={(event) => keydown(event, index, tab.id)}
          >
            {@render tab.icon?.()}<span>{tab.title}</span>
            {#if tab.dirty}<span
                class="size-1.5 rounded-full bg-primary"
                aria-label="Unsaved changes"
              ></span>{/if}
          </button>
          {#if onClose}<button
              type="button"
              aria-label={`Close ${tab.title}`}
              onclick={() => onClose?.(tab.id)}
              class="mr-2 grid size-6 place-items-center rounded text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              ><X aria-hidden="true" class="size-3" /></button
            >{/if}
        </div>
      {/each}
    </div>
    {#if onAdd}<button
        type="button"
        aria-label="New document"
        onclick={onAdd}
        class="m-1 grid size-8 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
        ><Plus aria-hidden="true" class="size-4" /></button
      >{/if}
  </div>
  <div
    role="tabpanel"
    id={panelId}
    aria-labelledby={tabs.some((tab) => tab.id === value)
      ? tabId(value)
      : undefined}
    aria-label={tabs.length ? undefined : "No open documents"}
    tabindex="0"
    class="min-h-0 flex-1 overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
  >
    {@render children()}
  </div>
</div>

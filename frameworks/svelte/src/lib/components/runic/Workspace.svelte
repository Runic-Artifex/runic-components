<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "./utils";
  let {
    sidebar,
    children,
    sidebarLabel = "Sidebar width",
    defaultWidth = 220,
    minWidth = 160,
    maxWidth = 360,
    collapsed = false,
    class: className,
  }: {
    sidebar: Snippet;
    children: Snippet;
    sidebarLabel?: string;
    defaultWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    collapsed?: boolean;
    class?: string;
  } = $props();
  const clamp = (n: number) => Math.min(maxWidth, Math.max(minWidth, n));
  // Initial width uses the initial default; live bounds are applied below.
  // svelte-ignore state_referenced_locally
  let width = $state(clamp(defaultWidth));
  const boundedWidth = $derived(clamp(width));
  let start: { x: number; width: number } | undefined;
  function down(event: PointerEvent) {
    if (event.button !== 0) return;
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    start = { x: event.clientX, width: boundedWidth };
  }
  function up(event: PointerEvent) {
    start = undefined;
    const target = event.currentTarget as HTMLDivElement;
    if (target.hasPointerCapture(event.pointerId))
      target.releasePointerCapture(event.pointerId);
  }
  function keydown(event: KeyboardEvent) {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      width =
        event.key === "Home"
          ? minWidth
          : event.key === "End"
            ? maxWidth
            : clamp(
                boundedWidth +
                  (event.key === "ArrowRight" ? 1 : -1) *
                    (event.shiftKey ? 32 : 8),
              );
    }
  }
</script>

<div class={cn("flex min-h-0 flex-1 overflow-hidden", className)}>
  {#if !collapsed}
    <aside
      style:width={`${boundedWidth}px`}
      class="shrink-0 overflow-auto bg-muted/15"
    >
      {@render sidebar()}
    </aside>
    <!-- A focusable separator exposes the adjustable width and supports keyboard resizing. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      role="separator"
      aria-label={sidebarLabel}
      aria-orientation="vertical"
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuenow={boundedWidth}
      tabindex="0"
      class="relative z-10 w-1 shrink-0 cursor-col-resize touch-none bg-border outline-none before:absolute before:inset-y-0 before:-left-1 before:w-3 hover:bg-primary focus-visible:bg-primary"
      onpointerdown={down}
      onpointermove={(event) => {
        if (start) width = clamp(start.width + event.clientX - start.x);
      }}
      onpointerup={up}
      onpointercancel={() => {
        start = undefined;
      }}
      onlostpointercapture={() => {
        start = undefined;
      }}
      ondblclick={() => {
        width = clamp(defaultWidth);
      }}
      onkeydown={keydown}
    ></div>
  {/if}
  <div class="flex min-w-0 flex-1 flex-col">{@render children()}</div>
</div>

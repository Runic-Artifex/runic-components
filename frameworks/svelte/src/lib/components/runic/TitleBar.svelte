<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "./utils";
  import {
    useWindowHost,
    useWindowAction,
    type WindowPlatform,
  } from "./window-host";
  import WindowControls from "./WindowControls.svelte";
  let {
    title,
    icon,
    actions,
    platform = "windows",
    class: className,
  }: {
    title: string;
    icon?: Snippet;
    actions?: Snippet;
    platform?: WindowPlatform;
    class?: string;
  } = $props();
  const context = useWindowHost();
  const host = $derived(context.host);
  const run = useWindowAction();
  function drag(event: PointerEvent) {
    if (
      event.button === 0 &&
      event.detail !== 2 &&
      host.capabilities.move &&
      host.startDragging
    )
      run(() => host.startDragging!());
  }
  function maximize() {
    if (host.capabilities.maximize) run(() => host.toggleMaximize());
  }
</script>

<header
  class={cn(
    "flex h-11 shrink-0 select-none items-center border-b border-border bg-muted/30",
    !host.state.focused && "opacity-65",
    className,
  )}
>
  {#if platform === "macos"}<WindowControls {platform} />{/if}
  <!-- Dragging is a pointer-only native gesture; accessible window commands are adjacent buttons. -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    data-runic-drag-region
    style:--webui-app-region={host.capabilities.move ? "drag" : "no-drag"}
    style:touch-action="none"
    class="flex h-full min-w-0 flex-1 items-center gap-2.5 px-4 text-xs text-muted-foreground"
    onpointerdown={drag}
    ondblclick={maximize}
  >
    {@render icon?.()}<span class="truncate">{title}</span>
  </div>
  {#if actions}<div
      data-runic-no-drag
      style:--webui-app-region="no-drag"
      class="flex items-center gap-1 px-2"
    >
      {@render actions()}
    </div>{/if}
  {#if platform !== "macos"}<WindowControls {platform} />{/if}
</header>

<script lang="ts">
  import { Minus, Square, Copy, X } from "@lucide/svelte";
  import { cn } from "./utils";
  import {
    useWindowHost,
    useWindowAction,
    type WindowPlatform,
  } from "./window-host";
  let {
    platform = "windows",
    class: className,
  }: { platform?: WindowPlatform; class?: string } = $props();
  const context = useWindowHost();
  const run = useWindowAction();
  const host = $derived(context.host);
  const mac = $derived(platform === "macos");
  const controls = $derived([
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
  ]);
  const ordered = $derived(
    mac ? [controls[2], controls[0], controls[1]] : controls,
  );
</script>

<div
  data-runic-no-drag
  style:--webui-app-region="no-drag"
  class={cn("flex shrink-0 items-center", mac && "gap-2 px-4", className)}
>
  {#each ordered as control (control.name)}
    <button
      type="button"
      aria-label={control.name}
      title={control.name}
      disabled={!control.enabled}
      onclick={() => run(control.action)}
      class={cn(
        "group grid place-items-center outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:pointer-events-none",
        mac
          ? cn(
              "size-3.5 rounded-full",
              control.color,
              !host.state.focused && "!bg-muted-foreground",
            )
          : "h-11 w-11 text-muted-foreground hover:bg-accent",
        !mac &&
          control.name === "Close window" &&
          "hover:bg-red-600 hover:text-white",
      )}
    >
      <control.icon
        aria-hidden="true"
        class={cn(
          mac
            ? "size-2.5 text-black opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70"
            : "size-3.5",
        )}
      />
    </button>
  {/each}
</div>

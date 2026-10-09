<script setup lang="ts">
import { computed } from "vue";
import { Minus, Square, Copy, X } from "./icons";
import { cn } from "./utils";
import { useWindowContext, type WindowPlatform } from "./window-host";
const props = withDefaults(defineProps<{ platform?: WindowPlatform }>(), {
  platform: "windows",
});
const context = useWindowContext();
const mac = computed(() => props.platform === "macos");
const controls = computed(() => {
  const host = context.host;
  const items = [
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
  return mac.value ? [items[2], items[0], items[1]] : items;
});
</script>
<template>
  <div
    data-runic-no-drag
    style="--webui-app-region: no-drag"
    :class="cn('flex shrink-0 items-center', mac && 'gap-2 px-4')"
  >
    <button
      v-for="control in controls"
      :key="control.name"
      type="button"
      :aria-label="control.name"
      :title="control.name"
      :disabled="!control.enabled"
      @click="context.run(control.action)"
      :class="
        cn(
          'group grid place-items-center outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:pointer-events-none',
          mac
            ? cn(
                'size-3.5 rounded-full',
                control.color,
                !context.host.state.focused && '!bg-muted-foreground',
              )
            : 'h-11 w-11 text-muted-foreground hover:bg-accent',
          !mac &&
            control.name === 'Close window' &&
            'hover:bg-red-600 hover:text-white',
        )
      "
    >
      <component
        :is="control.icon"
        aria-hidden="true"
        :class="
          cn(
            mac
              ? 'size-2.5 text-black opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70'
              : 'size-3.5',
          )
        "
      />
    </button>
  </div>
</template>

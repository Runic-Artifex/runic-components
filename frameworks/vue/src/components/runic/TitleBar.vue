<script setup lang="ts">
import { cn } from "./utils";
import { useWindowContext, type WindowPlatform } from "./window-host";
import WindowControls from "./WindowControls.vue";
const props = withDefaults(
  defineProps<{ title?: string; platform?: WindowPlatform }>(),
  { platform: "windows" },
);
const context = useWindowContext();
function drag(event: PointerEvent) {
  if (
    event.button === 0 &&
    event.detail !== 2 &&
    context.host.capabilities.move &&
    context.host.startDragging
  )
    context.run(() => context.host.startDragging!());
}
function maximize() {
  if (context.host.capabilities.maximize)
    context.run(() => context.host.toggleMaximize());
}
</script>
<template>
  <header
    :class="
      cn(
        'flex h-11 shrink-0 select-none items-center border-b border-border bg-muted/30',
        !context.host.state.focused && 'opacity-65',
      )
    "
  >
    <WindowControls
      v-if="props.platform === 'macos'"
      :platform="props.platform"
    />
    <div
      data-runic-drag-region
      :style="{
        '--webui-app-region': context.host.capabilities.move
          ? 'drag'
          : 'no-drag',
        touchAction: 'none',
      }"
      class="flex h-full min-w-0 flex-1 items-center gap-2.5 px-4 text-xs text-muted-foreground"
      @pointerdown="drag"
      @dblclick="maximize"
    >
      <slot name="icon" /><span class="truncate"
        ><slot name="title">{{ props.title }}</slot></span
      >
    </div>
    <div
      v-if="$slots.actions"
      data-runic-no-drag
      style="--webui-app-region: no-drag"
      class="flex items-center gap-1 px-2"
    >
      <slot name="actions" />
    </div>
    <WindowControls
      v-if="props.platform !== 'macos'"
      :platform="props.platform"
    />
  </header>
</template>

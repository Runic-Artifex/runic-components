<script setup lang="ts">
import { ref, computed } from "vue";
const props = withDefaults(
  defineProps<{
    sidebarLabel?: string;
    defaultWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    collapsed?: boolean;
  }>(),
  {
    sidebarLabel: "Sidebar width",
    defaultWidth: 220,
    minWidth: 160,
    maxWidth: 360,
    collapsed: false,
  },
);
const clamp = (n: number) =>
  Math.min(props.maxWidth, Math.max(props.minWidth, n));
const width = ref(props.defaultWidth);
const actualWidth = computed(() => clamp(width.value));
let start: { x: number; width: number } | null = null;
function down(event: PointerEvent) {
  if (event.button !== 0) return;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  start = { x: event.clientX, width: actualWidth.value };
}
function move(event: PointerEvent) {
  if (start) width.value = clamp(start.width + event.clientX - start.x);
}
function up(event: PointerEvent) {
  start = null;
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId))
    target.releasePointerCapture(event.pointerId);
}
function keydown(event: KeyboardEvent) {
  if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    width.value =
      event.key === "Home"
        ? props.minWidth
        : event.key === "End"
          ? props.maxWidth
          : clamp(
              actualWidth.value +
                (event.key === "ArrowRight" ? 1 : -1) *
                  (event.shiftKey ? 32 : 8),
            );
  }
}
</script>
<template>
  <div class="flex min-h-0 flex-1 overflow-hidden">
    <template v-if="!props.collapsed"
      ><aside
        :style="{ width: actualWidth + 'px' }"
        class="shrink-0 overflow-auto bg-muted/15"
      >
        <slot name="sidebar" />
      </aside>
      <div
        role="separator"
        :aria-label="props.sidebarLabel"
        aria-orientation="vertical"
        :aria-valuemin="props.minWidth"
        :aria-valuemax="props.maxWidth"
        :aria-valuenow="actualWidth"
        tabindex="0"
        class="relative z-10 w-1 shrink-0 cursor-col-resize touch-none bg-border outline-none before:absolute before:inset-y-0 before:-left-1 before:w-3 hover:bg-primary focus-visible:bg-primary"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="start = null"
        @lostpointercapture="start = null"
        @dblclick="width = props.defaultWidth"
        @keydown="keydown"
    /></template>
    <div class="flex min-w-0 flex-1 flex-col"><slot /></div>
  </div>
</template>

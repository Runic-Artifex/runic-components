<script setup lang="ts">
import { useId, nextTick, type ComponentPublicInstance } from "vue";
import { X, Plus } from "./icons";
import type { DocumentTab } from "./document-tab";
import { cn } from "./utils";
const props = withDefaults(
  defineProps<{
    tabs: DocumentTab[];
    modelValue: string;
    closable?: boolean;
    addable?: boolean;
  }>(),
  { closable: true, addable: false },
);
const emit = defineEmits<{
  "update:modelValue": [id: string];
  close: [id: string];
  add: [];
}>();
const prefix = useId();
const tabId = (id: string) => prefix + "-tab-" + id;
const panelId = prefix + "-panel";
const refs = new Map<string, HTMLButtonElement>();
function setRef(id: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLButtonElement) refs.set(id, el);
  else refs.delete(id);
}
async function select(index: number) {
  const tab = props.tabs[index];
  if (tab) {
    emit("update:modelValue", tab.id);
    await nextTick();
    refs.get(tab.id)?.focus();
  }
}
function keydown(event: KeyboardEvent, index: number) {
  const next =
    event.key === "ArrowRight"
      ? (index + 1) % props.tabs.length
      : event.key === "ArrowLeft"
        ? (index - 1 + props.tabs.length) % props.tabs.length
        : event.key === "Home"
          ? 0
          : event.key === "End"
            ? props.tabs.length - 1
            : null;
  if (next !== null) {
    event.preventDefault();
    void select(next);
  }
  if (event.key === "Delete" && props.closable) {
    event.preventDefault();
    emit("close", props.tabs[index].id);
  }
}
</script>
<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex shrink-0 items-center border-b border-border bg-muted/20">
      <div
        role="tablist"
        aria-label="Open documents"
        class="flex min-w-0 flex-1 overflow-x-auto"
      >
        <div
          v-for="(tab, index) in props.tabs"
          :key="tab.id"
          :class="
            cn(
              'relative flex shrink-0 items-center border-r border-border',
              props.modelValue === tab.id &&
                'bg-background after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-primary',
            )
          "
        >
          <button
            :ref="(el) => setRef(tab.id, el)"
            type="button"
            role="tab"
            :id="tabId(tab.id)"
            :aria-controls="panelId"
            :aria-selected="props.modelValue === tab.id"
            :tabindex="props.modelValue === tab.id ? 0 : -1"
            class="flex h-10 items-center gap-2 pl-4 pr-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            @click="emit('update:modelValue', tab.id)"
            @keydown="keydown($event, index)"
          >
            <component
              v-if="tab.icon"
              :is="tab.icon"
              aria-hidden="true"
              class="size-3"
            /><span>{{ tab.title }}</span
            ><span
              v-if="tab.dirty"
              class="size-1.5 rounded-full bg-primary"
              aria-label="Unsaved changes"
            /></button
          ><button
            v-if="props.closable"
            type="button"
            :aria-label="'Close ' + tab.title"
            @click="emit('close', tab.id)"
            class="mr-2 grid size-6 place-items-center rounded text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X aria-hidden="true" class="size-3" />
          </button>
        </div>
      </div>
      <button
        v-if="props.addable"
        type="button"
        aria-label="New document"
        @click="emit('add')"
        class="m-1 grid size-8 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Plus aria-hidden="true" class="size-4" />
      </button>
    </div>
    <div
      role="tabpanel"
      :id="panelId"
      :aria-labelledby="
        props.tabs.some((t) => t.id === props.modelValue)
          ? tabId(props.modelValue)
          : undefined
      "
      :aria-label="props.tabs.length ? undefined : 'No open documents'"
      tabindex="0"
      class="min-h-0 flex-1 overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <slot />
    </div>
  </div>
</template>

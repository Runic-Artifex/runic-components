<script setup lang="ts">
import { provide } from "vue";
import { windowContextKey, type WindowHost } from "./window-host";
const props = defineProps<{
  host: WindowHost;
  onError: (error: unknown) => void;
}>();
provide(windowContextKey, {
  get host() {
    return props.host;
  },
  run(action) {
    try {
      Promise.resolve(action()).catch((error) => props.onError(error));
    } catch (error) {
      props.onError(error);
    }
  },
});
</script>
<template><slot /></template>

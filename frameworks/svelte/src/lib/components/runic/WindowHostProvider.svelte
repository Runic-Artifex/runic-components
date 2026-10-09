<script lang="ts">
  import type { Snippet } from "svelte";
  import { setWindowHostContext, type WindowHost } from "./window-host";
  let {
    host,
    onError,
    children,
  }: {
    host: WindowHost;
    onError: (error: unknown) => void;
    children: Snippet;
  } = $props();
  setWindowHostContext({
    get host() {
      return host;
    },
    get onError() {
      return onError;
    },
  });
</script>

{@render children()}

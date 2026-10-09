<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "./utils";
  let {
    class: className,
    children,
    ...props
  }: HTMLAttributes<HTMLSpanElement> & { children?: Snippet } = $props();
</script>

<span class={cn("inline-flex items-center gap-1.5", className)} {...props}
  >{@render children?.()}</span
>

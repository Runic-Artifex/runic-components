<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "./utils";
  let {
    class: className,
    children,
    ...props
  }: HTMLAttributes<HTMLElement> & { children?: Snippet } = $props();
</script>

<footer
  aria-label="Application status"
  class={cn(
    "flex h-8 shrink-0 items-center justify-between gap-3 border-t border-border bg-muted/30 px-3 text-[11px] text-muted-foreground",
    className,
  )}
  {...props}
>
  {@render children?.()}
</footer>

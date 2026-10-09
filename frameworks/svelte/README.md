# Runic Components for shadcn-svelte

Svelte 5 sources for application chrome inside a frameless Runic WebView. The title bar, window controls, document tabs, resizable workspace, and status bar use your existing Tailwind 4 / shadcn-svelte theme variables.

From the repository root:

```sh
npm run dev:svelte
npm run check --workspace @runic-components/svelte
npm run test --workspace @runic-components/svelte
npm run build --workspace @runic-components/svelte
```

The browser demo is served on port 5191, or at `http://localhost:5190/svelte/` through the main demo after a build. The native sample uses `svelte/native.html` within the shared `dist` directory.

Install editable sources into an initialized shadcn-svelte project:

```sh
npx shadcn-svelte@1.7.0 add http://localhost:5190/r/svelte/runic-shell.json
```

The registry includes its own context, adapter and `cn` utility. Component sources do not import React, the demonstration stylesheet, or the demonstration application's generated client. The adapter accepts a structural command interface; generate your own Runic Views client from your application's .NET ViewModel.

## Connect the native host

Call `useView` during component initialization with a getter. Keep the returned handle intact so its reactive properties remain live. Derive the host from the current snapshot and merge capabilities with the generated command execution flags:

```svelte
<script lang="ts">
  import { useView } from "@runic-artifex/svelte";
  import { connectShell } from "./generated/shell";
  import WindowHostProvider from "$lib/components/runic/WindowHostProvider.svelte";
  import TitleBar from "$lib/components/runic/TitleBar.svelte";
  import { createRunicWindowHost } from "$lib/components/runic/runic-window-host";

  const view = useView(() => ({ connect: connectShell }));
  let focused = $state(false);
  let error = $state<string>();
  const host = $derived(
    view.state && view.client
      ? createRunicWindowHost(view.client, {
          ...view.state,
          focused,
          canMinimize:
            view.state.supportsMinimize &&
            view.state.canMinimize &&
            !view.state.isMinimizeExecuting,
          canToggleMaximized:
            view.state.supportsMaximize &&
            view.state.canToggleMaximized &&
            !view.state.isToggleMaximizedExecuting,
          canRequestClose:
            view.state.canRequestClose && !view.state.isRequestCloseExecuting,
        })
      : undefined,
  );
</script>

<svelte:window
  onfocus={() => {
    focused = true;
  }}
  onblur={() => {
    focused = false;
  }}
/>
{#if host}
  <WindowHostProvider
    {host}
    onError={(cause) => {
      error = String(cause);
    }}
  >
    <TitleBar title="My application" platform="linux" />
  </WindowHostProvider>
{/if}
{#if error}<p role="alert">{error}</p>{/if}
```

The host owns close confirmation. `DocumentTabs` is controlled: its `onClose(id)` callback lets your application confirm dirty documents before removing them. Its content and component composition use Svelte 5 snippets; the `sidebar`, title bar `icon`, and title bar `actions` are named snippets.

Native dragging uses Runic's authenticated `--webui-app-region` protocol. The adapter does not invent a drag command: `canMove` must reflect the native provider's actual capabilities. GTK4 dragging is currently unavailable in the Runic stack; see the root gap ledger (RC-005).

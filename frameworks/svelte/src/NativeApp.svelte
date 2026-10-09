<script lang="ts">
  import { useView } from "@runic-artifex/svelte";
  import { connectShell } from "../../../src/generated/shell";
  import { FileText, GitBranch, PanelLeft, Search } from "@lucide/svelte";
  import { createRunicWindowHost } from "./lib/components/runic/runic-window-host";
  import WindowHostProvider from "./lib/components/runic/WindowHostProvider.svelte";
  import TitleBar from "./lib/components/runic/TitleBar.svelte";
  import Workspace from "./lib/components/runic/Workspace.svelte";
  import DocumentTabs from "./lib/components/runic/DocumentTabs.svelte";
  import StatusBar from "./lib/components/runic/StatusBar.svelte";
  import StatusBarItem from "./lib/components/runic/StatusBarItem.svelte";
  import type { WindowPlatform } from "./lib/components/runic/window-host";
  const view = useView(() => ({ connect: connectShell }));
  let focused = $state(typeof document !== "undefined" && document.hasFocus());
  let sidebarShown = $state(true);
  let commandError = $state<string>();
  const snapshot = $derived(view.state);
  const host = $derived(
    snapshot && view.client
      ? createRunicWindowHost(view.client, {
          ...snapshot,
          focused,
          canMinimize:
            snapshot.supportsMinimize &&
            snapshot.canMinimize &&
            !snapshot.isMinimizeExecuting,
          canToggleMaximized:
            snapshot.supportsMaximize &&
            snapshot.canToggleMaximized &&
            !snapshot.isToggleMaximizedExecuting,
          canRequestClose:
            snapshot.canRequestClose && !snapshot.isRequestCloseExecuting,
        })
      : undefined,
  );
  const platform: WindowPlatform =
    typeof navigator !== "undefined" && navigator.userAgent.includes("Mac")
      ? "macos"
      : typeof navigator !== "undefined" &&
          navigator.userAgent.includes("Windows")
        ? "windows"
        : "linux";
</script>

<svelte:window
  onfocus={() => {
    focused = true;
  }}
  onblur={() => {
    focused = false;
  }}
/>
{#if view.error}
  <div class="empty-state">
    <h3>Could not connect to Runic.</h3>
    <p role="alert">{String(view.error)}</p>
    <button class="demo-button" onclick={() => view.retry()}
      >Retry connection</button
    >
  </div>
{:else if !snapshot || !host}
  <div class="empty-state">
    <h3>Connecting to Runic Desktop…</h3>
    <p>
      Launch the native sample to connect this page to its generated Views
      bridge.
    </p>
  </div>
{:else}
  <WindowHostProvider
    {host}
    onError={(error) => {
      commandError = String(error);
    }}
  >
    <div class="native-window">
      <TitleBar title="Runic Components · Svelte native workbench" {platform}>
        {#snippet icon()}<FileText size={15} />{/snippet}
        {#snippet actions()}<button
            class="demo-button"
            aria-label="Toggle sidebar"
            onclick={() => {
              sidebarShown = !sidebarShown;
            }}><PanelLeft size={14} /></button
          >{/snippet}
      </TitleBar>
      <Workspace collapsed={!sidebarShown}>
        {#snippet sidebar()}<div class="explorer">
            <div class="explorer-label">RUNIC DESKTOP</div>
            <div class="file active"><FileText size={14} />Welcome.md</div>
            <div class="file"><Search size={14} />Generated Views bridge</div>
          </div>{/snippet}
        <DocumentTabs
          tabs={[{ id: "welcome", title: "Welcome.md" }]}
          value="welcome"
          onValueChange={() => {}}
        >
          <article class="note">
            <div class="eyebrow">REAL HOST · REAL COMMANDS</div>
            <h2>The desktop, composed.</h2>
            <p>
              This frameless window is hosted by Runic Desktop. The controls
              call the .NET ViewModel through the generated Runic Views client.
            </p>
            <p>
              {snapshot.canMove
                ? "Try dragging the title bar, minimizing the window, or maximizing and restoring it."
                : "Try minimizing, maximizing, and restoring the window. Native dragging is disabled because this Runic provider does not implement it yet (RC-005)."}
              The close button requests close through the host's confirmation policy.
            </p>
            <div class="note-divider"></div>
            <div class="note-section-title">
              The same source. A native frame.
            </div>
            <p>
              Svelte useView owns connection and disposal. The host publishes
              capabilities. Components use your existing shadcn theme.
            </p>
            {#if commandError}<p role="alert">{commandError}</p>{/if}
          </article>
        </DocumentTabs>
      </Workspace>
      <StatusBar
        ><StatusBarItem
          ><span class="connection-dot"></span>Runic Views connected</StatusBarItem
        ><StatusBarItem
          ><GitBranch size={12} />Native WebView · Svelte · {platform}</StatusBarItem
        ></StatusBar
      >
    </div>
  </WindowHostProvider>
{/if}

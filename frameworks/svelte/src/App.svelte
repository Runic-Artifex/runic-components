<script lang="ts">
  import {
    FileText,
    GitBranch,
    PanelLeft,
    Moon,
    Sun,
    ArrowUpRight,
    Layers,
    Feather,
    Check,
    Plus,
  } from "@lucide/svelte";
  import WindowHostProvider from "./lib/components/runic/WindowHostProvider.svelte";
  import TitleBar from "./lib/components/runic/TitleBar.svelte";
  import Workspace from "./lib/components/runic/Workspace.svelte";
  import DocumentTabs, {
    type DocumentTab,
  } from "./lib/components/runic/DocumentTabs.svelte";
  import StatusBar from "./lib/components/runic/StatusBar.svelte";
  import StatusBarItem from "./lib/components/runic/StatusBarItem.svelte";
  import type {
    WindowHost,
    WindowPlatform,
  } from "./lib/components/runic/window-host";
  let platform = $state<WindowPlatform>("windows");
  let focused = $state(true);
  let maximized = $state(false);
  let visible = $state(true);
  let minimized = $state(false);
  let sidebarShown = $state(true);
  let light = $state(false);
  let notice = $state("Ready to create");
  let tabs = $state<DocumentTab[]>([
    { id: "welcome", title: "Welcome.md" },
    { id: "ideas", title: "Ideas.md", dirty: true },
  ]);
  let value = $state("welcome");
  let notes = $state<Record<string, string>>({
    welcome:
      "Small, considered details make a desktop feel like home.\n\nTry editing this note. Your unsaved changes stay with the document.",
    ideas: "An idea for tomorrow: a workspace that follows your own rhythm.",
  });
  const note = $derived(notes[value] ?? "");
  let confirmClose = $state<string>();
  let confirmWindow = $state(false);
  let nextId = 1;
  const active = $derived(tabs.find((tab) => tab.id === value));
  const host = $derived<WindowHost>({
    state: { maximized, focused },
    capabilities: { minimize: true, maximize: true, close: true, move: false },
    minimize: () => {
      minimized = true;
      notice = "Window minimized · browser simulation";
    },
    toggleMaximize: () => {
      maximized = !maximized;
      notice = maximized ? "Window maximized" : "Window restored";
    },
    close: () => {
      if (tabs.length) confirmWindow = true;
      else {
        visible = false;
        notice = "Window closed · browser simulation";
      }
    },
  });
  function restore() {
    visible = true;
    minimized = false;
    confirmWindow = false;
    notice = "Window restored";
  }
  function closeTab(id: string) {
    if (tabs.find((tab) => tab.id === id)?.dirty) confirmClose = id;
    else removeTab(id);
  }
  function removeTab(id: string) {
    const index = tabs.findIndex((tab) => tab.id === id);
    tabs = tabs.filter((tab) => tab.id !== id);
    if (value === id) value = tabs[Math.min(index, tabs.length - 1)]?.id ?? "";
    confirmClose = undefined;
  }
  function addTab() {
    const id = `note-${nextId++}`;
    tabs = [...tabs, { id, title: "Untitled.md" }];
    notes[id] = "";
    value = id;
    notice = "New document created";
  }
  function edit(event: Event) {
    notes[value] = (event.target as HTMLTextAreaElement).value;
    tabs = tabs.map((tab) =>
      tab.id === value ? { ...tab, dirty: true } : tab,
    );
  }
  function save() {
    tabs = tabs.map((tab) =>
      tab.id === value ? { ...tab, dirty: false } : tab,
    );
    notice = "Document saved · browser simulation";
  }
  function theme() {
    light = !light;
    document.documentElement.classList.toggle("light", light);
  }
</script>

<div class="site">
  <nav class="site-nav" aria-label="Main navigation">
    <a class="brand" href="/"
      ><Feather class="rune" /><span>Runic <b>/ Components</b></span></a
    >
    <div class="nav-links">
      <a href="http://localhost:5190/">React</a><a
        href="#playground"
        class="framework-tag">Svelte 5</a
      ><a href="http://localhost:5190/vue/">Vue</a><button
        class="demo-button"
        onclick={theme}
        aria-label={light ? "Use dark theme" : "Use light theme"}
        >{#if light}<Moon size={14} />{:else}<Sun size={14} />{/if}</button
      >
    </div>
  </nav>
  <section class="hero">
    <div class="eyebrow">
      <span></span> BUILT FOR THE RUNIC STACK <span class="eyebrow-rule"></span> SVELTE
      EDITION
    </div>
    <div class="hero-row">
      <div>
        <h1>The desktop,<br /><em>composed.</em></h1>
        <p>
          Application chrome for frameless WebViews.<br />Svelte 5 components,
          your shadcn theme, a real Runic connection.
        </p>
      </div>
      <a class="hero-link" href="#install"
        >Own every detail <ArrowUpRight size={15} /></a
      >
    </div>
    <div class="hero-meta">
      <span><Layers size={13} /> Five composable components</span><span
        ><Check size={13} /> Svelte 5 · Tailwind 4</span
      ><span class="preview-badge">LOCAL PREVIEW</span>
    </div>
  </section>
  <section
    id="playground"
    class="playground"
    aria-label="Interactive component playground"
  >
    <div class="playground-toolbar">
      <div class="section-label">
        <span class="connection-dot"></span> INTERACTIVE WORKBENCH
      </div>
      <div class="playground-options">
        <label class="platform-label"
          >Platform <select bind:value={platform}
            ><option value="windows">Windows</option><option value="macos"
              >macOS</option
            ><option value="linux">Linux</option></select
          ></label
        ><label class="focus-toggle"
          ><input type="checkbox" bind:checked={focused} /> Focused</label
        >
      </div>
    </div>
    <div class={["demo-stage", { maximized }]}>
      {#if visible && !minimized}
        <WindowHostProvider
          {host}
          onError={(error) => {
            notice = String(error);
          }}
        >
          <div class={["app-window", { unfocused: !focused }]}>
            <TitleBar title="Runic Studio · Personal workspace" {platform}>
              {#snippet icon()}<Feather size={16} />{/snippet}
              {#snippet actions()}<button
                  class="demo-button"
                  aria-label="Toggle sidebar"
                  onclick={() => {
                    sidebarShown = !sidebarShown;
                  }}><PanelLeft size={14} /></button
                >{/snippet}
            </TitleBar>
            <Workspace collapsed={!sidebarShown}>
              {#snippet sidebar()}
                <div class="explorer">
                  <div class="explorer-label">WORKSPACE</div>
                  <div class="project-name">
                    <Feather size={13} /> Personal notes
                  </div>
                  <div class="file-list">
                    {#each tabs as tab (tab.id)}<button
                        class={["file", { active: value === tab.id }]}
                        onclick={() => {
                          value = tab.id;
                        }}
                        ><FileText size={13} />{tab.title}{#if tab.dirty}<span
                            class="dirty-dot"
                          ></span>{/if}</button
                      >{/each}
                  </div>
                  <div class="explorer-label">YOUR SPACE, YOUR RHYTHM</div>
                  <div class="sidebar-bottom">
                    <span class="connection-dot"></span> Browser host simulation
                  </div>
                </div>
              {/snippet}
              <DocumentTabs
                {tabs}
                {value}
                onValueChange={(id) => {
                  value = id;
                }}
                onClose={closeTab}
                onAdd={addTab}
              >
                {#if active}<article class="note">
                    <div class="note-topline">
                      <span
                        ><FileText size={12} />
                        {active.title.toUpperCase()}</span
                      ><button class="demo-button" onclick={save}
                        ><Check size={12} /> Save</button
                      >
                    </div>
                    <div class="eyebrow">A QUIETER WORKSPACE</div>
                    <h2>Room for your next idea.</h2>
                    <p>
                      A native feeling starts with the small things: a title bar
                      that knows the host, tabs that respect your work, and a
                      sidebar that makes room.
                    </p>
                    <textarea
                      aria-label="Document note"
                      class="edit-note"
                      value={note}
                      oninput={edit}></textarea>
                    <p class="muted">
                      Use arrow keys in the tabs, Delete to close, and arrow
                      keys on the sidebar divider to resize.
                    </p>
                    {#if confirmClose}<div
                        class="inline-dialog"
                        role="alertdialog"
                        aria-label="Unsaved document"
                      >
                        <p>
                          Discard unsaved changes in {tabs.find(
                            (tab) => tab.id === confirmClose,
                          )?.title}?
                        </p>
                        <button
                          class="demo-button primary"
                          onclick={() => {
                            if (confirmClose) removeTab(confirmClose);
                          }}>Discard changes</button
                        >
                        <button
                          class="demo-button"
                          onclick={() => {
                            confirmClose = undefined;
                          }}>Keep editing</button
                        >
                      </div>{/if}{#if confirmWindow}<div
                        class="inline-dialog"
                        role="alertdialog"
                        aria-label="Close demo window"
                      >
                        <p>
                          Close this simulated window? You can reopen it below.
                        </p>
                        <button
                          class="demo-button primary"
                          onclick={() => {
                            visible = false;
                            confirmWindow = false;
                            notice = "Window closed · browser simulation";
                          }}>Close demo</button
                        >
                        <button
                          class="demo-button"
                          onclick={() => {
                            confirmWindow = false;
                          }}>Cancel</button
                        >
                      </div>{/if}
                  </article>{:else}<div class="empty-state">
                    <h3>A fresh start.</h3>
                    <button class="demo-button" onclick={addTab}
                      ><Plus size={14} /> Create a document</button
                    >
                  </div>{/if}
              </DocumentTabs>
            </Workspace>
            <StatusBar
              ><StatusBarItem
                ><span class="connection-dot"></span>{notice}</StatusBarItem
              ><StatusBarItem
                ><GitBranch size={12} /> Svelte 5 · {platform}</StatusBarItem
              ></StatusBar
            >
          </div>
        </WindowHostProvider>
      {:else}<div class="empty-state">
          <h3>{minimized ? "Taking a little space." : "See you soon."}</h3>
          <p>
            {minimized
              ? "The demo window is minimized."
              : "The demo window is closed."}
          </p>
          <button class="demo-button" onclick={restore}
            >Restore demo window</button
          >
        </div>{/if}
    </div>
    <div class="playground-footnote">
      <span>Browser simulation · native dragging follows host capabilities</span
      ><button onclick={restore}>Reset window <ArrowUpRight size={12} /></button
      >
    </div>
  </section>
  <section id="install" class="install-panel">
    <div class="eyebrow">SOURCE YOU OWN</div>
    <h2>Bring the shell into your application.</h2>
    <p class="muted">
      Install into an initialized shadcn-svelte project. These are editable
      Svelte sources with no React dependency.
    </p>
    <pre>npx shadcn-svelte@1.7.0 add http://localhost:5190/r/svelte/runic-shell.json</pre>
    <p class="muted">
      Wrap the chrome in WindowHostProvider. Derive its host from your generated
      Runic Views client through createRunicWindowHost; useView owns connection
      and disposal.
    </p>
  </section>
  <footer class="playground-footnote">
    <span>RUNIC ARTIFEX / SVELTE COMPONENTS</span><a
      href="http://localhost:5190/"
      >Explore the React edition <ArrowUpRight size={12} /></a
    >
  </footer>
</div>

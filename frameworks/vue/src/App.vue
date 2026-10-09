<script setup lang="ts">
import { computed, ref, watch, markRaw } from "vue";
import {
  FileText,
  FileCode2,
  Folder,
  GitBranch,
  PanelLeft,
  LayoutPanelLeft,
  Layers,
  Maximize2,
  Terminal,
  Sun,
  Moon,
  Check,
  ChevronDown,
  ArrowRight,
} from "@lucide/vue";
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "reka-ui";
import WindowHostProvider from "./components/runic/WindowHostProvider.vue";
import TitleBar from "./components/runic/TitleBar.vue";
import DocumentTabs from "./components/runic/DocumentTabs.vue";
import Workspace from "./components/runic/Workspace.vue";
import StatusBar from "./components/runic/StatusBar.vue";
import StatusBarItem from "./components/runic/StatusBarItem.vue";
import type {
  WindowHost,
  WindowPlatform,
} from "./components/runic/window-host";
import type { DocumentTab } from "./components/runic/document-tab";
const platform = ref<WindowPlatform>("linux"),
  focused = ref(true),
  maximized = ref(false),
  minimized = ref(false),
  closed = ref(false),
  sidebar = ref(true),
  light = ref(false),
  editing = ref(false),
  active = ref("welcome"),
  event = ref(
    "Browser simulation · Native actions connect through Runic Views.",
  ),
  confirm = ref<string | null>(null),
  selected = ref(0);
const confirmOpen = computed({
  get: () => confirm.value !== null,
  set: (open) => {
    if (!open) confirm.value = null;
  },
});
const FileIcon = markRaw(FileText),
  CodeIcon = markRaw(FileCode2);
const initialTabs: DocumentTab[] = [
  { id: "welcome", title: "Welcome.md", icon: FileIcon },
  { id: "shell", title: "AppShell.vue", icon: CodeIcon },
  { id: "tokens", title: "theme.css", icon: CodeIcon },
];
const tabs = ref<DocumentTab[]>(initialTabs.map((tab) => ({ ...tab })));
const originalNote =
  "A home for your next idea.\n\nEvery good tool begins with a space that feels like yours. A quiet canvas, familiar controls, and just enough structure to stay in flow.\n\nRunic Components brings that feeling to your WebView application. Compose the shell. Connect your host. Make the rest your own.";
const shellCode = [
  '<WindowHostProvider :host="host" :on-error="reportError">',
  '  <TitleBar title="Runic Notes" platform="linux" />',
  '  <Workspace :collapsed="!sidebar">',
  "    <template #sidebar><Explorer /></template>",
  '    <DocumentTabs v-model="active" :tabs="tabs" @close="closeTab">',
  "      <Editor />",
  "    </DocumentTabs>",
  "  </Workspace>",
  "  <StatusBar><ConnectionStatus /></StatusBar>",
  "</WindowHostProvider>",
].join("\n");
const initialNotes: Record<string, string> = {
  welcome: originalNote,
  shell: shellCode,
  tokens:
    ":root {\n  --background: #111713;\n  --foreground: #e7e5db;\n  --primary: #c4a568;\n  --border: #2a332c;\n}",
};
const notes = ref({ ...initialNotes });
const currentNote = computed({
  get: () => notes.value[active.value] ?? "",
  set: (value) => {
    notes.value[active.value] = value;
    tabs.value = tabs.value.map((tab) =>
      tab.id === active.value ? { ...tab, dirty: true } : tab,
    );
  },
});
const host = computed<WindowHost>(() => ({
  state: { maximized: maximized.value, focused: focused.value },
  capabilities: { minimize: true, maximize: true, close: true, move: true },
  minimize: () => {
    minimized.value = true;
    event.value = "Window minimized";
  },
  toggleMaximize: () => {
    maximized.value = !maximized.value;
    event.value = maximized.value ? "Window maximized" : "Window restored";
  },
  close: () => {
    confirm.value = "window";
  },
  startDragging: () => {
    event.value = "Drag requested · browser simulation";
  },
}));
watch(light, (value) =>
  document.documentElement.classList.toggle("light", value),
);
function closeTab(id: string, force = false) {
  if (!force && tabs.value.find((tab) => tab.id === id)?.dirty) {
    confirm.value = id;
    return;
  }
  const index = tabs.value.findIndex((tab) => tab.id === id);
  tabs.value = tabs.value.filter((tab) => tab.id !== id);
  if (active.value === id)
    active.value = tabs.value[Math.max(0, index - 1)]?.id ?? "";
  delete notes.value[id];
  editing.value = false;
  event.value = "Document closed";
}
function openTab(id: string) {
  if (!tabs.value.some((tab) => tab.id === id)) {
    const tab = initialTabs.find((tab) => tab.id === id);
    if (tab) {
      tabs.value.push({ ...tab });
      notes.value[id] = initialNotes[id];
    }
  }
  active.value = id;
  editing.value = false;
}
function addTab() {
  const id = crypto.randomUUID();
  tabs.value.push({ id, title: "Untitled.md", icon: FileIcon });
  notes.value[id] = "";
  active.value = id;
  editing.value = true;
  event.value = "Document created";
}
function save() {
  tabs.value = tabs.value.map((tab) =>
    tab.id === active.value ? { ...tab, dirty: false } : tab,
  );
  editing.value = false;
  event.value = "Document saved";
}
function discard() {
  if (confirm.value === "window") {
    closed.value = true;
    editing.value = false;
    tabs.value = initialTabs.map((tab) => ({ ...tab }));
    notes.value = { ...initialNotes };
    active.value = "welcome";
    event.value = "Window closed";
  } else if (confirm.value) closeTab(confirm.value, true);
  confirm.value = null;
}
function reset() {
  minimized.value = false;
  closed.value = false;
  maximized.value = false;
  tabs.value = initialTabs.map((tab) => ({ ...tab }));
  notes.value = { ...initialNotes };
  active.value = "welcome";
  editing.value = false;
  event.value = "Workspace reset";
}
const components = [
  {
    name: "Title bar",
    icon: LayoutPanelLeft,
    detail:
      "Runic drag regions, interactive action exclusions, focus state, and double-click maximize.",
  },
  {
    name: "Window controls",
    icon: Maximize2,
    detail:
      "Capability-aware native intent. Linux, Windows, and macOS layouts.",
  },
  {
    name: "Document tabs",
    icon: Layers,
    detail:
      "Controlled selection, unsaved indicators, separate close buttons, and keyboard navigation.",
  },
  {
    name: "Workspace",
    icon: PanelLeft,
    detail:
      "Resizable sidebar with pointer capture, keyboard bounds, and persistent collapsed width.",
  },
  {
    name: "Status bar",
    icon: Terminal,
    detail:
      "Composable application status for connectivity, background work, and document context.",
  },
];
</script>
<template>
  <div class="site">
    <nav class="site-nav">
      <a href="http://localhost:5190/" class="brand"
        ><Layers :size="24" class="text-primary" /><span
          >Runic <b>Components</b></span
        ></a
      >
      <div class="framework-links">
        <a href="http://localhost:5190/">React</a
        ><a href="http://localhost:5191/">Svelte</a
        ><a class="active" href="#" aria-current="page">Vue</a
        ><button
          class="demo-button"
          :aria-label="light ? 'Use dark theme' : 'Use light theme'"
          @click="light = !light"
        >
          <Moon v-if="light" :size="14" /><Sun v-else :size="14" />
        </button>
      </div>
    </nav>
    <main>
      <section class="hero framework-hero">
        <div class="eyebrow">RUNIC ARTIFEX · SHADCN VUE</div>
        <h1>The desktop, <em>composed.</em></h1>
        <p>
          The same Runic application shell, expressed in Vue.<br />Source you
          own. Native intent. A frame for what comes next.
        </p>
        <div class="hero-meta">
          <span>Vue 3.5 + Tailwind 4</span><span>shadcn-vue registry</span
          ><span>Runic Views</span
          ><span class="preview-badge">EXPERIMENTAL · v0.1</span>
        </div>
      </section>
      <section class="playground">
        <div class="playground-toolbar">
          <div class="section-label">
            <span class="connection-dot" />LIVE VUE WORKSPACE
          </div>
          <div class="playground-options">
            <label
              >Window platform
              <select
                aria-label="Window platform"
                v-model="platform"
                class="bg-background p-1 rounded"
              >
                <option value="linux">Linux</option>
                <option value="windows">Windows</option>
                <option value="macos">macOS</option>
              </select></label
            ><label class="focus-toggle"
              ><input type="checkbox" v-model="focused" />Focused</label
            ><button class="demo-button" @click="reset">Reset</button>
          </div>
        </div>
        <div class="demo-stage" :class="{ maximized }">
          <div v-if="closed || minimized" class="empty-state">
            <Layers :size="28" />
            <h3>{{ closed ? "Window closed." : "Window minimized." }}</h3>
            <p>The browser demo simulates native actions.</p>
            <button
              class="demo-button"
              @click="
                closed = false;
                minimized = false;
              "
            >
              Restore workspace
            </button>
          </div>
          <WindowHostProvider
            v-else
            :host="host"
            :on-error="(error) => (event = String(error))"
            ><div class="app-window framework-window">
              <TitleBar title="Runic Notes / Vue workspace" :platform="platform"
                ><template #icon
                  ><Layers :size="15" class="text-primary" /></template
                ><template #actions
                  ><button
                    class="demo-button"
                    :aria-label="sidebar ? 'Hide sidebar' : 'Show sidebar'"
                    @click="sidebar = !sidebar"
                  >
                    <PanelLeft :size="14" /></button></template></TitleBar
              ><Workspace :collapsed="!sidebar" :default-width="208"
                ><template #sidebar
                  ><div class="explorer">
                    <div class="explorer-heading">EXPLORER</div>
                    <div class="project-name">
                      <ChevronDown :size="13" /><Folder :size="14" />runic-notes
                    </div>
                    <button
                      v-for="tab in initialTabs"
                      :key="tab.id"
                      class="file"
                      :class="{ active: active === tab.id }"
                      @click="openTab(tab.id)"
                    >
                      <component :is="tab.icon" :size="13" />{{ tab.title }}
                    </button>
                    <div class="explorer-label">WORKSPACE</div>
                    <button class="file" @click="addTab">
                      <FileText :size="14" />New document
                    </button>
                    <div class="sidebar-bottom">
                      <span class="connection-dot" />Vue workspace<span
                        class="mono ml-auto"
                        >v0.1</span
                      >
                    </div>
                  </div></template
                ><DocumentTabs
                  :tabs="tabs"
                  v-model="active"
                  addable
                  @close="closeTab"
                  @add="addTab"
                  ><div v-if="!tabs.length" class="empty-state">
                    <Layers :size="28" />
                    <h3>A little room to think.</h3>
                    <button class="demo-button" @click="addTab">
                      New document
                    </button>
                  </div>
                  <article v-else class="note">
                    <div class="note-topline">
                      <span
                        ><FileText :size="12" />{{
                          active === "welcome"
                            ? "GETTING STARTED"
                            : "SOURCE YOU OWN"
                        }}</span
                      ><button
                        class="demo-button"
                        @click="editing ? save() : (editing = true)"
                      >
                        <Check v-if="editing" :size="12" />{{
                          editing ? "Save note" : "Edit note"
                        }}
                      </button>
                    </div>
                    <textarea
                      v-if="editing"
                      aria-label="Edit document"
                      class="note-editor"
                      v-model="currentNote"
                    /><template v-else-if="active === 'welcome'"
                      ><h2>{{ currentNote.split("\n\n")[0] }}</h2>
                      <p
                        v-for="paragraph in currentNote.split('\n\n').slice(1)"
                        :key="paragraph"
                      >
                        {{ paragraph }}
                      </p>
                      <div class="note-divider" />
                      <div class="note-section-title">
                        A familiar frame. Entirely yours.
                      </div>
                      <div class="note-features">
                        <div>
                          <span>01</span>
                          <h4>Compose</h4>
                          <p>Vue slots.<br />Parts that work together.</p>
                        </div>
                        <div>
                          <span>02</span>
                          <h4>Connect</h4>
                          <p>Your Runic host.<br />Typed window commands.</p>
                        </div>
                        <div>
                          <span>03</span>
                          <h4>Create</h4>
                          <p>Your application.<br />Source you own.</p>
                        </div>
                      </div></template
                    >
                    <pre v-else class="code-block">{{
                      currentNote || "Your next idea starts here."
                    }}</pre>
                  </article></DocumentTabs
                ></Workspace
              ><StatusBar
                ><div class="flex items-center gap-4">
                  <StatusBarItem><GitBranch :size="12" />main</StatusBarItem
                  ><StatusBarItem
                    ><span class="connection-dot" />Browser
                    simulation</StatusBarItem
                  >
                </div>
                <StatusBarItem>Vue · UTF-8</StatusBarItem></StatusBar
              >
            </div></WindowHostProvider
          >
        </div>
        <div class="playground-footnote">
          <span role="status">{{ event }}</span
          ><span>Arrows / Home / End on tabs and splitter</span>
        </div>
      </section>
      <section class="components-section">
        <div class="section-heading">
          <div>
            <div class="eyebrow">THE BUILDING BLOCKS</div>
            <h2>Beyond the page.</h2>
          </div>
          <p>
            Five primitives. One host contract.<br />Native Vue components and
            composition.
          </p>
        </div>
        <div class="component-grid">
          <button
            v-for="(item, index) in components"
            :key="item.name"
            class="component-card"
            :class="{ selected: selected === index }"
            :aria-pressed="selected === index"
            @click="selected = index"
          >
            <div class="card-top">
              <component :is="item.icon" :size="21" /><span
                >0{{ index + 1 }}</span
              >
            </div>
            <h3>{{ item.name }}</h3>
            <p>{{ item.detail }}</p>
            <div class="card-bottom">
              <span>Inspect component</span><ArrowRight :size="13" />
            </div>
          </button>
        </div>
        <div class="component-detail">
          <strong>{{ components[selected].name }}</strong>
          <p>{{ components[selected].detail }}</p>
        </div>
      </section>
      <section class="framework-stack">
        <div class="eyebrow">SOURCE YOU OWN</div>
        <h2>Bring your own application.</h2>
        <p>
          Keep the React demo server running to serve all three registries. Add
          Vue source to an initialized shadcn-vue application.
        </p>
        <pre class="framework-install">
npx shadcn-vue@2.8.2 add http://localhost:5190/r/vue/runic-shell.json</pre>
        <p>
          Native integration uses <code>@runic-artifex/vue</code> and the same
          generated Shell client as React and Svelte.
          <a href="http://localhost:5190/INTEGRATION.md"
            >Read the integration guide →</a
          >
        </p>
      </section>
    </main>
    <footer class="framework-footer">
      <span>RUNIC ARTIFEX · VUE EXPLORATION</span
      ><a href="http://localhost:5190/GAP-LEDGER.md"
        >Runic integration gap ledger →</a
      >
    </footer>
    <DialogRoot v-model:open="confirmOpen"
      ><DialogPortal
        ><DialogOverlay class="dialog-overlay" /><DialogContent
          class="confirm-dialog framework-confirm"
          ><DialogTitle>{{
            confirm === "window"
              ? "Close this workspace?"
              : "Discard unsaved changes?"
          }}</DialogTitle
          ><DialogDescription>{{
            confirm === "window"
              ? "This simulates a native close request. You can reopen the workspace afterward."
              : "Closing this document will discard its unsaved changes."
          }}</DialogDescription>
          <div class="flex justify-end gap-2 mt-6">
            <DialogClose>Keep working</DialogClose
            ><button @click="discard">
              {{ confirm === "window" ? "Close workspace" : "Discard changes" }}
            </button>
          </div></DialogContent
        ></DialogPortal
      ></DialogRoot
    >
  </div>
</template>

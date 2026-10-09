<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useView } from "@runic-artifex/vue";
import { FileText, GitBranch, PanelLeft } from "@lucide/vue";
import { connectShell } from "../../../src/generated/shell";
import { createRunicWindowHost } from "./components/runic/runic-window-host";
import type { WindowPlatform } from "./components/runic/window-host";
import WindowHostProvider from "./components/runic/WindowHostProvider.vue";
import TitleBar from "./components/runic/TitleBar.vue";
import Workspace from "./components/runic/Workspace.vue";
import DocumentTabs from "./components/runic/DocumentTabs.vue";
import StatusBar from "./components/runic/StatusBar.vue";
import StatusBarItem from "./components/runic/StatusBarItem.vue";
const { state, client, error, retry } = useView({ connect: connectShell });
const focused = ref(document.hasFocus()),
  sidebar = ref(true),
  commandError = ref<string>();
const focus = () => (focused.value = true),
  blur = () => (focused.value = false);
onMounted(() => {
  window.addEventListener("focus", focus);
  window.addEventListener("blur", blur);
});
onUnmounted(() => {
  window.removeEventListener("focus", focus);
  window.removeEventListener("blur", blur);
});
const host = computed(() =>
  state.value && client.value
    ? createRunicWindowHost(client.value, {
        ...state.value,
        focused: focused.value,
        canMinimize:
          state.value.supportsMinimize &&
          state.value.canMinimize &&
          !state.value.isMinimizeExecuting,
        canToggleMaximized:
          state.value.supportsMaximize &&
          state.value.canToggleMaximized &&
          !state.value.isToggleMaximizedExecuting,
        canRequestClose:
          state.value.canRequestClose && !state.value.isRequestCloseExecuting,
      })
    : undefined,
);
const platform: WindowPlatform = navigator.userAgent.includes("Mac")
  ? "macos"
  : navigator.userAgent.includes("Windows")
    ? "windows"
    : "linux";
</script>
<template>
  <div v-if="error" class="empty-state">
    <h3>Could not connect to Runic.</h3>
    <p role="alert">{{ String(error) }}</p>
    <button class="demo-button" @click="retry">Retry connection</button>
  </div>
  <div v-else-if="!host" class="empty-state">
    <h3>Connecting to Runic Desktop…</h3>
    <p>Launch the native Vue sample to connect its generated Views bridge.</p>
  </div>
  <WindowHostProvider
    v-else
    :host="host"
    :on-error="(error) => (commandError = String(error))"
    ><div class="native-window framework-native">
      <TitleBar
        title="Runic Components · Vue native workbench"
        :platform="platform"
        ><template #icon><FileText :size="15" /></template
        ><template #actions
          ><button
            class="demo-button"
            aria-label="Toggle sidebar"
            @click="sidebar = !sidebar"
          >
            <PanelLeft :size="14" /></button></template></TitleBar
      ><Workspace :collapsed="!sidebar"
        ><template #sidebar
          ><div class="explorer">
            <div class="explorer-label">RUNIC DESKTOP · VUE</div>
            <div class="file active"><FileText :size="14" />Welcome.md</div>
            <div class="file">Generated Views bridge</div>
          </div></template
        ><DocumentTabs
          :tabs="[{ id: 'welcome', title: 'Welcome.md' }]"
          model-value="welcome"
          :closable="false"
          ><article class="note">
            <div class="eyebrow">REAL HOST · NATIVE VUE</div>
            <h2>The desktop, composed.</h2>
            <p>
              This WebView connects Vue composables to the same generated Shell
              client and .NET ViewModel as the React and Svelte examples.
            </p>
            <p>
              Try minimizing, maximizing, and restoring the window. Close
              requests honor the host's confirmation policy.
            </p>
            <p v-if="!host.capabilities.move">
              Native title-bar dragging is disabled for the current provider.
              See RC-005 in the gap ledger.
            </p>
            <div class="note-divider" />
            <div class="note-section-title">
              One host contract. Native framework composition.
            </div>
            <p>
              Runic Vue owns connection and disposal. Slots compose the shell.
              Capability and pending state gate native controls.
            </p>
            <p v-if="commandError" role="alert">{{ commandError }}</p>
          </article></DocumentTabs
        ></Workspace
      ><StatusBar
        ><StatusBarItem
          ><span class="connection-dot" />Runic Views connected</StatusBarItem
        ><StatusBarItem
          ><GitBranch :size="12" />Vue · Native WebView ·
          {{ platform }}</StatusBarItem
        ></StatusBar
      >
    </div></WindowHostProvider
  >
</template>

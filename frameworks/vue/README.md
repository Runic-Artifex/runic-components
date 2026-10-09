# Runic Components for shadcn-vue

Vue 3 components for frameless Runic WebViews, using slots, reactive context, controlled document tabs, and existing Tailwind 4/shadcn-vue theme variables.

```sh
npm run dev:vue
npx shadcn-vue@2.8.2 add http://localhost:5190/r/vue/runic-shell.json
npm run native:run -- --frontend=vue
```

Install the registry into an initialized shadcn-vue project while the root demo server runs. Components, context, utility, and adapter install under your configured `components/runic` directory. They have no dependency on the demo's styles or generated Shell client.

## Connect your generated client

Call `useView` in component setup. Its state and client are refs; read their current values inside `computed` so snapshots update controls. Runic owns connection and disposal.

```ts
import { computed } from "vue";
import { useView } from "@runic-artifex/vue";
import { connectShell } from "./generated/shell";
import { createRunicWindowHost } from "@/components/runic/runic-window-host";

const { state, client, error, retry } = useView({ connect: connectShell });
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
```

Render `WindowHostProvider` with `:host="host"` and `:on-error="reportError"` when connected; put `TitleBar` and your workspace inside it. Observe window focus/blur to update `focused`. See `src/NativeApp.vue` for the full example, including connection failure and retry.

`TitleBar` exposes `icon`, `title`, and `actions` slots. `Workspace` exposes `sidebar` and default content slots. `DocumentTabs` uses `v-model` for selection and emits `close`/`add`; the application owns dirty-document confirmation and selection after removal. The host owns native close confirmation.

Dragging uses the existing Runic CSS protocol. Capabilities must reflect the provider: GTK4 native dragging remains unavailable (RC-005). All native frontends share the root gap ledger and generated .NET contract.

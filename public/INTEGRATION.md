# Integrating with Runic

## Ownership and data flow

.NET owns native windows, capabilities, close policy, and application state.
Runic Views generates typed commands and snapshots from the ViewModel.
The framework packages `@runic-artifex/react`, `@runic-artifex/svelte`, and
`@runic-artifex/vue` own connection, observation, retry, and client disposal.
Runic Components owns rendering and input semantics. No component reaches into
native handles, host credentials, or private IPC.

```
ShellViewModel → generated ShellClient → useView → createRunicWindowHost
                                                       ↓
                                      TitleBar / WindowControls
```

`src/NativeApp.tsx`, `frameworks/svelte/src/NativeApp.svelte`, and
`frameworks/vue/src/NativeApp.vue` connect to the same `samples/desktop` host.
Select it with `--frontend=react|svelte|vue` (React defaults).
The component registry deliberately has no mandatory Runic runtime dependency;
its adapter accepts a structural subset of an app-generated Views client.
Install the React and Views packages matching your .NET SDK release in the app.

## Connect an application-generated client

```tsx
const { state, client, error, retry } = useView({ connect: connectShell });
if (error) return <ConnectionError error={error} retry={retry} />;
if (!state || !client) return <Connecting />;

const host = createRunicWindowHost(client, {
  ...state,
  focused, // observe browser focus / blur; native window state is a current SDK gap
  canMinimize:
    state.supportsMinimize && state.canMinimize && !state.isMinimizeExecuting,
  canToggleMaximized:
    state.supportsMaximize &&
    state.canToggleMaximized &&
    !state.isToggleMaximizedExecuting,
  canRequestClose: state.canRequestClose && !state.isRequestCloseExecuting,
});
return (
  <WindowHostProvider host={host} onError={reportError}>
    <TitleBar title="My application" platform="linux" />
    {/* Workspace, document tabs, application content, status bar */}
  </WindowHostProvider>
);
```

Keep the generated `connectShell` function stable. Do not wrap it in a new
connect function each render. Do not dispose the client in the adapter: `useView`
owns it. Command failures flow to `onError`. While connecting, do not render
usable window controls. Combine command availability and pending state with the
native capabilities, rather than assuming every presentation supports every action.

## Svelte and Vue lifecycle

Svelte 5 calls `useView(() => ({ connect: connectShell }))` during initialization.
Keep the handle intact and derive the host with `$derived`; destructuring its
reactive getters would capture stale state. Context is created per provider.
Vue calls `useView({ connect: connectShell })` in setup and reads the returned
refs inside `computed`. Its provider exposes a reactive host getter. Both use
the SDK lifecycle cleanup rather than disposing clients in the adapter.

Each port combines native support, generated command availability, and pending
flags. [Svelte](../frameworks/svelte/README.md) and [Vue](../frameworks/vue/README.md)
include framework-specific composition examples.

## Native setup

Use `DesktopEventLoop.Run` directly from `Main` before an await. Select a Linux backend explicitly. This sample defaults to
`WithGtk4()`; `--gtk3` uses `LinuxEmbeddedBackend.Gtk3WebKit41` for comparison.
GTK4 native dragging is currently unimplemented (RC-005).
Use an embedded presentation with `Frameless = true`. Do not silently fall back
to an installed browser: it cannot provide the same native window operations.
Validate options before opening and retain the window's scope until it closes.

The sample exposes these generated ViewModel commands:

| Client command      | Native operation                       |
| ------------------- | -------------------------------------- |
| `minimize()`        | `DesktopWindow.MinimizeAsync()`        |
| `toggleMaximized()` | `DesktopWindow.ToggleMaximizedAsync()` |
| `requestClose()`    | `DesktopWindow.RequestCloseAsync()`    |

Close is a user request, not disposal. `RequestCloseAsync` honors
`DesktopWindowOptions.ConfirmCloseAsync`. Use that policy for dirty documents,
background work, and save confirmation, including system-menu closes. The sample
has no native editable documents and explicitly approves requests. Its browser
playground independently demonstrates an unsaved-change dialog. Do not replace
user close requests with `CloseAsync`, which bypasses confirmation.

## Drag regions

Runic's existing Desktop bootstrap reads the CSS custom property
`--webui-app-region: drag`. The title bar sets it inline on the dedicated title
region when native movement is supported, and `no-drag` otherwise. Interactive toolbar actions and controls use `no-drag` and sit outside
that region. The native bootstrap sends the authenticated window-drag packet;
the adapter must not send a second drag command on pointer-down. Double-click
calls the generated maximize command. Keep arbitrary interactive elements out of
`title` and put them in `actions`.

## Vite and bootstrap

The current SDK plugin's `desktop: true` injection names `runic-desktop.js`,
which the checked Desktop Views host does not serve. See gap RC-001.
This repository uses `runic({ devtools: false })`, an explicit relative `base`,
and these two scripts in `native.html`, before the app module:

```html
<script src="./webui.js"></script>
<script src="./runic-desktop-views.js"></script>
```

Nested Svelte/Vue native entries use `../webui.js` and
`../runic-desktop-views.js` to reach host bootstrap assets at the `dist` root.
Runic serves each surface under a path prefix, so an absolute `/webui.js`
would miss that surface. Their Vite builds retain those runtime scripts as external HTML scripts.

Runic Desktop serves `webui.js` with its authenticated bootstrap. The Views
adapter is copied from `Runic.Application.Desktop/www/runic-desktop-views.js`
into this repository's `public/` directory, then Vite copies it into `dist/`.
The SDK's application build target normally copies that same adapter into its
`www/` output; this sample serves Vite's `dist/` directly. Sync the retained
adapter when upgrading the SDK. Do not copy credential-bearing runtime scripts
from a live surface or embed credentials in frontend assets.

## Theme and interaction

Registry components use shadcn semantic tokens (`background`, `foreground`,
`muted`, `accent`, `border`, `primary`, `ring`) and Tailwind utilities. The gallery
adds the Runic forest / warm gold palette and Geist / Cormorant typography;
those fonts and page styles are not imposed on consuming applications.

Document tabs are controlled. Applications own document contents, dirty state,
close confirmation, and the selection after removal. IDs must be unique and
`value` must reference an open document when tabs are present. Arrow keys wrap;
Home / End move to first / last; Delete requests close. Close buttons are separate
from tab buttons. The panel references the selected tab for its accessible name.

The Workspace splitter resizes an application sidebar, not the native window.
Use pointer dragging or Left / Right (8px), Shift + Left / Right (32px),
Home / End (bounds), or double-click (default width). Collapsing preserves its
in-memory width. Native border resize is a distinct host concern (RC-003).

## Current verification

The local SDK is commit `63fd4cfe`, release `0.7.0-preview.3`.
The generated C# bridge and native executable build with no warnings or errors.
The native GTK4 sample connects and visibly minimizes, maximizes, restores, and
closes through generated commands. Browser demo appearance was inspected in Zen.
Windows/macOS native behavior and title-bar drag gestures have not been verified
in this session. Maximize state is command-tracked pending RC-002.

The Svelte and Vue GTK4 entries were also verified to connect, maximize, restore,
and close through the same generated Shell commands. Their registry payloads were
installed with the actual framework CLIs and the installed sources type checked.
The Vue registry retains Lucide controls in a local icon module because the CLI's
icon conversion does not preserve dynamic icon references.

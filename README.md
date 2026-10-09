# Runic Components

An experimental shadcn registry for application chrome in frameless WebViews.
React, Svelte 5, Vue 3, Tailwind 4, and the Runic Artifex stack. Editable components use the receiving app's shadcn theme tokens.

## Run the demos

```sh
npm ci
npm run build
npm run dev
```

| Framework | Development command  | URL                   |
| --------- | -------------------- | --------------------- |
| React     | `npm run dev`        | http://localhost:5190 |
| Svelte    | `npm run dev:svelte` | http://localhost:5191 |
| Vue       | `npm run dev:vue`    | http://localhost:5192 |

After a build, the main server also serves Svelte at `/svelte/` and Vue at `/vue/`.
Each Notes playground supports platform controls, focus and window state simulation, editable notes, unsaved-change confirmation, document tabs, sidebar resizing, and light/dark appearance. The React playground additionally includes a command palette and source previews.

The browser playgrounds simulate window operations. Separate native entry points exercise Runic Desktop.

## Install into a shadcn project

Keep the main development server running. In an initialized Tailwind 4 project, use the CLI matching your framework:

```sh
npx shadcn@4.21.4 add http://localhost:5190/r/runic-shell.json
npx shadcn-svelte@1.7.0 add http://localhost:5190/r/svelte/runic-shell.json
npx shadcn-vue@2.8.2 add http://localhost:5190/r/vue/runic-shell.json
```

Individual items: `title-bar`, `window-controls`, `document-tabs`, `workspace`, `status-bar`, and `runic-window-host`. Replace `runic-shell` in the corresponding URL with an item name. Components install into the configured component directory's `runic` subdirectory. The React registry uses the app's `cn` helper; Svelte and Vue include a local utility.

Run `npm run registry:build` after source changes. Built payloads are committed for local installation and static hosting. See [Svelte integration](frameworks/svelte/README.md), [Vue integration](frameworks/vue/README.md), and [the shared integration guide](docs/INTEGRATION.md).

## Runic Desktop sample

This checkout is a sibling of `runic-sdk`. The sample reuses its locked Nix environment, local .NET projects, ReactiveUI model binding, and Views generator. Web dependencies match SDK `0.7.0-preview.3`.

```sh
npm run native:build
npm run build
npm run native:run
npm run native:run -- --frontend=svelte
npm run native:run -- --frontend=vue
```

The .NET build generates one Shell client and typed mock for all frontends. React is the default; the host serves `dist/native.html`, `dist/svelte/native.html`, or `dist/vue/native.html` in a frameless window. Linux defaults to GTK4/WebKitGTK6; pass `--gtk3` for comparison. Windows uses WebView2 and macOS uses WKWebView.

GTK4 movement is unimplemented in Runic (RC-005), so its drag region is disabled. GTK3 showed a system frame on this Wayland desktop despite `Frameless = true` (RC-006). The sample references the sibling SDK; it is not a standalone published .NET template. On other operating systems use the pinned `global.json` SDK and run `dotnet build`/`dotnet run` directly.

Confirmed Runic limitations and fixes to pursue are recorded in [the gap ledger](docs/GAP-LEDGER.md).

## Verify

```sh
npm test
npm run build
npm run native:build
npm run format:check
```

Tests exercise all three frameworks, keyboard interaction, capability gating, pending commands, bridge errors, and the actual generated Views client. Registry installation is checked with the corresponding CLI. Windows/macOS native behavior and native drag/resize gestures still need manual checks.

Node and dependencies are pinned. Native commands reuse the sibling SDK's `.envrc`; no duplicate SDK or browser install is needed. Registry tooling inherits upstream `braces` and `decode-uri-component` advisories, including a Stylus peer pulled by the Vue CLI. The audit reports 15 findings; automatic fixes require downgrading the verified CLIs. These tooling packages are not bundled into the demos.

MIT. The Runic Desktop Views bootstrap is retained under MIT; see [third-party notices](THIRD_PARTY_NOTICES.md).

# Runic Components

An experimental shadcn registry for application chrome in frameless WebViews.
React, Tailwind 4, and the Runic Artifex stack. Source is copied into your app;
components use its existing shadcn theme tokens.

## Run the demo

```sh
npm ci
npm run dev
```

Open http://localhost:5190. The Notes playground supports Linux / Windows / macOS
controls, focus simulation, maximize / minimize / close simulation, editable notes
with unsaved-change confirmation, document tabs, keyboard sidebar resizing,
a command dialog, light / dark appearance, and source previews.

The browser playground is explicitly a simulation. Native controls are exercised
by the separate Runic Desktop sample.

## Add to a shadcn project

Keep this repository's dev server running. In a React project with shadcn and
Tailwind 4 initialized:

```sh
npx shadcn@4.21.4 add http://localhost:5190/r/runic-shell.json
```

Individual items: `title-bar`, `window-controls`, `document-tabs`, `workspace`,
`status-bar`, and `runic-window-host`, served at `/r/<name>.json`.
Items declare explicit `@components/runic/` targets so configured component
aliases are respected. Supporting window files are bundled in each relevant item;
there is no unpublished namespace or dependency on a future hosted registry.
The registry uses the receiving project's `cn` helper. Run `npm run registry:build`
after changing component source. Built registry payloads are committed for local
installation and static hosting.

## Runic Desktop sample

This checkout is a sibling of `runic-sdk`. The sample reuses that SDK's locked
Nix environment, local .NET projects, ReactiveUI / model-context binding, and
Views generator. Web dependencies match SDK `0.7.0-preview.3`.

```sh
npm run native:build
npm run build
npm run native:run
```

The .NET build generates `src/generated/shell.ts` and its typed mock. The frontend
build emits both the browser demo and `native.html`. The native sample hosts
`dist/native.html` in a frameless embedded window, using GTK4 / WebKitGTK6 on
Linux, WebView2 on Windows, and WKWebView on macOS. Pass `npm run native:run -- --gtk3` to compare GTK3 / WebKitGTK4.1.
GTK4 native movement is unimplemented in the SDK (RC-005), so its drag region
is disabled. GTK3 displayed a system frame on this Wayland desktop despite
`Frameless = true` (RC-006); its cause still needs investigation.
The sample currently references
the sibling SDK checkout; this is an integration experiment, not a standalone
published .NET template. On other operating systems use the pinned SDK from
`global.json` and run `dotnet build` / `dotnet run` directly.

See [the integration guide](docs/INTEGRATION.md) for connection ownership,
capabilities, close policy, and the bootstrap workaround. Confirmed SDK gaps
and fixes to pursue are recorded in [the gap ledger](docs/GAP-LEDGER.md).

## Verify

```sh
npm test
npm run build
npm run native:build
```

Tests cover keyboard interaction, capability gating, bridge errors, and generated
Runic client integration. Native GTK4 minimize, maximize, restore, and close were
verified on this desktop. Native title-bar dragging and cross-platform resize
behavior still require manual checks; see the ledger.

Node is pinned in `.node-version`; dependencies are pinned in `package-lock.json`.
No separate Nix shell or browser installation is needed. Use the sibling SDK's
`.envrc` for native builds and runtime libraries. The production dependency audit
is clean. The shadcn CLI development dependency currently inherits the upstream
`braces <=3.0.3` advisory (GHSA-vfj7-8cjw-p6xm); no fixed release was available
when this prototype was created. It is not bundled into the application.

MIT. Runic Desktop Views bootstrap is retained from the sibling SDK under MIT;
see [third-party notices](THIRD_PARTY_NOTICES.md).

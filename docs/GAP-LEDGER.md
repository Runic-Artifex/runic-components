# Runic integration gap ledger

Observed during Runic Components exploration on 2026-10-09.
SDK: local `runic-sdk` at `63fd4cfe`, `0.7.0-preview.3`.
Open items below are SDK follow-up work; this experiment does not modify the SDK.
Priorities: P1 blocks normal integration; P2 limits correct native behavior;
P3 improves discoverability. Evidence is scoped to the provider/API inspected,
not a claim about every operating system.

| ID     | Priority | Gap                                                                    | Status                                                     | Prototype workaround                                             |
| ------ | -------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| RC-001 | P1       | Vite Desktop bootstrap and Desktop Views host disagree                 | Reproduced in native GTK4                                  | Explicit `webui.js` + retained Views adapter; relative Vite base |
| RC-002 | P2       | No public observable native maximize/focus state                       | Confirmed public API gap                                   | Command-tracked maximize state; DOM focus/blur                   |
| RC-003 | P2       | No public provider-neutral user resize gesture contract                | Confirmed API gap; GTK4 behavior needs manual reproduction | No fabricated resize IPC; app splitter only                      |
| RC-004 | P3       | Drag-region CSS protocol lacks consumer documentation                  | Confirmed documentation gap                                | Document and use the existing custom property                    |
| RC-005 | P1       | GTK4 advertises Move but BeginMoveAsync is not implemented             | Confirmed implementation gap                               | Disable GTK4 drag; GTK3 comparison is opt-in                     |
| RC-006 | P2       | GTK3 retained system decoration with Frameless on this Wayland desktop | Reproduced; cause undetermined                             | Keep GTK4 as default                                             |

## RC-001 — Vite Desktop bootstrap mismatch

**Evidence:** `packages/web/vite-plugin-runic/src/index.ts:163` injects
`./runic-desktop.js` for production with `desktop: true`. The existing
`examples/first-window-desktop/Frontend/index.html` loads `webui.js` and
`runic-desktop-views.js`; `Runic.Application.Desktop/build/Runic.Application.Desktop.targets`
ships the latter into `www/`. With only the Vite-injected script, this sample's
React page rendered but remained at “Connecting to Runic Desktop…” and the host
could not complete its startup connection. Replacing the bootstrap with the
existing Desktop Views pair connected the identical generated client.

**Impact:** Following the Vite README is insufficient to boot a Desktop Views
application. Code builds successfully while the native window remains disconnected.

**Fix to pursue:** Align the Vite option and Desktop Views server/bootstrap names.
Provide one documented integration that includes the Views transport adapter,
relative production assets, and authenticated document-start setup.

**Acceptance:** Build a React + Views fixture with the documented Vite option,
open its production assets in a native window, observe a generated snapshot,
execute a command, and reconnect. No hand-copied bootstrap workaround.

**Ownership suggestion:** Runic Vite plugin + Application.Desktop integration.

## RC-002 — Observable window state

**Evidence:** `Runic.Desktop/DesktopWindowHost.cs` exposes operation methods,
`Capabilities`, `IsOpen`, and `Closed`, but no native maximize/focus snapshot or
change event. `DesktopSurface.cs`'s `DesktopWindow` likewise exposes
`ToggleMaximizedAsync` without a maximized-state property/event.

**Impact:** The maximize button cannot reliably show the restore glyph after an
OS shortcut, system menu, compositor action, or another caller changes the window.
The sample's local toggle flag is accurate only for its own successful commands.
DOM focus is an approximation of native activation, not an authoritative host state.

**Fix to pursue:** Add an observable native window snapshot with maximized,
minimized/fullscreen, and activation fields as supported by each backend. Publish
changes through an app ViewModel or an official typed integration. Include
capability/unknown-state semantics and clear subscription ownership.

**Acceptance:** Trigger transitions both through Views commands and outside the
WebView. Observe consistent React controls and focus visuals; dispose subscribers
on close. Test GTK4, WebKitGTK3, WebView2, and WKWebView independently.

**Ownership suggestion:** Runic.Desktop provider APIs.

## RC-003 — Frameless native resizing

**Evidence:** `IDesktopWindowHost` has programmatic `ResizeAsync` and user-driven
`BeginMoveAsync`, but no public `BeginResizeAsync(direction)` or equivalent.
The bootstrap handles `--webui-app-region` dragging, not renderer-designated resize
edges. GTK3's `Internal/LinuxWebKitGtkHost.cs:OnButtonPress` has an internal
`BeginResize` path, so this is not an assertion that native resize is absent
everywhere. GTK4's `Gtk4WindowHostFactory.cs` advertises `Resize`, implements
programmatic sizing, and disables decoration for `Frameless`; the inspected API
provides no renderer-owned resize affordance contract.

**Impact:** A component cannot declare native resize edges consistently or tell
whether a host already supplies usable frameless edges. A sidebar splitter does
not solve native window resizing. Avoid resize-by-pointer-move loops sending
absolute dimensions over Views; those cannot preserve native compositor behavior.

**Fix to pursue:** First verify edge behavior per provider. Publish what each
backend supports, then define a capability and authenticated edge/corner gesture
contract where host edges are insufficient. Keep DPI and compositor behavior
inside the native provider.

**Acceptance:** Frameless edges/corners resize with minimum bounds and correct
cursor behavior on the supported backends, including Wayland. Existing native
hit-test behavior must not trigger twice. Verify browser fallback explicitly.

**Ownership suggestion:** Desktop native providers + bootstrap protocol.

## RC-004 — Document the drag-region contract

**Evidence:** `Internal/WebUiBridge.cs:328-358` walks computed styles for
`--webui-app-region: drag | no-drag`, arms left-button movement, and sends the
window-drag packet. Searching SDK Markdown for `--webui-app-region` returned no
consumer guidance. `-webkit-app-region` alone is not this Runic bootstrap's contract.

**Impact:** A component author can choose a familiar Electron/Tauri convention
and get a title bar that looks correct but does not move a Runic window.

**Fix to pursue:** Document the supported CSS property, dedicated drag regions,
interactive exclusions, custom-host support, and required bootstrap. Add a
minimal React example and a focused transport/gesture test.

**Acceptance:** A consumer following public docs can drag a frameless window,
use nested interactive actions without moving it, and double-click maximize
without duplicate native movement requests.

**Ownership suggestion:** Desktop docs + frontend integration examples.

## RC-005 — GTK4 frameless move is unimplemented

**Evidence:** `Runic.Desktop.Gtk4/Gtk4WindowHostFactory.cs:525` implements
`BeginMoveAsync` as `ValueTask.FromException(new NotSupportedException("GTK 4 frameless move is not yet implemented."))`.
The provider advertises `DesktopWindowCapabilities.Move` (line 375).
The existing bootstrap reaches this method, but the faulted operation cannot
move the native window. This is confirmed from implementation; UI automation
cannot synthesize the native drag gesture in this environment.

**Impact:** A Runic title bar cannot move this GTK4 frameless window. The capability
is misleading to consumers and the bootstrap silently ignores move faults.

**Fix to pursue:** Implement the GTK4 native movement gesture using the correct
seat/device/button/timestamp context. Until implemented, distinguish programmatic
positioning from user-driven movement in capabilities and report unsupported
drag accurately. Do not claim gesture support solely because a host has MoveAsync.

**Workaround:** The sample retains GTK4 for its verified frameless presentation
and disables its drag region. `npm run native:run -- --gtk3` selects GTK3 for
comparison; local GTK3 decoration behavior needs investigation (RC-006).
GTK3's `LinuxWebKitGtkHost.BeginMoveAsync` delegates to its implemented native move path.

**Acceptance:** With GTK4 and Wayland, a left-button drag on a Runic drag region
moves the frameless window; controls remain clickable and double-click maximize
works. Unsupported gesture providers advertise the limitation correctly.

**Ownership suggestion:** Runic.Desktop.Gtk4 + capability semantics.

## RC-006 — GTK3 Frameless option did not remove the system frame locally

**Evidence:** With `LinuxEmbeddedBackend.Gtk3WebKit41`, `BrowserKind.Embedded`,
and `Frameless = true`, the connected native comparison sample visibly retained
a KDE system title bar above the component title bar. GTK4 with the same window
options had no system frame. `LinuxWebKitGtkHost.cs:205` does call
`GtkWindowSetDecorated(window, !options.Frameless && !options.Kiosk)`.

**Status:** Reproduced on this KDE/Wayland desktop. Root cause is undetermined;
this could be provider behavior, compositor policy, or an environment interaction.
Do not classify it as a proven cross-platform SDK defect yet.

**Impact:** This GTK3 presentation does not satisfy the intended CSD appearance.
Switching to GTK3 to work around RC-005 did not produce an acceptable default.

**Investigation:** Check effective GTK decoration state and the compositor's
window rules. Reproduce on a clean Wayland session and X11, then determine whether
Runic should change its GTK3 setup or document a compositor constraint.

**Workaround:** GTK4 is the default native sample, with native drag disabled.
The GTK3 option is retained for comparison, not claimed as a complete fallback.

**Acceptance:** On the affected setup, either the GTK3 embedded presentation honors
Frameless without a system title bar, or startup diagnostics accurately explain
the external constraint with a documented alternative.

**Ownership suggestion:** Desktop GTK3 provider investigation + environment diagnosis.

## Verification boundaries

Native GTK4 connection, minimize, maximize, restore, and user close were verified
through this prototype. Native drag gestures and resize-edge behavior were not
verified by UI automation (the available Linux automation cannot drag).
Windows/macOS remain untested here. The unavailable AT-SPI accessibility bus and
the local GTK theme warning are host-environment observations, not established
SDK defects, and are deliberately not listed as Runic gaps.

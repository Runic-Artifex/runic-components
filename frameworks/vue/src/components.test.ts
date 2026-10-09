import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { defineComponent, ref, nextTick } from "vue";
import { it, expect, vi, afterEach } from "vitest";
import { createMockBridge, installMockBridge } from "@runic-artifex/views/mock";
import { mockShell } from "../../../src/generated/shell.mock";
import NativeApp from "./NativeApp.vue";
import WindowHostProvider from "./components/runic/WindowHostProvider.vue";
import TitleBar from "./components/runic/TitleBar.vue";
import Workspace from "./components/runic/Workspace.vue";
import DocumentTabs from "./components/runic/DocumentTabs.vue";
it("reacts to provider changes and propagates command failures", async () => {
  const maximize = vi.fn(),
    error = vi.fn();
  const host = ref({
    state: { maximized: false, focused: true },
    capabilities: { minimize: true, maximize: true, close: true, move: false },
    minimize: () => {},
    toggleMaximize: maximize,
    close: () => {
      throw Error("Close failed");
    },
  });
  render(
    defineComponent({
      components: { WindowHostProvider, TitleBar },
      setup: () => ({ host, error }),
      template:
        '<WindowHostProvider :host="host" :on-error="error"><TitleBar title="App"/></WindowHostProvider>',
    }),
  );
  await fireEvent.click(
    screen.getByRole("button", { name: "Maximize window" }),
  );
  expect(maximize).toHaveBeenCalledOnce();
  host.value = {
    ...host.value,
    state: { maximized: true, focused: false },
    capabilities: { ...host.value.capabilities, minimize: false },
  };
  await nextTick();
  expect(
    screen.getByRole("button", { name: "Restore window" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Minimize window" }),
  ).toBeDisabled();
  await fireEvent.click(screen.getByRole("button", { name: "Close window" }));
  expect(error).toHaveBeenCalledWith(Error("Close failed"));
});
it("navigates controlled document tabs and requests dirty closure", async () => {
  const close = vi.fn();
  render(
    defineComponent({
      components: { DocumentTabs },
      setup: () => ({
        selected: ref("a"),
        close,
        tabs: [
          { id: "a", title: "A", dirty: true },
          { id: "b", title: "B" },
        ],
      }),
      template:
        '<DocumentTabs :tabs="tabs" v-model="selected" @close="close">Document</DocumentTabs>',
    }),
  );
  const a = screen.getByRole("tab", { name: "AUnsaved changes" });
  a.focus();
  await fireEvent.keyDown(a, { key: "ArrowRight" });
  expect(screen.getByRole("tab", { name: "B" })).toHaveFocus();
  await fireEvent.keyDown(screen.getByRole("tab", { name: "B" }), {
    key: "Home",
  });
  expect(a).toHaveAttribute("aria-selected", "true");
  await fireEvent.keyDown(a, { key: "Delete" });
  expect(close).toHaveBeenCalledWith("a");
  expect(screen.getByLabelText("Unsaved changes")).toBeInTheDocument();
  expect(screen.getByRole("tabpanel")).toHaveAccessibleName("AUnsaved changes");
});
it("resizes the sidebar at bounds and retains width when collapsed", async () => {
  const app = render(Workspace);
  const separator = screen.getByRole("separator");
  await fireEvent.keyDown(separator, { key: "End" });
  expect(separator).toHaveAttribute("aria-valuenow", "360");
  await fireEvent.keyDown(separator, { key: "ArrowRight" });
  expect(separator).toHaveAttribute("aria-valuenow", "360");
  await app.rerender({ collapsed: true });
  expect(screen.queryByRole("separator")).toBeNull();
  await app.rerender({ collapsed: false });
  expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "360");
  await fireEvent.doubleClick(screen.getByRole("separator"));
  expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "220");
});
afterEach(() => {
  delete (window as unknown as { __runicBridge?: unknown }).__runicBridge;
});
it("uses the generated Runic Views client and follows capability and pending snapshots", async () => {
  const bridge = installMockBridge(createMockBridge());
  const minimize = vi.fn(),
    close = vi.fn();
  const shell = mockShell(bridge, {
    state: {
      maximized: false,
      supportsMinimize: true,
      supportsMaximize: true,
      canMove: false,
    },
    commands: {
      minimize,
      toggleMaximized: (s) => ({ maximized: !s.maximized }),
      requestClose: close,
    },
  });
  const app = render(NativeApp);
  expect(await screen.findByText("Runic Views connected")).toBeInTheDocument();
  await fireEvent.click(
    screen.getByRole("button", { name: "Maximize window" }),
  );
  expect(
    await screen.findByRole("button", { name: "Restore window" }),
  ).toBeInTheDocument();
  await fireEvent.click(
    screen.getByRole("button", { name: "Minimize window" }),
  );
  await waitFor(() => expect(minimize).toHaveBeenCalledOnce());
  shell.update({ isToggleMaximizedExecuting: true, supportsMinimize: false });
  await nextTick();
  expect(screen.getByRole("button", { name: "Restore window" })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Minimize window" }),
  ).toBeDisabled();
  shell.update({ isToggleMaximizedExecuting: false });
  await nextTick();
  bridge.failNext("shellToggleMaximized", {
    kind: "transport",
    message: "Disconnected",
  });
  await fireEvent.click(screen.getByRole("button", { name: "Restore window" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    /Bridge call could not complete/i,
  );
  await fireEvent.click(screen.getByRole("button", { name: "Close window" }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  app.unmount();
});

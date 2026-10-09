import { render, screen, waitFor, act } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { createMockBridge, installMockBridge } from "@runic-artifex/views/mock";
import { mockShell } from "../../../src/generated/shell.mock";
import NativeApp from "./NativeApp.svelte";
afterEach(() => {
  delete (window as unknown as { __runicBridge?: unknown }).__runicBridge;
});
it("uses Svelte useView with the generated client, snapshots, capabilities, and routed errors", async () => {
  const bridge = installMockBridge(createMockBridge());
  const minimize = vi.fn();
  const close = vi.fn();
  const shell = mockShell(bridge, {
    state: {
      maximized: false,
      supportsMinimize: true,
      supportsMaximize: true,
      canMove: false,
    },
    commands: {
      minimize,
      toggleMaximized: (state) => ({ maximized: !state.maximized }),
      requestClose: close,
    },
  });
  const app = render(NativeApp);
  expect(await screen.findByText("Runic Views connected")).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: "Maximize window" }),
  );
  expect(
    await screen.findByRole("button", { name: "Restore window" }),
  ).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: "Minimize window" }),
  );
  expect(minimize).toHaveBeenCalledOnce();
  await act(() => shell.update({ supportsMinimize: false }));
  expect(
    screen.getByRole("button", { name: "Minimize window" }),
  ).toBeDisabled();
  await act(() => shell.update({ isToggleMaximizedExecuting: true }));
  expect(screen.getByRole("button", { name: "Restore window" })).toBeDisabled();
  await act(() => shell.update({ isToggleMaximizedExecuting: false }));
  bridge.failNext("shellToggleMaximized", {
    kind: "transport",
    message: "Native bridge disconnected",
  });
  await userEvent.click(screen.getByRole("button", { name: "Restore window" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    /Bridge call could not complete/i,
  );
  await userEvent.click(screen.getByRole("button", { name: "Close window" }));
  expect(close).toHaveBeenCalledOnce();
  expect(document.querySelector("[data-runic-drag-region]")).toHaveStyle(
    "--webui-app-region: no-drag",
  );
  app.unmount();
  await waitFor(() =>
    expect(screen.queryByText("Runic Views connected")).not.toBeInTheDocument(),
  );
});

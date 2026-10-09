import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { createMockBridge, installMockBridge } from "@runic-artifex/views/mock";
import { mockShell } from "./generated/shell.mock";
import { NativeApp } from "./NativeApp";

afterEach(() => {
  delete (window as unknown as { __runicBridge?: unknown }).__runicBridge;
});
it("connects the actual generated Views client, follows snapshots, dispatches native intent, and reports bridge errors", async () => {
  const bridge = installMockBridge(createMockBridge());
  const minimize = vi.fn();
  const requestClose = vi.fn();
  const shell = mockShell(bridge, {
    state: {
      maximized: false,
      supportsMinimize: true,
      supportsMaximize: true,
      canMove: true,
    },
    commands: {
      minimize,
      toggleMaximized: (state) => ({ maximized: !state.maximized }),
      requestClose,
    },
  });
  const app = render(<NativeApp />);
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
  act(() => shell.update({ supportsMinimize: false }));
  expect(
    screen.getByRole("button", { name: "Minimize window" }),
  ).toBeDisabled();
  bridge.failNext("shellToggleMaximized", {
    kind: "transport",
    message: "Native bridge disconnected",
  });
  await userEvent.click(screen.getByRole("button", { name: "Restore window" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    /Bridge call could not complete/i,
  );
  await userEvent.click(screen.getByRole("button", { name: "Close window" }));
  expect(requestClose).toHaveBeenCalledOnce();
  app.unmount();
  await waitFor(() =>
    expect(screen.queryByText("Runic Views connected")).not.toBeInTheDocument(),
  );
});

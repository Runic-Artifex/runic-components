import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowHostProvider, type WindowHost } from "./window-host";
import { TitleBar } from "./title-bar";
import { DocumentTabs } from "./document-tabs";
import { Workspace } from "./workspace";
import { createRunicWindowHost } from "./runic-window-host";
const makeHost = (): WindowHost => ({
  state: { maximized: false, focused: true },
  capabilities: { minimize: true, maximize: true, close: true, move: true },
  minimize: vi.fn(),
  toggleMaximize: vi.fn(),
  close: vi.fn(),
  startDragging: vi.fn(),
});
describe("window chrome", () => {
  it("dispatches controls, excludes toolbar actions from drag, and marks the Runic drag region", async () => {
    const host = makeHost();
    render(
      <WindowHostProvider host={host} onError={vi.fn()}>
        <TitleBar title="Test window" actions={<button>Search</button>} />
      </WindowHostProvider>,
    );
    const title = screen.getByText("Test window");
    expect(
      title.parentElement?.style.getPropertyValue("--webui-app-region"),
    ).toBe("drag");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(host.startDragging).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole("button", { name: "Minimize window" }),
    );
    expect(host.minimize).toHaveBeenCalledOnce();
    await userEvent.click(
      screen.getByRole("button", { name: "Maximize window" }),
    );
    expect(host.toggleMaximize).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Close window" }));
    expect(host.close).toHaveBeenCalledOnce();
  });
  it("disables unsupported controls and does not double-click maximize when unavailable", async () => {
    const host = makeHost();
    host.capabilities.maximize = false;
    host.capabilities.move = false;
    render(
      <WindowHostProvider host={host} onError={vi.fn()}>
        <TitleBar title="Test window" />
      </WindowHostProvider>,
    );
    expect(
      screen.getByRole("button", { name: "Maximize window" }),
    ).toBeDisabled();
    expect(
      screen
        .getByText("Test window")
        .parentElement?.style.getPropertyValue("--webui-app-region"),
    ).toBe("no-drag");
    await userEvent.dblClick(screen.getByText("Test window"));
    expect(host.toggleMaximize).not.toHaveBeenCalled();
  });
  it("reports bridge failures", async () => {
    const host = makeHost();
    host.minimize = vi.fn().mockRejectedValue(new Error("Disconnected"));
    const error = vi.fn();
    render(
      <WindowHostProvider host={host} onError={error}>
        <TitleBar title="Test" />
      </WindowHostProvider>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Minimize window" }),
    );
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Disconnected" }),
    );
  });
  it("orders macOS controls and reflects restored state", () => {
    const host = makeHost();
    host.state.maximized = true;
    render(
      <WindowHostProvider host={host} onError={vi.fn()}>
        <TitleBar title="Test" platform="macos" />
      </WindowHostProvider>,
    );
    expect(
      screen.getAllByRole("button").map((el) => el.getAttribute("aria-label")),
    ).toEqual(["Close window", "Minimize window", "Restore window"]);
  });
});
describe("documents and workspace", () => {
  it("supports roving tab focus and separate close actions", async () => {
    const close = vi.fn();
    function Harness() {
      const [value, setValue] = useState("a");
      return (
        <DocumentTabs
          tabs={[
            { id: "a", title: "A", dirty: true },
            { id: "b", title: "B" },
          ]}
          value={value}
          onValueChange={setValue}
          onClose={close}
        >
          Document content
        </DocumentTabs>
      );
    }
    render(<Harness />);
    screen.getByRole("tab", { name: /A/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: /A/ })).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Close A" }));
    expect(close).toHaveBeenCalledWith("a");
  });
  it("bounds keyboard resizing and restores sidebar width after collapse", () => {
    const { rerender } = render(
      <Workspace
        sidebar={<p>Explorer</p>}
        defaultWidth={200}
        minWidth={160}
        maxWidth={240}
      >
        Editor
      </Workspace>,
    );
    let separator = screen.getByRole("separator");
    fireEvent.keyDown(separator, { key: "End" });
    expect(separator).toHaveAttribute("aria-valuenow", "240");
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    expect(separator).toHaveAttribute("aria-valuenow", "240");
    fireEvent.keyDown(separator, { key: "ArrowLeft", shiftKey: true });
    expect(separator).toHaveAttribute("aria-valuenow", "208");
    rerender(
      <Workspace
        collapsed
        sidebar={<p>Explorer</p>}
        defaultWidth={200}
        minWidth={160}
        maxWidth={240}
      >
        Editor
      </Workspace>,
    );
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    rerender(
      <Workspace
        sidebar={<p>Explorer</p>}
        defaultWidth={200}
        minWidth={160}
        maxWidth={240}
      >
        Editor
      </Workspace>,
    );
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-valuenow",
      "208",
    );
  });
});
it("maps Runic generated commands without swallowing failures or inventing native drag IPC", async () => {
  const client = {
    minimize: vi.fn().mockResolvedValue({}),
    toggleMaximized: vi.fn().mockResolvedValue({}),
    requestClose: vi.fn().mockRejectedValue(new Error("close denied")),
  };
  const host = createRunicWindowHost(client, {
    maximized: false,
    focused: true,
    canMinimize: true,
    canToggleMaximized: false,
    canRequestClose: true,
    canMove: true,
  });
  await host.minimize();
  expect(client.minimize).toHaveBeenCalledOnce();
  expect(host.capabilities.maximize).toBe(false);
  expect(host.startDragging).toBeUndefined();
  await expect(host.close()).rejects.toThrow("close denied");
});

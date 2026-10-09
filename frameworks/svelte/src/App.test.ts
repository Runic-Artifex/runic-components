import { render, screen, fireEvent } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "./App.svelte";
it("simulates window controls and follows platform and focus changes", async () => {
  const user = userEvent.setup();
  render(App);
  await user.click(screen.getByRole("button", { name: "Maximize window" }));
  expect(
    screen.getByRole("button", { name: "Restore window" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Minimize window" }));
  expect(
    screen.getByRole("button", { name: "Restore demo window" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Restore demo window" }));
  await user.selectOptions(screen.getByRole("combobox"), "macos");
  expect(
    screen.getByRole("button", { name: "Close window" }).className,
  ).toContain("rounded-full");
  await user.click(screen.getByRole("checkbox", { name: "Focused" }));
  expect(screen.getByRole("banner").className).toContain("opacity-65");
  expect(document.querySelector("[data-runic-drag-region]")).toHaveStyle(
    "--webui-app-region: no-drag",
  );
});
it("uses roving tabs and confirms dirty close before removing the document", async () => {
  const user = userEvent.setup();
  render(App);
  screen.getByRole("tab", { name: "Welcome.md" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: /Ideas.md/ })).toHaveFocus();
  expect(screen.getByRole("tab", { name: /Ideas.md/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await user.keyboard("{Delete}");
  expect(
    screen.getByRole("alertdialog", { name: "Unsaved document" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(screen.getByRole("tab", { name: /Ideas.md/ })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Close Ideas.md" }));
  await user.click(screen.getByRole("button", { name: "Discard changes" }));
  expect(
    screen.queryByRole("tab", { name: /Ideas.md/ }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "New document" }));
  expect(screen.getByRole("tab", { name: "Untitled.md" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
it("keeps keyboard sidebar resizing within bounds and supports collapse", async () => {
  const user = userEvent.setup();
  render(App);
  const separator = screen.getByRole("separator", { name: "Sidebar width" });
  separator.focus();
  await user.keyboard("{End}");
  expect(separator).toHaveAttribute("aria-valuenow", "360");
  await user.keyboard("{ArrowRight}");
  expect(separator).toHaveAttribute("aria-valuenow", "360");
  await user.keyboard("{Home}{Shift>}{ArrowRight}{/Shift}");
  expect(separator).toHaveAttribute("aria-valuenow", "192");
  await user.click(screen.getByRole("button", { name: "Toggle sidebar" }));
  expect(screen.queryByRole("separator")).not.toBeInTheDocument();
});

it("captures pointer resize gestures, clamps movement, and stops after cancellation", async () => {
  render(App);
  const separator = screen.getByRole("separator", { name: "Sidebar width" });
  const capture = vi.fn();
  const release = vi.fn();
  Object.assign(separator, {
    setPointerCapture: capture,
    hasPointerCapture: () => true,
    releasePointerCapture: release,
  });
  function pointer(type: string, x: number) {
    const event = new Event(type, { bubbles: true });
    Object.defineProperties(event, {
      button: { value: 0 },
      pointerId: { value: 7 },
      clientX: { value: x },
    });
    return fireEvent(separator, event);
  }
  await pointer("pointerdown", 100);
  expect(capture).toHaveBeenCalledWith(7);
  await pointer("pointermove", 500);
  expect(separator).toHaveAttribute("aria-valuenow", "360");
  await pointer("pointerup", 500);
  expect(release).toHaveBeenCalledWith(7);
  await pointer("pointermove", 0);
  expect(separator).toHaveAttribute("aria-valuenow", "360");
  await pointer("pointerdown", 100);
  await pointer("pointermove", -100);
  expect(separator).toHaveAttribute("aria-valuenow", "160");
  await pointer("pointercancel", -100);
  await pointer("pointermove", 500);
  expect(separator).toHaveAttribute("aria-valuenow", "160");
});

it("keeps note edits attached to their document and closes an empty window", async () => {
  const user = userEvent.setup();
  render(App);
  const note = screen.getByRole("textbox", { name: "Document note" });
  await user.clear(note);
  await user.type(note, "My welcome note");
  await user.click(screen.getByRole("tab", { name: /Ideas.md/ }));
  expect(
    screen.getByRole("textbox", { name: "Document note" }),
  ).not.toHaveValue("My welcome note");
  await user.click(screen.getByRole("tab", { name: /Welcome.md/ }));
  expect(screen.getByRole("textbox", { name: "Document note" })).toHaveValue(
    "My welcome note",
  );
  await user.click(screen.getByRole("button", { name: "Close Welcome.md" }));
  await user.click(screen.getByRole("button", { name: "Discard changes" }));
  await user.click(screen.getByRole("button", { name: "Close Ideas.md" }));
  await user.click(screen.getByRole("button", { name: "Discard changes" }));
  await user.click(screen.getByRole("button", { name: "Close window" }));
  expect(
    screen.getByRole("button", { name: "Restore demo window" }),
  ).toBeInTheDocument();
});

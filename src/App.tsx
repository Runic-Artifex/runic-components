import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Code2,
  Command,
  Copy,
  FileCode2,
  FileText,
  Folder,
  GitBranch,
  Layers,
  LayoutPanelLeft,
  Maximize2,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  Sparkles,
  Sun,
  Terminal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TitleBar } from "@/components/runic/title-bar";
import {
  WindowHostProvider,
  type WindowHost,
  type WindowPlatform,
} from "@/components/runic/window-host";
import {
  DocumentTabs,
  type DocumentTab,
} from "@/components/runic/document-tabs";
import { Workspace } from "@/components/runic/workspace";
import { StatusBar, StatusBarItem } from "@/components/runic/status-bar";
import { cn } from "@/lib/utils";
const initialTabs: DocumentTab[] = [
  { id: "welcome", title: "Welcome.md", icon: <FileText size={13} /> },
  { id: "shell", title: "AppShell.tsx", icon: <FileCode2 size={13} /> },
  { id: "tokens", title: "theme.css", icon: <Circle size={11} /> },
];
const catalog = [
  {
    name: "Title bar",
    tag: "01",
    description: "A place for your app. A handle for your window.",
    icon: LayoutPanelLeft,
    details:
      "Runic drag regions, isolated interactive actions, focus state, and double-click to maximize.",
  },
  {
    name: "Window controls",
    tag: "02",
    description: "Native intent. Your visual language.",
    icon: Maximize2,
    details:
      "Windows, Linux, and macOS layouts. Capability-aware minimize, maximize, and close actions.",
  },
  {
    name: "Document tabs",
    tag: "03",
    description: "A workspace for more than one thought.",
    icon: Layers,
    details:
      "Closable documents, unsaved indicators, and Arrow / Home / End keyboard navigation.",
  },
  {
    name: "Workspace",
    tag: "04",
    description: "Room to work, with everything in reach.",
    icon: PanelLeftOpen,
    details:
      "A resizable sidebar with pointer capture, keyboard sizing, and controlled visibility.",
  },
  {
    name: "Status bar",
    tag: "05",
    description: "The quiet details that keep you oriented.",
    icon: Terminal,
    details:
      "Composable status items for connectivity, background work, cursor position, and commands.",
  },
];
const shellCode = [
  "<WindowHostProvider host={host} onError={reportError}>",
  '  <TitleBar title="Runic Notes" platform="linux" />',
  "  <Workspace sidebar={<Explorer />}>",
  "    <DocumentTabs tabs={tabs} value={active}",
  "      onValueChange={setActive} onClose={closeTab}>",
  "      <Editor />",
  "    </DocumentTabs>",
  "  </Workspace>",
  "  <StatusBar><ConnectionStatus /></StatusBar>",
  "</WindowHostProvider>",
].join("\n");
const startingNote =
  "A home for your next idea.\n\nEvery good tool begins with a space that feels like yours. A quiet canvas, familiar controls, and just enough structure to stay in flow.\n\nRunic Components brings that feeling to your WebView application. Compose the shell. Connect your host. Make the rest your own.";
function Rune({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 36"
      className={cn("rune", className)}
      fill="none"
    >
      <path d="M16 2 28 9v18l-12 7L4 27V9L16 2Z" stroke="currentColor" />
      <path
        d="M11 27V9l11 7-11 6m0-7 11 12"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="code-block">
      {children.split("\n").map((line, i) => (
        <div key={i}>
          <span className="line-number">{i + 1}</span>
          <code>{line}</code>
        </div>
      ))}
    </pre>
  );
}
export function App() {
  const [platform, setPlatform] = useState<WindowPlatform>("linux");
  const [focused, setFocused] = useState(true);
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const [light, setLight] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [view, setView] = useState("preview");
  const [active, setActive] = useState("welcome");
  const [tabs, setTabs] = useState(initialTabs);
  const [note, setNote] = useState(startingNote);
  const [editing, setEditing] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const log = (event: string) =>
    setEvents((old) => [event, ...old].slice(0, 5));
  const host: WindowHost = {
    state: { maximized, focused },
    capabilities: { minimize: true, maximize: true, close: true, move: true },
    minimize: () => {
      setMinimized(true);
      log("Window minimized");
    },
    toggleMaximize: () => {
      setMaximized((v) => !v);
      log(maximized ? "Window restored" : "Window maximized");
    },
    close: () => setConfirm("window"),
    startDragging: () => log("Drag requested · browser simulation"),
  };
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebar((v) => !v);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const closeTab = (id: string, force = false) => {
    if (!force && tabs.find((t) => t.id === id)?.dirty) {
      setConfirm(id);
      return;
    }
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (active === id) {
      setActive(
        remaining[Math.max(0, tabs.findIndex((t) => t.id === id) - 1)]?.id ??
          "",
      );
    }
    log("Document closed");
  };
  const openTab = (id: string) => {
    if (!tabs.some((t) => t.id === id)) {
      const tab = initialTabs.find((t) => t.id === id);
      if (tab) setTabs((old) => [...old, tab]);
    }
    setActive(id);
  };
  const addTab = () => {
    const id = crypto.randomUUID();
    setTabs((old) => [
      ...old,
      { id, title: "Untitled.md", icon: <FileText size={13} /> },
    ]);
    setActive(id);
    log("Document created");
  };
  const save = () => {
    setEditing(false);
    setTabs((old) =>
      old.map((t) => ({ ...t, dirty: t.id === "welcome" ? false : t.dirty })),
    );
    log("Welcome.md saved");
  };
  const reset = () => {
    setClosed(false);
    setMinimized(false);
    setMaximized(false);
    setTabs(initialTabs);
    setActive("welcome");
    setNote(startingNote);
    setEditing(false);
    log("Workspace reset");
  };
  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(
        "npx shadcn@4.21.4 add http://localhost:5190/r/runic-shell.json",
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      log("Clipboard unavailable · select the command below");
    }
  };
  const actions = [
    { title: "New document", hint: "Open an empty document", run: addTab },
    {
      title: sidebar ? "Hide sidebar" : "Show sidebar",
      hint: "Ctrl / ⌘ B",
      run: () => setSidebar((v) => !v),
    },
    {
      title: light ? "Use dark theme" : "Use light theme",
      hint: "Switch appearance",
      run: () => setLight((v) => !v),
    },
    { title: "Reset workspace", hint: "Restore demo documents", run: reset },
  ];
  const explorer = (
    <div className="explorer">
      <div className="explorer-heading">
        <span>EXPLORER</span>
        <Button
          size="icon"
          variant="ghost"
          aria-label="New document"
          onClick={addTab}
        >
          <FileText />
        </Button>
      </div>
      <div className="project-name">
        <ChevronDown size={13} />
        <Folder size={14} />
        <span>runic-notes</span>
        <span className="muted ml-auto">3</span>
      </div>
      <div className="file-list">
        {initialTabs.map((tab) => (
          <button
            key={tab.id}
            className={cn("file", active === tab.id && "active")}
            onClick={() => openTab(tab.id)}
          >
            {tab.icon}
            {tab.title}
            {tab.id === "welcome" &&
              tabs.find((t) => t.id === tab.id)?.dirty && (
                <span className="dirty-dot" />
              )}
          </button>
        ))}
      </div>
      <div className="explorer-label">WORKSPACE</div>
      <button
        className="file"
        onClick={() => {
          setPalette(true);
          setQuery("");
        }}
      >
        <Search size={14} />
        Find a command<kbd>⌘ K</kbd>
      </button>
      <button
        className="file"
        onClick={() => {
          setSelected(3);
          document
            .getElementById("components")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <Settings2 size={14} />
        Shell components
      </button>
      <div className="sidebar-bottom">
        <span className="connection-dot" />
        <span>Local workspace</span>
        <span className="mono ml-auto">v0.1</span>
      </div>
    </div>
  );
  let content: ReactNode;
  if (!tabs.length)
    content = (
      <div className="empty-state">
        <Layers size={28} />
        <h3>A little room to think.</h3>
        <p>Open a document from the explorer or start something new.</p>
        <Button size="sm" onClick={addTab}>
          New document
        </Button>
      </div>
    );
  else if (active === "shell")
    content = (
      <div className="source-pane">
        <div className="source-label">COMPOSE YOUR APPLICATION SHELL</div>
        <CodeBlock>{shellCode}</CodeBlock>
        <p>Connect the host with your generated Runic Views client.</p>
      </div>
    );
  else if (active === "tokens")
    content = (
      <div className="source-pane">
        <div className="source-label">SHADCN TOKENS · RUNIC CHARACTER</div>
        <CodeBlock>
          {[
            ":root {",
            "  --background: #111713;",
            "  --foreground: #e7e5db;",
            "  --primary: #c4a568;",
            "  --border: #2a332c;",
            "  --radius: 0.5rem;",
            "}",
            "",
            "[data-runic-drag-region] {",
            "  --webui-app-region: drag;",
            "}",
          ].join("\n")}
        </CodeBlock>
      </div>
    );
  else if (active !== "welcome")
    content = (
      <div className="empty-state">
        <FileText size={28} />
        <h3>Your next idea starts here.</h3>
        <p>This empty document demonstrates creating and closing tabs.</p>
        <Button variant="outline" size="sm" onClick={() => openTab("welcome")}>
          Open Welcome.md
        </Button>
      </div>
    );
  else
    content = (
      <article className="note">
        <div className="note-topline">
          <span>
            <FileText size={12} /> GETTING STARTED
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => (editing ? save() : setEditing(true))}
          >
            {editing ? <Check /> : <FileCode2 />}
            {editing ? "Save note" : "Edit note"}
          </Button>
        </div>
        {editing ? (
          <textarea
            aria-label="Edit Welcome.md"
            className="note-editor"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setTabs((old) =>
                old.map((t) => ({
                  ...t,
                  dirty: t.id === "welcome" ? true : t.dirty,
                })),
              );
            }}
          />
        ) : (
          <>
            <h2>{note.split("\n\n")[0]}</h2>
            {note
              .split("\n\n")
              .slice(1)
              .map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
          </>
        )}
        <div className="note-divider" />
        <div className="note-section-title">
          A familiar frame. Entirely yours.
        </div>
        <div className="note-features">
          <div>
            <span>01</span>
            <h4>Compose</h4>
            <p>
              Source you own.
              <br />
              Parts that work together.
            </p>
          </div>
          <div>
            <span>02</span>
            <h4>Connect</h4>
            <p>
              Your Runic host.
              <br />
              Real window actions.
            </p>
          </div>
          <div>
            <span>03</span>
            <h4>Create</h4>
            <p>
              Your application.
              <br />
              Without the chrome.
            </p>
          </div>
        </div>
        <div className="note-tip">
          <Sparkles size={15} />
          <span>
            Try the window controls, resize the sidebar, or press <kbd>⌘ K</kbd>
            .
          </span>
        </div>
      </article>
    );
  return (
    <div className="site">
      <nav className="site-nav">
        <a href="#" className="brand">
          <Rune />
          <span>
            Runic <b>Components</b>
          </span>
        </a>
        <div className="nav-links">
          <a href="#playground">Playground</a>
          <a href="#components">
            Components <span>05</span>
          </a>
          <a href="/INTEGRATION.md" target="_blank" rel="noreferrer">
            Integration <ArrowRight size={12} />
          </a>
          <Button
            size="icon"
            variant="ghost"
            aria-label={light ? "Use dark theme" : "Use light theme"}
            onClick={() => setLight((v) => !v)}
          >
            {light ? <Moon /> : <Sun />}
          </Button>
        </div>
      </nav>
      <main>
        <section className="hero">
          <div className="eyebrow">
            <span /> RUNIC ARTIFEX <span className="eyebrow-rule" /> COMPONENT
            EXPLORATION 001
          </div>
          <div className="hero-row">
            <div>
              <h1>
                The desktop, <em>composed.</em>
              </h1>
              <p>
                Application chrome for the spaces shadcn leaves open.
                <br />
                Crafted for WebViews. Connected to Runic. Yours to shape.
              </p>
            </div>
            <a className="hero-link" href="#components">
              Explore the components <ArrowDownToLine size={16} />
            </a>
          </div>
          <div className="hero-meta">
            <span>
              <Code2 size={13} />
              React + Tailwind
            </span>
            <span>
              <Layers size={13} />
              shadcn registry
            </span>
            <span>
              <Circle size={9} />
              Runic Views
            </span>
            <span className="preview-badge">EXPERIMENTAL · v0.1</span>
          </div>
        </section>
        <section id="playground" className="playground">
          <div className="playground-toolbar">
            <div className="section-label">
              <span className="connection-dot" />
              LIVE WORKSPACE <span className="toolbar-divider" />{" "}
              <span className="muted normal-case tracking-normal">
                Runic Notes
              </span>
            </div>
            <div className="playground-options">
              <div className="segmented" aria-label="Workspace display">
                <button
                  aria-pressed={view === "preview"}
                  className={cn(view === "preview" && "selected")}
                  onClick={() => setView("preview")}
                >
                  Preview
                </button>
                <button
                  aria-pressed={view === "code"}
                  className={cn(view === "code" && "selected")}
                  onClick={() => setView("code")}
                >
                  Code
                </button>
              </div>
              <span className="toolbar-divider" />
              <label className="platform-label">
                <span className="sr-only">Window platform</span>
                <select
                  value={platform}
                  onChange={(e) =>
                    setPlatform(e.target.value as WindowPlatform)
                  }
                >
                  <option value="linux">Linux</option>
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                </select>
              </label>
              <label className="focus-toggle">
                <input
                  type="checkbox"
                  checked={focused}
                  onChange={(e) => setFocused(e.target.checked)}
                />
                Focused
              </label>
            </div>
          </div>
          <div className={cn("demo-stage", maximized && "maximized")}>
            {view === "code" ? (
              <div className="demo-code">
                <div className="code-caption">
                  <FileCode2 size={15} />
                  AppShell.tsx<span>Composition example</span>
                </div>
                <CodeBlock>{shellCode}</CodeBlock>
                <a href="/INTEGRATION.md" target="_blank" rel="noreferrer">
                  Read the Runic integration guide <ArrowRight size={13} />
                </a>
              </div>
            ) : closed || minimized ? (
              <div className="empty-state">
                <Rune />
                <h3>{closed ? "Window closed." : "Window minimized."}</h3>
                <p>The browser demo simulates native actions.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setClosed(false);
                    setMinimized(false);
                    log("Window reopened");
                  }}
                >
                  Restore workspace
                </Button>
              </div>
            ) : (
              <WindowHostProvider
                host={host}
                onError={(error) => log(String(error))}
              >
                <div className={cn("app-window", !focused && "unfocused")}>
                  <TitleBar
                    title={
                      <>
                        <span className="window-title">Runic Notes</span>
                        <span className="title-separator">/</span>Personal
                        workspace
                      </>
                    }
                    platform={platform}
                    icon={<Rune />}
                    actions={
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={sidebar ? "Hide sidebar" : "Show sidebar"}
                          onClick={() => setSidebar((v) => !v)}
                        >
                          {sidebar ? <PanelLeftClose /> : <PanelLeftOpen />}
                        </Button>
                        <button
                          className="command-trigger"
                          onClick={() => {
                            setPalette(true);
                            setQuery("");
                          }}
                        >
                          <Search size={12} />
                          <span>Search anything</span>
                          <kbd>⌘ K</kbd>
                        </button>
                      </>
                    }
                  />
                  <Workspace
                    sidebar={explorer}
                    collapsed={!sidebar}
                    defaultWidth={208}
                  >
                    <DocumentTabs
                      tabs={tabs}
                      value={active}
                      onValueChange={setActive}
                      onClose={closeTab}
                      onAdd={addTab}
                    >
                      {content}
                    </DocumentTabs>
                  </Workspace>
                  <StatusBar>
                    <div className="flex items-center gap-4">
                      <StatusBarItem>
                        <GitBranch size={12} />
                        main
                      </StatusBarItem>
                      <StatusBarItem>
                        <span className="connection-dot" />
                        Browser simulation
                      </StatusBarItem>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBarItem>Markdown</StatusBarItem>
                      <StatusBarItem>UTF-8</StatusBarItem>
                      <button
                        onClick={() => setPalette(true)}
                        aria-label="Open command palette"
                      >
                        <Command size={12} />
                      </button>
                    </div>
                  </StatusBar>
                </div>
              </WindowHostProvider>
            )}
          </div>
          <div className="playground-footnote">
            <span>
              <Circle size={9} />{" "}
              {events[0] ??
                "Browser simulation · Native actions connect through a Runic Views adapter."}
            </span>
            <button onClick={reset}>
              Reset workspace <ArrowRight size={12} />
            </button>
          </div>
        </section>
        <section id="components" className="components-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE BUILDING BLOCKS</div>
              <h2>Beyond the page.</h2>
            </div>
            <p>
              Small, considered primitives for applications
              <br />
              that have a window to call their own.
            </p>
          </div>
          <div className="component-grid">
            {catalog.map((component, i) => (
              <button
                key={component.name}
                className={cn("component-card", selected === i && "selected")}
                onClick={() => setSelected(i)}
                aria-pressed={selected === i}
              >
                <div className="card-top">
                  <component.icon size={21} strokeWidth={1.4} />
                  <span>{component.tag}</span>
                </div>
                <h3>{component.name}</h3>
                <p>{component.description}</p>
                <div className="card-bottom">
                  <span>
                    {selected === i ? "Selected" : "Inspect component"}
                  </span>
                  <ArrowRight size={13} />
                </div>
              </button>
            ))}
          </div>
          <div className="component-detail">
            <span className="mono">{catalog[selected].tag}</span>
            <strong>{catalog[selected].name}</strong>
            <p>{catalog[selected].details}</p>
            <a
              href={
                "/r/" +
                [
                  "title-bar",
                  "window-controls",
                  "document-tabs",
                  "workspace",
                  "status-bar",
                ][selected] +
                ".json"
              }
              target="_blank"
              rel="noreferrer"
            >
              Registry source <Code2 size={13} />
            </a>
          </div>
        </section>
        <section className="install-section">
          <div>
            <div className="eyebrow">SOURCE YOU OWN</div>
            <h2>Bring your own application.</h2>
            <p>
              Add the shell to a shadcn project. Wire it to your Runic Views
              client.
            </p>
          </div>
          <div className="install-command">
            <span className="mono">$</span>
            <code>
              npx shadcn@4.21.4 add
              <br />
              <span>http://localhost:5190/r/runic-shell.json</span>
            </code>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Copy install command"
              onClick={() => void copyInstall()}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>
          <Rune /> RUNIC ARTIFEX
        </span>
        <p>A frame for what comes next.</p>
        <span className="mono">LOCAL EXPLORATION / 2026</span>
      </footer>
      <Dialog.Root open={palette} onOpenChange={setPalette}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="command-dialog">
            <Dialog.Title className="sr-only">Workspace commands</Dialog.Title>
            <Dialog.Description className="sr-only">
              Search and run a demo command.
            </Dialog.Description>
            <div className="command-search">
              <Search size={18} />
              <input
                autoFocus
                placeholder="Find a command…"
                aria-label="Search commands"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Dialog.Close aria-label="Close commands">
                <X size={16} />
              </Dialog.Close>
            </div>
            <div className="command-results">
              {actions
                .filter((a) =>
                  a.title.toLowerCase().includes(query.toLowerCase()),
                )
                .map((a) => (
                  <button
                    key={a.title}
                    onClick={() => {
                      a.run();
                      setPalette(false);
                    }}
                  >
                    <span>{a.title}</span>
                    <small>{a.hint}</small>
                    <ChevronRight size={14} />
                  </button>
                ))}
              {!actions.some((a) =>
                a.title.toLowerCase().includes(query.toLowerCase()),
              ) && <p>No matching commands.</p>}
            </div>
            <div className="command-footer">
              Tab to navigate <span>Enter to run · Esc to close</span>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="confirm-dialog">
            <Dialog.Title>
              {confirm === "window"
                ? "Close this workspace?"
                : "Discard unsaved changes?"}
            </Dialog.Title>
            <Dialog.Description>
              {confirm === "window"
                ? "This simulates a native close request. Any unsaved demo changes will be discarded. You can reopen the workspace afterward."
                : "This document has unsaved changes. Closing it will discard those changes."}
            </Dialog.Description>
            <div className="flex justify-end gap-2 mt-6">
              <Dialog.Close asChild>
                <Button variant="outline">Keep working</Button>
              </Dialog.Close>
              <Button
                onClick={() => {
                  if (confirm === "window") {
                    reset();
                    setClosed(true);
                    log("Window closed");
                  } else if (confirm) {
                    closeTab(confirm, true);
                    setNote(startingNote);
                    setEditing(false);
                  }
                  setConfirm(null);
                }}
              >
                {confirm === "window" ? "Close workspace" : "Discard changes"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

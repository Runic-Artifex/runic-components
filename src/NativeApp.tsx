import { useEffect, useState } from "react";
import { useView } from "@runic-artifex/react";
import { connectShell } from "./generated/shell";
import { createRunicWindowHost } from "./components/runic/runic-window-host";
import {
  WindowHostProvider,
  type WindowPlatform,
} from "./components/runic/window-host";
import { TitleBar } from "./components/runic/title-bar";
import { Workspace } from "./components/runic/workspace";
import { DocumentTabs } from "./components/runic/document-tabs";
import { StatusBar, StatusBarItem } from "./components/runic/status-bar";
import { Button } from "./components/ui/button";
import { FileText, GitBranch, PanelLeft, Search } from "lucide-react";

export function NativeApp() {
  const { state, client, error, retry } = useView({ connect: connectShell });
  const [focused, setFocused] = useState(document.hasFocus());
  const [sidebar, setSidebar] = useState(true);
  const [commandError, setCommandError] = useState<string>();
  useEffect(() => {
    const focus = () => setFocused(true);
    const blur = () => setFocused(false);
    window.addEventListener("focus", focus);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("focus", focus);
      window.removeEventListener("blur", blur);
    };
  }, []);
  if (error)
    return (
      <div className="empty-state">
        <h3>Could not connect to Runic.</h3>
        <p role="alert">{String(error)}</p>
        <Button onClick={retry}>Retry connection</Button>
      </div>
    );
  if (!state || !client)
    return (
      <div className="empty-state">
        <h3>Connecting to Runic Desktop…</h3>
        <p>
          Launch the native sample to connect this page to its generated Views
          bridge.
        </p>
      </div>
    );
  const host = createRunicWindowHost(client, {
    ...state,
    focused,
    canMinimize:
      state.supportsMinimize && state.canMinimize && !state.isMinimizeExecuting,
    canToggleMaximized:
      state.supportsMaximize &&
      state.canToggleMaximized &&
      !state.isToggleMaximizedExecuting,
    canRequestClose: state.canRequestClose && !state.isRequestCloseExecuting,
  });
  const platform: WindowPlatform = navigator.userAgent.includes("Mac")
    ? "macos"
    : navigator.userAgent.includes("Windows")
      ? "windows"
      : "linux";
  return (
    <WindowHostProvider
      host={host}
      onError={(error) => setCommandError(String(error))}
    >
      <div className="native-window">
        <TitleBar
          title="Runic Components · Native workbench"
          platform={platform}
          icon={<FileText size={15} />}
          actions={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle sidebar"
              onClick={() => setSidebar((v) => !v)}
            >
              <PanelLeft />
            </Button>
          }
        />
        <Workspace
          collapsed={!sidebar}
          sidebar={
            <div className="explorer">
              <div className="explorer-label">RUNIC DESKTOP</div>
              <div className="file active">
                <FileText size={14} />
                Welcome.md
              </div>
              <div className="file">
                <Search size={14} />
                Generated Views bridge
              </div>
            </div>
          }
        >
          <DocumentTabs
            tabs={[
              {
                id: "welcome",
                title: "Welcome.md",
                icon: <FileText size={13} />,
              },
            ]}
            value="welcome"
            onValueChange={() => {}}
          >
            <article className="note">
              <div className="eyebrow">REAL HOST · REAL COMMANDS</div>
              <h2>The desktop, composed.</h2>
              <p>
                This frameless window is hosted by Runic Desktop. The title bar
                uses Runic's authenticated drag-region protocol. The controls
                call the .NET ViewModel through the generated Runic Views
                client.
              </p>
              <p>
                {state.canMove
                  ? "Try dragging the title bar, minimizing the window, or maximizing and restoring it."
                  : "Try minimizing, maximizing, and restoring the window. Native dragging is disabled because this Runic provider does not implement it yet (RC-005)."}{" "}
                The close button requests close through the host's confirmation
                policy.
              </p>
              <div className="note-divider" />
              <div className="note-section-title">
                The same source. A native frame.
              </div>
              <p>
                React hooks own connection and disposal. The host publishes
                capabilities. Components use your existing shadcn theme.
              </p>
              {commandError && <p role="alert">{commandError}</p>}
            </article>
          </DocumentTabs>
        </Workspace>
        <StatusBar>
          <StatusBarItem>
            <span className="connection-dot" />
            Runic Views connected
          </StatusBarItem>
          <StatusBarItem>
            <GitBranch size={12} />
            Native WebView · {platform}
          </StatusBarItem>
        </StatusBar>
      </div>
    </WindowHostProvider>
  );
}

import type { WindowHost, WindowState } from "./window-host";
/** Structural subset of your application-generated Runic Views client. */
export interface RunicWindowCommands {
  minimize(): Promise<unknown>;
  toggleMaximized(): Promise<unknown>;
  requestClose(): Promise<unknown>;
}
export interface RunicWindowSnapshot extends WindowState {
  canMinimize: boolean;
  canToggleMaximized: boolean;
  canRequestClose: boolean;
  canMove: boolean;
}
/** Derive a new host from useView's current snapshot. useView owns its client. */
export function createRunicWindowHost(
  client: RunicWindowCommands,
  state: RunicWindowSnapshot,
): WindowHost {
  return {
    state,
    capabilities: {
      minimize: state.canMinimize,
      maximize: state.canToggleMaximized,
      close: state.canRequestClose,
      move: state.canMove,
    },
    minimize: async () => {
      await client.minimize();
    },
    toggleMaximize: async () => {
      await client.toggleMaximized();
    },
    close: async () => {
      await client.requestClose();
    },
    // Runic Desktop's authenticated bootstrap owns --webui-app-region dragging.
  };
}

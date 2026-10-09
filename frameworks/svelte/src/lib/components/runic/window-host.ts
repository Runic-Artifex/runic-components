import { createContext } from "svelte";
export type WindowPlatform = "windows" | "macos" | "linux";
export interface WindowState {
  maximized: boolean;
  focused: boolean;
}
export interface WindowHost {
  state: WindowState;
  capabilities: {
    minimize: boolean;
    maximize: boolean;
    close: boolean;
    move: boolean;
  };
  minimize(): void | Promise<void>;
  toggleMaximize(): void | Promise<void>;
  close(): void | Promise<void>;
  startDragging?(): void | Promise<void>;
}
export interface WindowContext {
  readonly host: WindowHost;
  readonly onError: (error: unknown) => void;
}
const [getContext, setContext] = createContext<WindowContext>();
export const setWindowHostContext = setContext;
export function useWindowHost() {
  try {
    return getContext();
  } catch {
    throw new Error("Wrap window components in WindowHostProvider.");
  }
}
export function useWindowAction() {
  const context = useWindowHost();
  return (action: () => void | Promise<void>) => {
    try {
      Promise.resolve(action()).catch((error) => context.onError(error));
    } catch (error) {
      context.onError(error);
    }
  };
}

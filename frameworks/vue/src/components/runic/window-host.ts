import { inject, type InjectionKey } from "vue";
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
  run(action: () => void | Promise<void>): void;
}
export const windowContextKey: InjectionKey<WindowContext> =
  Symbol("RunicWindowHost");
export function useWindowContext() {
  const value = inject(windowContextKey);
  if (!value) throw new Error("Wrap window components in WindowHostProvider.");
  return value;
}

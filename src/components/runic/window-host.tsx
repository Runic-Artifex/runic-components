"use client";
import { createContext, useContext, type ReactNode } from "react";
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
const Context = createContext<{
  host: WindowHost;
  onError: (error: unknown) => void;
} | null>(null);
export function WindowHostProvider({
  host,
  onError,
  children,
}: {
  host: WindowHost;
  onError: (error: unknown) => void;
  children: ReactNode;
}) {
  return (
    <Context.Provider value={{ host, onError }}>{children}</Context.Provider>
  );
}
export function useWindowHost() {
  const value = useContext(Context);
  if (!value) throw new Error("Wrap window components in WindowHostProvider.");
  return value.host;
}
export function useWindowAction() {
  const value = useContext(Context);
  if (!value) throw new Error("Wrap window components in WindowHostProvider.");
  return (action: () => void | Promise<void>) => {
    try {
      Promise.resolve(action()).catch(value.onError);
    } catch (error) {
      value.onError(error);
    }
  };
}

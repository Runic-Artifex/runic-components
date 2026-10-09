import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { runic } from "@runic-artifex/vite-plugin-runic";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), runic({ devtools: false })],
  build: {
    rollupOptions: {
      input: {
        demo: fileURLToPath(new URL("./index.html", import.meta.url)),
        native: fileURLToPath(new URL("./native.html", import.meta.url)),
      },
    },
  },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: false,
  },
});

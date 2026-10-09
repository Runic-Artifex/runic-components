import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import tailwind from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  base: "./",
  plugins: [vue(), tailwind()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    outDir: "../../dist/vue",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        demo: fileURLToPath(new URL("./index.html", import.meta.url)),
        native: fileURLToPath(new URL("./native.html", import.meta.url)),
      },
    },
  },
  test: { environment: "jsdom", setupFiles: ["./src/test-setup.ts"] },
});

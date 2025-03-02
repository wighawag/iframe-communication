import { resolve } from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        iframe: resolve(__dirname, "iframe/index.html"),
        popup: resolve(__dirname, "popup/index.html"),
      },
    },
  },
});

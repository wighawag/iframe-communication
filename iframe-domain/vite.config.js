import { resolve, join } from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { buildSync } from "esbuild";

export default defineConfig({
  plugins: [
    svelte(),
    {
      apply: "build",
      enforce: "post",
      transformIndexHtml() {
        buildSync({
          minify: false,
          sourcemap: true,
          bundle: true,
          entryPoints: [join(process.cwd(), "service-worker.ts")],
          outfile: join(process.cwd(), "dist", "service-worker.js"),
        });
      },
    },
  ],
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

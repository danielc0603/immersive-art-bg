import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/plugin.js",
      formats: ["es"],
      fileName: () => "plugin.js"
    },
    rollupOptions: {
      output: {
        // This matters: keep exports as ESM
        exports: "named",
      }
    },
    minify: true,
    sourcemap: false
  }
});

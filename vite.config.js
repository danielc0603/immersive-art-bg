import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/plugin.js",
      formats: ["es"],
      fileName: () => "plugin.js"
    },
    outDir: "dist",
    emptyOutDir: true
  }
});

import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  publicDir: false,
  resolve: {
    alias: {
      "@maky/text-barrier-core": path.resolve(__dirname, "./packages/core/src/index.ts"),
    },
  },
  build: {
    outDir: "dist-lib",
    emptyOutDir: true,
    target: "node18",
    sourcemap: true,
    minify: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
  },
});

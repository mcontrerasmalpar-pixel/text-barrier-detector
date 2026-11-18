import { defineConfig } from "vite";

// Library build for the npm package (core analyzer only: no React, no DOM).
// Output: dist-lib/index.js (ESM), dist-lib/index.cjs (CJS). Types come from
// `tsc -p tsconfig.lib.json` (see the "build:lib" script).
export default defineConfig({
  publicDir: false,
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

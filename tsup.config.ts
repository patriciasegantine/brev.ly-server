import {defineConfig} from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  dts: false,
  outDir: "dist",
  clean: true,
  bundle: true,
  loader: {
    ".sql": "copy",
  },
});

import {defineConfig} from "vite";
import dts from "vite-plugin-dts";
import {resolve} from "path";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SupabaseServiceManager",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        switch (format) {
          case "es":
            return "index.js";
          case "cjs":
            return "index.cjs";
          case "umd":
            return "index.umd.js";
          default:
            return `index.${format}.js`;
        }
      },
    },
    rollupOptions: {
      external: ["@supabase/supabase-js"],
      output: {
        exports: "named",
        globals: {
          "@supabase/supabase-js": "Supabase",
        },
      },
    },
    sourcemap: true,
    minify: "terser",
  },
});

import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [vue(), dts({ outDir: "dist", rollupTypes: true })],
  build: {
    lib: {
      entry: fileURLToPath(new URL("src/export.ts", import.meta.url)),
      name: "ArticleMap",
      fileName: (format) => `article-map.${format}.js`,
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: { vue: "Vue" },
      },
    },
  },
});

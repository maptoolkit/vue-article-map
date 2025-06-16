import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ command }) => {
  return {
    base: "./",
    root: "demo",
    plugins: [vue()],
    build:
      command === "build"
        ? {
            outDir: "../dist",
            emptyOutDir: true,
            rollupOptions: {
              input: "demo/index.html",
            },
          }
        : undefined,
  };
});

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ command }) => {
  return {
    base: "./",
    root: "demo",
    plugins: [vue()],
    optimizeDeps: {
      include: ["@maptoolkit/maps-sdk"],
      esbuildOptions: {
        target: "esnext",
      },
    },
    build:
      command === "build"
        ? {
            target: "esnext",
            outDir: "../dist",
            emptyOutDir: true,
            rollupOptions: {
              input: "demo/index.html",
            },
          }
        : undefined,
  };
});
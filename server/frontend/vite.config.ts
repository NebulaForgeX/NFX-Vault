import path from "path";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "./dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "lucide-react/icons": path.resolve(__dirname, "./node_modules/lucide-react/dist/esm/icons"),
    },
  },
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:10200",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 300,
  },
  preview: {
    port: 5173,
    host: "0.0.0.0",
  },
});

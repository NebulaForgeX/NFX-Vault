import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // mode 参数由 Vite 自动传递，根据运行命令自动设置：
  // - npm run dev → mode = "development"
  // - npm run build → mode = "production"
  // - npm run preview → mode = "production"
  // - vite --mode staging → mode = "staging" (手动指定)
  
  // 本地开发：仓库根 .env + console/.env.dev。Go Traefik 入口是 TRAEFIK_HTTP_PORT（10140）。
  const envDir =
    process.env.DOCKER_BUILD === "1"
      ? path.resolve(__dirname)
      : path.resolve(__dirname, "../../");
  const env = { ...loadEnv(mode, envDir, ""), ...loadEnv(mode, __dirname, "") };
  const apiURL = env.VITE_API_URL || `http://127.0.0.1:${env.TRAEFIK_HTTP_PORT || "10140"}`;
  const vitePort = Number(env.VITE_PORT) || 5175;

  // 调试信息（仅在开发环境输出）
  if (mode === "development") {
    console.log("🔧 Vite Config - API URL:", apiURL, "port:", vitePort);
  }

  return {
  root: path.resolve(__dirname),
  plugins: [
    react(),
    ...(process.env.DOCKER_BUILD === "1"
      ? []
      : [
          visualizer({
            filename: path.resolve(__dirname, "dist/stats.html"),
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ]),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "lucide-react/icons": path.resolve(__dirname, "./node_modules/lucide-react/dist/esm/icons"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@tanstack/react-query",
      "@tanstack/react-query-devtools",
    ],
  },
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
  server: {
    port: vitePort,
    host: "0.0.0.0",
    open: true,
    proxy: {
      "/vault": {
        target: apiURL,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 400,
  },
  preview: {
    port: vitePort,
    host: "0.0.0.0",
  },
  envDir: envDir, // 告诉 Vite 从父目录加载 .env 文件
  };
});

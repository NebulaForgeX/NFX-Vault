import path from "path";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // mode 参数由 Vite 自动传递，根据运行命令自动设置：
  // - npm run dev → mode = "development"
  // - npm run build → mode = "production"
  // - npm run preview → mode = "production"
  // - vite --mode staging → mode = "staging" (手动指定)
  
  // 加载项目根目录的 .env 文件
  // loadEnv 会根据 mode 加载对应的 .env 文件：
  // - development: .env.development > .env.local > .env
  // - production: .env.production > .env.local > .env
  // 构建时如果文件不存在，loadEnv 会返回空对象，不会报错
  const envDir = path.resolve(__dirname, "../../");
  const env = loadEnv(mode, envDir, "");

  // 从环境变量读取后端配置，提供默认值
  // 优先级：loadEnv 读取的 .env 文件 > process.env（Docker build args）> 默认值
  const BACKEND_HOST = env.BACKEND_HOST || process.env.BACKEND_HOST || "localhost";
  const BACKEND_PORT = env.BACKEND_PORT || process.env.BACKEND_PORT || "10151";
  const BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

  // 调试信息（仅在开发环境输出）
  if (mode === "development") {
    console.log("🔧 Vite Config - Backend URL:", BACKEND_URL);
    console.log("🔧 Source:", env.BACKEND_HOST ? ".env file" : process.env.BACKEND_HOST ? "process.env" : "default");
  }

  return {
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
      "/vault": {
        target: BACKEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vault/, "/vault"),
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
  envDir: envDir, // 告诉 Vite 从父目录加载 .env 文件
  };
});

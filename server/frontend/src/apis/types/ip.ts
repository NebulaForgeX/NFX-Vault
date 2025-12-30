// API 基础 URL 配置

// 开发环境和生产环境的 API 地址
const HTTP_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "";
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "";

export const API_ENDPOINTS = {
  PURE: HTTP_BASE_URL,
  WS: WS_BASE_URL,
  IMAGE: IMAGE_BASE_URL,
} as const;

export type API_ENDPOINTS_TYPE = typeof API_ENDPOINTS;

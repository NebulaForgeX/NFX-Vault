// api/clients.ts
import type { AxiosRequestTransformer, InternalAxiosRequestConfig } from "axios";

import axios, { AxiosError } from "axios";
import applyCaseMiddleware from "axios-case-converter";

import type { ApiErrorBody } from "@/types/apiError";
import { API_ENDPOINTS } from "@/apis/ip";

// 让 config._retry 有类型
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// 1) 先创建实例并套 case 中间件
export const protectedClient = applyCaseMiddleware(
  axios.create({
    baseURL: API_ENDPOINTS.PURE,
    timeout: 8000,
  }),
);

export const publicClient = applyCaseMiddleware(
  axios.create({
    baseURL: API_ENDPOINTS.PURE,
    timeout: 8000,
  }),
);

// 2) 请求拦截器（不需要认证，所以 protectedClient 和 publicClient 使用相同的配置）
protectedClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 这里不需要添加 token，因为不需要认证
    return config;
  },
  (error) => Promise.reject(error),
);

publicClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => Promise.reject(error),
);

// 3) 在 transformRequest 队列"末尾"追加一个调试 transformer
function asArray<T>(v: T | T[] | undefined): T[] {
  return v ? (Array.isArray(v) ? v : [v]) : [];
}

protectedClient.defaults.transformRequest = [
  ...asArray<AxiosRequestTransformer>(protectedClient.defaults.transformRequest),
  (data: unknown, _headers) => {
    let out: unknown = data;
    try {
      if (typeof out === "string") out = JSON.parse(out) as unknown;
    } catch {
      // 忽略解析错误，继续处理
    }
    return data; // 不要改动 data
  },
];

publicClient.defaults.transformRequest = [
  ...asArray<AxiosRequestTransformer>(publicClient.defaults.transformRequest),
  (data: unknown, _headers) => {
    let out: unknown = data;
    try {
      if (typeof out === "string") out = JSON.parse(out) as unknown;
    } catch {
      // 忽略解析错误，继续处理
    }
    return data;
  },
];

/** 响应错误时打日志（Rex 字段：message, errCode, status）。UI 展示统一用 getApiErrorMessage，不改写 error.message。 */
function logRexApiError(error: AxiosError<ApiErrorBody>): void {
  const errorData = error.response?.data;
  const msg = errorData?.message;
  if (msg) {
    console.error("❌ API Error:", {
      message: msg,
      errCode: errorData?.errCode,
      status: error.response?.status ?? errorData?.status,
      url: error.config?.url,
      method: error.config?.method,
    });
  } else if (import.meta.env.DEV && error.response?.status) {
    console.error("❌ HTTP Error:", {
      status: error.response.status,
      url: error.config?.url,
      method: error.config?.method,
    });
  }
}

protectedClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError) logRexApiError(error);
    return Promise.reject(error);
  },
);

publicClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError) logRexApiError(error);
    return Promise.reject(error);
  },
);

/*
 * API path tree: base paths + dynamic segments via path()（与 nfx-ui/apis、Pqttec-Admin 一致）
 */
import { path } from "nfx-ui/apis";

const HTTP_BASE_URL = import.meta.env.VITE_API_URL ?? "/vault";
const WS_BASE_URL = import.meta.env.VITE_WS_URL ?? "";
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL ?? "";

export const URL_PATHS = {
  TLS: path("/tls", {
    check: "/check",
    detailById: (certificateId: string) => `/detail-by-id/${certificateId}`,
    apply: "/apply",
    create: "/create",
    updateManualAdd: "/update/manual-add",
    delete: "/delete",
    invalidateCache: "/invalidate-cache",
    search: "/search",
    parsePreview: "/parse-preview",
  }),

  FILE: path("/file", {
    list: "/list",
    export: "/export",
    exportSingle: "/export-single",
    download: "/download",
    content: "/content",
    delete: "/delete",
  }),

  ANALYSIS: path("/analysis", {
    tls: "/tls",
  }),
} as const;

export const API_ENDPOINTS = {
  PURE: HTTP_BASE_URL,
  WS: WS_BASE_URL,
  IMAGE: IMAGE_BASE_URL,
} as const;

export type URL_PATHS_TYPE = typeof URL_PATHS;
export type API_ENDPOINTS_TYPE = typeof API_ENDPOINTS;

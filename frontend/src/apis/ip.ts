/*
 * API path tree: base paths + dynamic segments via path().
 * path("/a", { b: "/b", c: path("/c", { d: "/d" }) }) => b="/a/b", c="/a/c", c.d="/a/c/d"
 */

const [BASE, CHILDREN] = [Symbol(), Symbol()];

// Recursive type: each key maps to string (leaf), function (dynamic path), or nested PathNode
type PathNode<T> = string & {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? R extends object
      ? (...args: A) => PathNode<R> // function returning path
      : (...args: A) => string // function returning string
    : T[K] extends object
      ? PathNode<T[K]>
      : string;
};

const path = <T extends Record<string, unknown>>(base: string, children: T): PathNode<T> =>
  Object.assign(
    Object.defineProperties(new String(base), {
      [BASE]: { value: base },
      [CHILDREN]: { value: children },
      toString: { value: () => base },
      valueOf: { value: () => base },
      [Symbol.toPrimitive]: { value: () => base },
    }),
    Object.fromEntries(
      Object.entries(children).map(([k, v]) => [
        k,
        typeof v === "function"
          ? (...args: unknown[]) => {
              const result = (v as (...args: unknown[]) => unknown)(...args);
              return BASE in Object(result)
                ? path(
                    `${base}${(result as Record<symbol, string>)[BASE]}`,
                    (result as Record<symbol, Record<string, unknown>>)[CHILDREN] ?? {},
                  )
                : `${base}${result}`;
            }
          : BASE in Object(v)
            ? path(
                `${base}${(v as Record<symbol, string>)[BASE]}`,
                (v as Record<symbol, Record<string, unknown>>)[CHILDREN] ?? {},
              )
            : `${base}${v}`,
      ]),
    ),
  ) as PathNode<T>;

// 从环境变量获取配置
const HTTP_BASE_URL = import.meta.env.VITE_API_URL ?? "/vault";
const WS_BASE_URL = import.meta.env.VITE_WS_URL ?? "";
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL ?? "";

export const URL_PATHS = {
  TLS: path("/tls", {
    check: (certType: string) => `/check/${certType}`,
    detailById: (certificateId: string) => `/detail-by-id/${certificateId}`,
    refresh: (certType: string) => `/refresh/${certType}`,
    create: "/create",
    updateManualAdd: "/update/manual-add",
    updateManualApply: "/update/manual-apply",
    delete: "/delete",
    apply: "/apply",
    invalidateCache: (certType: string) => `/invalidate-cache/${certType}`,
    reapplyAuto: "/reapply/auto",
    reapplyManualApply: "/reapply/manual-apply",
    reapplyManualAdd: "/reapply/manual-add",
    search: "/search",
  }),

  FILE: path("/file", {
    list: (store: string) => `/list/${store}`,
    export: (store: string) => `/export/${store}`,
    exportSingle: "/export-single",
    download: (store: string) => `/download/${store}`,
    content: (store: string) => `/content/${store}`,
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

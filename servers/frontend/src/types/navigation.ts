// 路由常量定义 - 只定义实际使用的路由
export const ROUTES = {
  HOME: "/",
  CHECK: "/check",
  CERT_ADD: "/cert/add",
  CERT_APPLY: "/cert/apply",
  CERT_EDIT: "/cert/edit/:certificateId",
  CERT_EDIT_APPLY: "/cert/edit-apply/:certificateId",
  CERT_DETAIL: "/cert/:certificateId",
  CERT_SEARCH: "/cert/search",
  ANALYSIS_TLS: "/analysis/tls",
  FILE_FOLDER_APIS: "/filefolder/apis",
  FILE_FOLDER_WEBSITES: "/filefolder/websites",
  CERT_DETAIL_PATH: (certificateId: string) => `/cert/${encodeURIComponent(certificateId)}`,
  CERT_EDIT_PATH: (certificateId: string) => `/cert/edit/${encodeURIComponent(certificateId)}`,
  CERT_EDIT_APPLY_PATH: (certificateId: string) => `/cert/edit-apply/${encodeURIComponent(certificateId)}`,
} as const;

export type RouteKey = keyof typeof ROUTES;

/** 仅字符串路径的 key（排除返回函数的 helper） */
export type PathRouteKey = Exclude<
  RouteKey,
  "CERT_DETAIL_PATH" | "CERT_EDIT_PATH" | "CERT_EDIT_APPLY_PATH"
>;
export type RoutePath = (typeof ROUTES)[PathRouteKey];

export const isActiveRoute = (currentPath: string, targetPath: RoutePath | string): boolean => {
  if (targetPath === "/") return currentPath === "/";
  return currentPath.startsWith(targetPath);
};

export const getRouteByKey = (key: PathRouteKey): RoutePath => ROUTES[key];

import type { RouteKey as RouteKeyGeneric, RoutePath as RoutePathGeneric } from "nfx-ui/navigations";

import { createRouter, defineRouter } from "nfx-ui/navigations";

/**
 * 路由常量与工具（基于 nfx-ui defineRouter / createRouter）
 * 只定义实际使用的路由
 */

const routeMap = defineRouter({
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
});

const { ROUTES, matchRoute, isActiveRoute, getRouteByKey } = createRouter(routeMap);
type RouteKey = RouteKeyGeneric<typeof routeMap>;
type RoutePath = RoutePathGeneric<typeof routeMap>;

export { ROUTES, matchRoute, isActiveRoute, getRouteByKey, type RouteKey, type RoutePath };

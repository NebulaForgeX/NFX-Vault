import type { RouteKey as RouteKeyGeneric, RoutePath as RoutePathGeneric } from "nfx-ui/navigations";

import { createRouter, defineRouter } from "nfx-ui/navigations";

const routeMap = defineRouter({
  HOME: "/",
  CHECK: "/check",
  CERT_ADD: "/cert/add",
  CERT_EDIT: "/cert/edit/:certificateId",
  CERT_DETAIL: "/cert/:certificateId",
  ANALYSIS_TLS: "/analysis/tls",
  FILE_FOLDER: "/filefolder",
});

const { ROUTES, matchRoute, isActiveRoute, getRouteByKey } = createRouter(routeMap);
type RouteKey = RouteKeyGeneric<typeof routeMap>;
type RoutePath = RoutePathGeneric<typeof routeMap>;

export { ROUTES, matchRoute, isActiveRoute, getRouteByKey, type RouteKey, type RoutePath };

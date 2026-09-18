import { createRouter, defineRouter } from "@/utils";

const routeMap = defineRouter({
  HOME: "/",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  LOGIN_GITHUB_CALLBACK: "/auth/login/github/callback",

  USER: "/user",
  USER_OVERVIEW: "/user/overview",
  PROFILE: "/user/profile",
  USER_PROFILE_OVERVIEW: "/user/profile/overview",
  USER_PROFILE_EDIT: "/user/profile/edit",
  USER_PROFILE_IDENTITIES: "/user/profile/identities",
  USER_SETTINGS: "/user/settings",

  CHECK: "/check",
  CERT_ADD: "/cert/add",
  CERT_EDIT: "/cert/edit/:certificateId",
  CERT_DETAIL: "/cert/:certificateId",
  ANALYSIS_TLS: "/analysis/tls",
  FILE_FOLDER: "/filefolder",
  DNS: "/dns",
  DNS_DOMAIN: "/dns/:domain",
});

const { ROUTES, matchRoute, isActiveRoute, buildPath } = createRouter(routeMap);

export type RouteKey = keyof typeof ROUTES;
export { ROUTES, matchRoute, isActiveRoute, buildPath };

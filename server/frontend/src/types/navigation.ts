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
  CERT_DETAIL_PATH: (certificateId: string) => {
    return `/cert/${encodeURIComponent(certificateId)}`;
  },
  CERT_EDIT_PATH: (certificateId: string) => {
    return `/cert/edit/${encodeURIComponent(certificateId)}`;
  },
  CERT_EDIT_APPLY_PATH: (certificateId: string) => {
    return `/cert/edit-apply/${encodeURIComponent(certificateId)}`;
  },
} as const;

export function isActiveRoute(currentPath: string, targetRoute: string): boolean {
  if (targetRoute === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(targetRoute);
}

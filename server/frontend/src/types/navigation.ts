import { CertificateSource } from "@/apis/domain";

export const ROUTES = {
  HOME: "/",
  CHECK: "/check",
  CERT_ADD: "/cert/add",
  CERT_APPLY: "/cert/apply",
  CERT_EDIT: "/cert/edit",
  CERT_EDIT_APPLY: "/cert/edit-apply",
  CERT_DETAIL: "/cert/:certType",
  ANALYSIS_TLS: "/analysis/tls",
  FILE_FOLDER_APIS: "/filefolder/apis",
  FILE_FOLDER_WEBSITES: "/filefolder/websites",
  CERT_DETAIL_PATH: (certType: string, domain: string, source: string | CertificateSource = CertificateSource.AUTO) => {
    // 枚举值本身就是字符串，可以直接使用
    const sourceValue = typeof source === "string" ? source : source;
    return `/cert/${certType}?domain=${encodeURIComponent(domain)}&source=${encodeURIComponent(sourceValue)}`;
  },
  CERT_EDIT_PATH: (certType: string, domain: string, source: string | CertificateSource = CertificateSource.AUTO) => {
    // 枚举值本身就是字符串，可以直接使用
    const sourceValue = typeof source === "string" ? source : source;
    return `/cert/edit?certType=${encodeURIComponent(certType)}&domain=${encodeURIComponent(domain)}&source=${encodeURIComponent(sourceValue)}`;
  },
  CERT_EDIT_APPLY_PATH: (certType: string, domain: string, source: string | CertificateSource = CertificateSource.AUTO) => {
    // 枚举值本身就是字符串，可以直接使用
    const sourceValue = typeof source === "string" ? source : source;
    return `/cert/edit-apply?certType=${encodeURIComponent(certType)}&domain=${encodeURIComponent(domain)}&source=${encodeURIComponent(sourceValue)}`;
  },
} as const;

export function isActiveRoute(currentPath: string, targetRoute: string): boolean {
  if (targetRoute === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(targetRoute);
}

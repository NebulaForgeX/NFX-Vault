import { ROUTES } from "@/navigations";
import type { CertType } from "@/types";

/** 与 CertCheckPage 筛选器一致的 query key */
export const CERT_TYPE_SEARCH_PARAM = "type";

const isCertType = (v: string | null | undefined): v is CertType =>
  v === "websites" || v === "apis" || v === "database";

/**
 * 从 URLSearchParams 读取当前证书分区；缺省或未识别时为 websites。
 */
export function getCertTypeFromSearchParams(searchParams: URLSearchParams): CertType {
  const raw = searchParams.get(CERT_TYPE_SEARCH_PARAM);
  return isCertType(raw) ? raw : "websites";
}

/**
 * 返回列表页路径，带上与证书 store 一致的 type（默认 websites 不写 query，保持地址干净）。
 */
export function buildCertCheckPath(storeOrType: string | null | undefined): string {
  const v = isCertType(storeOrType) ? storeOrType : "websites";
  if (v === "websites") return ROUTES.CHECK;
  return `${ROUTES.CHECK}?${CERT_TYPE_SEARCH_PARAM}=${encodeURIComponent(v)}`;
}

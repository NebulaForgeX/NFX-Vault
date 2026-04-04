import { API_ENDPOINTS } from "@/apis/ip";
import { safeStringable } from "nfx-ui/utils";

/** 与后端 `GET /vault/images/{id}/file` 对齐（公开、无需 Bearer）。 */
export function vaultImageFileUrl(imageId: string): string {
  const id = safeStringable(imageId).trim();
  if (!id) return "";
  const base = API_ENDPOINTS.PURE.replace(/\/$/, "");
  return `${base}/images/${id}/file`;
}

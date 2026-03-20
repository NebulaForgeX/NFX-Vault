/**
 * 文件 API 查询参数 — 与 NFX-Vault Backend 对齐。
 */

import type { CertType } from "@/types/enums";

export interface ListDirectoryParams {
  store: CertType;
  path?: string;
}

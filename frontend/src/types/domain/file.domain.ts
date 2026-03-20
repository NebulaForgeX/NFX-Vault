/**
 * 文件浏览领域类型 — 与 NFX-Vault Backend 目录列表 API 对齐。
 */

export interface FileItem {
  name: string;
  type: "file" | "directory";
  path: string;
  size?: number | null;
  modified: number;
}

export interface FileListResponse {
  success: boolean;
  message: string;
  store: string;
  path: string;
  items: FileItem[];
}

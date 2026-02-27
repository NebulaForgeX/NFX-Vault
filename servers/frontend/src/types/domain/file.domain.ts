// File Domain Types - 与 NFX-Identity/console types/domain 结构对齐

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

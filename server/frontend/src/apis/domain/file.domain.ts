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


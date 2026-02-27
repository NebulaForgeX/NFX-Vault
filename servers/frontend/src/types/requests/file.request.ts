// File Request Types - 与 NFX-Identity/console types/requests 结构对齐

// Vault 文件列表为 GET path 参数，无独立 request body 类型时可留空或后续补充
export interface ListFilesRequest {
  store: string;
  path: string;
}

// API 响应类型定义 - 对齐 NFX-Identity errx + fiberx 规范
/** 成功/错误统一信封：status 为 HTTP 状态码，错误时含 err_code（后端 errx.Code） */
export interface BaseResponse {
  status: number;
  errCode?: string;
  message: string;
  details?: unknown;
  meta?: Record<string, unknown>;
  traceId?: string;
}

/** 成功响应：含 data 负载 */
export interface DataResponse<T> extends BaseResponse {
  data: T;
}

/** 列表分页负载：与后端 httpx.Page 一致，放在 data 中 */
export interface ListDTO<T> {
  items: T[];
  total: number;
}

/** 兼容：列表接口的 data 可能是 ListDTO 或直接数组 */
export type ListData<T> = ListDTO<T> | T[];

/** 旧分页结构（如后端未统一为 items/total 时可保留引用） */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

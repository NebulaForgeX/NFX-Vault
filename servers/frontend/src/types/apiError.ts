/**
 * API 错误类型 - 与后端 NFX-Identity errx + fiberx 错误响应一致
 * 后端返回：{ status, err_code, message, details?, trace_id? }（axios-case-converter 转为 camelCase）
 */

export type ApiErrCode = string;

/** Rex/NFX 风格 API 错误体（前端 camelCase，与 response.data 一致） */
export interface ApiErrorBody {
  status?: number;
  errCode?: ApiErrCode;
  message?: string;
  details?: unknown;
  traceId?: string;
}

/**
 * TLS 分析请求体 — 与 NFX-Vault Backend 对齐。
 */

export interface AnalyzeTLSRequest {
  certificate: string;
  privateKey?: string;
}

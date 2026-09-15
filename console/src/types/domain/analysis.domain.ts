/**
 * TLS 分析 API 返回结构 — 与 NFX-Vault Backend analysis 路由对齐。
 */

export interface AnalyzeTLSCertificateInfo {
  domain: string | null;
  subject: Record<string, unknown>;
  issuer: string | null;
  sans?: string[];
  allDomains?: string[];
  notBefore: string | null;
  notAfter: string | null;
  isValid: boolean;
  daysRemaining: number | null;
}

export interface AnalyzeTLSPrivateKeyInfo {
  hasPrivateKey: boolean;
  valid?: boolean;
  error?: string;
}

export interface AnalyzeTLSSummary {
  isValid: boolean;
  daysRemaining: number | null;
  hasPrivateKey: boolean;
  keyValid: boolean | null;
}

export interface AnalyzeTLSResponse {
  success: boolean;
  message: string;
  data?: {
    certificate: AnalyzeTLSCertificateInfo;
    privateKey: AnalyzeTLSPrivateKeyInfo;
    summary: AnalyzeTLSSummary;
  };
}

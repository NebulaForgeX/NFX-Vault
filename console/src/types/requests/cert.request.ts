/**
 * 证书 API 请求体 — camelCase，由 axios-case-converter 转 snake_case
 */

export interface ApplyCertificateRequest {
  domain: string;
  email: string;
  sans?: string[];
  folderName?: string;
  webroot?: string;
  forceRenewal?: boolean;
}

export interface ReapplyCertificateRequest {
  certificateId: string;
  forceRenewal?: boolean;
}

export interface CreateCertificateRequest {
  domain: string;
  certificate: string;
  privateKey: string;
  sans?: string[];
  folderName?: string;
  email?: string;
  issuer?: string;
}

export interface UpdateManualAddCertificateRequest {
  certificateId: string;
  sans?: string[];
  folderName?: string;
  email?: string;
}

export interface DeleteCertificateRequest {
  certificateId: string;
}

export interface SearchCertificateRequest {
  keyword: string;
  offset?: number;
  limit?: number;
}

export interface ParseCertificatePreviewRequest {
  certificate: string;
}

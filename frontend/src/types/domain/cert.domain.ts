/**
 * 证书领域类型 — 与 NFX-Vault Backend 证书 API 视图对齐（列表 / 详情 / 搜索 / 导出）。
 * Certificate domain types aligned with Vault backend API (Pqttec-style module + list/detail split).
 */

import { CertificateSource, CertificateStatus } from "../enums";

export interface CertificateInfo {
  id: string;
  domain: string;
  store: string;
  source: CertificateSource;
  status?: CertificateStatus;
  email?: string;
  folderName?: string;
  issuer?: string;
  sans?: string[];
  notBefore?: string;
  notAfter?: string;
  isValid?: boolean;
  daysRemaining?: number;
  lastErrorMessage?: string;
  lastErrorTime?: string;
}

export interface CertificateListResponse {
  items: CertificateInfo[];
  total: number;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  error?: string;
  processed?: number;
}

export interface CertificateDetailResponse {
  id: string;
  domain: string;
  store: string;
  source: CertificateSource;
  status?: CertificateStatus;
  email?: string;
  folderName?: string;
  issuer?: string;
  notBefore?: string;
  notAfter?: string;
  isValid?: boolean;
  daysRemaining?: number;
  certificate: string;
  privateKey: string;
  sans?: string[];
  lastErrorMessage?: string;
  lastErrorTime?: string;
}

export interface CertificateResponse {
  success: boolean;
  message: string;
  status?: CertificateStatus;
  error?: string;
  /** 异步签发时用于轮询详情（axios-case-converter 转为 camelCase） */
  certificateId?: string;
}

export interface SearchCertificateResponse {
  success: boolean;
  message: string;
  items: CertificateInfo[];
  total: number;
}

export interface ExportCertificateItem {
  domain: string;
  store?: string;
  source?: CertificateSource;
  certificate: string;
  privateKey: string;
  sans?: string[];
  issuer?: string;
  notBefore?: string;
  notAfter?: string;
  isValid?: boolean;
  daysRemaining?: number;
}

export interface ExportResponse {
  success: boolean;
  message: string;
  certificates: ExportCertificateItem[];
  total: number;
}

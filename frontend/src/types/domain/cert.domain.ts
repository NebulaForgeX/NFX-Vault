/**
 * 证书领域类型 — 与 NFX-Vault Backend 对齐（无 store / source 列）
 */
import type { CertificateStatus } from "../enums";

export interface CertificateInfo {
  id: string;
  domain: string;
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

export interface CertificateDetailResponse {
  id: string;
  domain: string;
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
  certificateId?: string;
  rateLimit?: boolean;
  retryAfter?: string;
}

export interface SearchCertificateResponse {
  success?: boolean;
  message?: string;
  items: CertificateInfo[];
  total: number;
}

export interface ParseCertificatePreviewResponse {
  success: boolean;
  message: string;
  domain?: string;
  sans?: string[];
  issuer?: string;
  notBefore?: string;
  notAfter?: string;
  isValid?: boolean;
  daysRemaining?: number;
}

export interface ExportCertificateItem {
  domain: string;
  folderName?: string;
  status?: string;
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

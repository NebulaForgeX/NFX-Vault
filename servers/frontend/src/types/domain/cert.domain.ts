// Cert Domain Types - 与 NFX-Identity/console types/domain 结构对齐

import type { CertType } from "./enums";
import { CertificateSource, CertificateStatus } from "./enums";

export type { CertType };
export { CertificateSource, CertificateStatus, CertificateStore } from "./enums";

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

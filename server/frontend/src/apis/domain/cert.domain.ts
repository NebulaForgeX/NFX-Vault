export type CertType = "websites" | "apis" | "database";

export enum CertificateSource {
  AUTO = "auto",
  MANUAL_APPLY = "manual_apply",
  MANUAL_ADD = "manual_add",
}

export enum CertificateStatus {
  SUCCESS = "success",
  FAIL = "fail",
  PROCESS = "process",
}

export enum CertificateStore {
  WEBSITES = "websites",
  APIS = "apis",
  DATABASE = "database",
}

export interface CertificateInfo {
  id: string; // 证书 ID
  domain: string;
  store: string;
  source: CertificateSource;
  status?: CertificateStatus;
  email?: string;
  folderName?: string;
  issuer?: string;
  sans?: string[]; // SANs (Subject Alternative Names)
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
  id: string; // 证书 ID
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
  certificate: string; // PEM格式的证书内容
  privateKey: string; // PEM格式的私钥内容
  sans?: string[];
  lastErrorMessage?: string;
  lastErrorTime?: string;
}

export interface CreateCertificateRequest {
  store: CertType | "database";
  domain: string;
  certificate: string;
  privateKey: string;
  sans?: string[];
  folderName?: string; 
  email?: string;
  issuer?: string;
}

export interface UpdateManualAddCertificateRequest {
  certificateId: string; // 证书 ID（必需）
  certificate?: string;
  privateKey?: string;
  store?: CertType;
  sans?: string[];
  folderName?: string; 
  email?: string;
}

export interface UpdateManualApplyCertificateRequest {
  domain: string;
  folderName: string; 
  store?: CertType; // 证书类型（可选）
}

export interface DeleteCertificateRequest {
  domain: string;
  source: CertificateSource;
}

export interface CertificateResponse {
  success: boolean;
  message: string;
  status?: CertificateStatus;
  error?: string;
}

export interface ApplyCertificateRequest {
  domain: string;
  email: string;
  folderName: string;
  sans?: string[];
  webroot?: string;
}

export interface ReapplyAutoCertificateRequest {
  certificateId: string;
  email: string;
  sans?: string[];
  webroot?: string;
  forceRenewal?: boolean;
}

export interface ReapplyManualApplyCertificateRequest {
  certificateId: string;
  domain: string;
  email: string;
  folderName: string;
  sans?: string[];
  webroot?: string;
  forceRenewal?: boolean;
}

export interface ReapplyManualAddCertificateRequest {
  certificateId: string;
  email: string;
  sans?: string[];
  webroot?: string;
  forceRenewal?: boolean;
}

export interface SearchCertificateRequest {
  keyword: string;
  store?: CertType;
  source?: CertificateSource;
  offset?: number;
  limit?: number;
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

export type CertType = "websites" | "apis" | "database";

export enum CertificateSource {
  AUTO = "auto",
  MANUAL = "manual",
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
  domain: string;
  source?: CertificateSource;
  status?: CertificateStatus;
  email?: string;
  issuer?: string;
  notBefore?: string;
  notAfter?: string;
  isValid?: boolean;
  daysRemaining?: number;
}

export interface CertificateListResponse {
  certificates: CertificateInfo[];
  total: number;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  error?: string;
  processed?: number;
}

export interface CertificateDetailResponse {
  domain: string;
  store?: string;
  source?: CertificateSource;
  status?: CertificateStatus;
  email?: string;
  issuer?: string;
  notBefore?: string;
  notAfter?: string;
  isValid?: boolean;
  daysRemaining?: number;
  certificate: string; // PEM格式的证书内容
  privateKey: string; // PEM格式的私钥内容
  sans?: string[];
}

export interface CreateCertificateRequest {
  store: CertType;
  domain: string;
  certificate: string;
  privateKey: string;
  sans?: string[];
}

export interface UpdateCertificateRequest {
  domain: string;
  source: CertificateSource;
  certificate?: string;
  privateKey?: string;
  store?: CertType;
  sans?: string[];
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
  folder_name: string;
  sans?: string[];
  webroot?: string;
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

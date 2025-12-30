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
  folderName?: string; // axios-case-converter 会将后端的 folder_name 转换为 folderName
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
  store: CertType | "database";
  domain: string;
  certificate: string;
  privateKey: string;
  sans?: string[];
  folderName?: string; // axios-case-converter 会将后端的 folder_name 转换为 folderName
  email?: string;
  issuer?: string;
}

export interface UpdateCertificateRequest {
  domain: string;
  source: CertificateSource;
  certificate?: string;
  privateKey?: string;
  store?: CertType;
  sans?: string[];
  folderName?: string; // axios-case-converter 会将后端的 folder_name 转换为 folderName
  email?: string;
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
  folderName: string; // axios-case-converter 会将后端的 folder_name 转换为 folderName
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

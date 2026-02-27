// Cert Request Types - 与 NFX-Identity/console types/requests 结构对齐

import type { CertType } from "@/types/domain";
import type { CertificateSource } from "@/types/domain";

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
  certificateId: string;
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
  store?: CertType;
}

export interface DeleteCertificateRequest {
  certificate_id: string;
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

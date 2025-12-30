export interface AnalyzeTLSRequest {
  certificate: string;
  privateKey?: string;
}

export interface AnalyzeTLSCertificateInfo {
  domain: string | null;
  subject: Record<string, any>;
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


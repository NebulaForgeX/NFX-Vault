import type {
  CertificateListResponse,
  CertificateDetailResponse,
  ApplyCertificateRequest,
  ReapplyCertificateRequest,
  CreateCertificateRequest,
  UpdateManualAddCertificateRequest,
  DeleteCertificateRequest,
  SearchCertificateRequest,
  CertificateResponse,
  SearchCertificateResponse,
  ParseCertificatePreviewRequest,
  ParseCertificatePreviewResponse,
} from "@/types";

import { protectedClient } from "@/apis/clients";
import { URL_PATHS } from "./ip";

/** 与后端 Certbot 最长等待（如 300s）对齐，并留余量，避免 nginx/浏览器先断连 */
export const TLS_ISSUE_HTTP_TIMEOUT_MS = 420_000;

export interface GetCertificateListParams {
  offset?: number;
  limit?: number;
}

export const GetCertificateList = async (params: GetCertificateListParams = {}): Promise<CertificateListResponse> => {
  const { offset = 0, limit = 20 } = params;
  const { data } = await protectedClient.get<CertificateListResponse>(URL_PATHS.TLS.check, {
    params: { offset, limit },
  });
  return data;
};

export const GetCertificateDetailById = async (
  certificateId: string,
  options?: { timeout?: number },
): Promise<CertificateDetailResponse> => {
  const { data } = await protectedClient.get<CertificateDetailResponse>(URL_PATHS.TLS.detailById(certificateId), {
    timeout: options?.timeout ?? 30000,
  });
  return data;
};

export const ApplyCertificate = async (request: ApplyCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await protectedClient.post<CertificateResponse>(URL_PATHS.TLS.apply, request, {
    timeout: TLS_ISSUE_HTTP_TIMEOUT_MS,
  });
  return data;
};

export const ReapplyCertificate = async (request: ReapplyCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await protectedClient.post<CertificateResponse>(URL_PATHS.TLS.reapply, request, {
    timeout: TLS_ISSUE_HTTP_TIMEOUT_MS,
  });
  return data;
};

export const CreateCertificate = async (request: CreateCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await protectedClient.post<CertificateResponse>(URL_PATHS.TLS.create, request);
  return data;
};

export const UpdateManualAddCertificate = async (request: UpdateManualAddCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await protectedClient.put<CertificateResponse>(URL_PATHS.TLS.updateManualAdd, request);
  return data;
};

export const DeleteCertificate = async (request: DeleteCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await protectedClient.delete<CertificateResponse>(URL_PATHS.TLS.delete, {
    data: request,
  });
  return data;
};

export interface InvalidateCacheResponse {
  success: boolean;
  message: string;
}

export const InvalidateCache = async (): Promise<InvalidateCacheResponse> => {
  const { data } = await protectedClient.post<InvalidateCacheResponse>(URL_PATHS.TLS.invalidateCache);
  return data;
};

export const SearchCertificate = async (request: SearchCertificateRequest): Promise<SearchCertificateResponse> => {
  const { data } = await protectedClient.post<SearchCertificateResponse>(URL_PATHS.TLS.search, request);
  return data;
};

export const ParseCertificatePreview = async (
  request: ParseCertificatePreviewRequest,
): Promise<ParseCertificatePreviewResponse> => {
  const { data } = await protectedClient.post<ParseCertificatePreviewResponse>(URL_PATHS.TLS.parsePreview, request);
  return data;
};

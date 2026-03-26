import type {
  CertificateListResponse,
  CertificateDetailResponse,
  ApplyCertificateRequest,
  CreateCertificateRequest,
  UpdateManualAddCertificateRequest,
  DeleteCertificateRequest,
  SearchCertificateRequest,
  CertificateResponse,
  SearchCertificateResponse,
  ParseCertificatePreviewRequest,
  ParseCertificatePreviewResponse,
} from "@/types";

import { publicClient } from "@/apis/clients";
import { URL_PATHS } from "./ip";

export interface GetCertificateListParams {
  offset?: number;
  limit?: number;
}

export const GetCertificateList = async (params: GetCertificateListParams = {}): Promise<CertificateListResponse> => {
  const { offset = 0, limit = 20 } = params;
  const { data } = await publicClient.get<CertificateListResponse>(URL_PATHS.TLS.check, {
    params: { offset, limit },
  });
  return data;
};

export const GetCertificateDetailById = async (
  certificateId: string,
  options?: { timeout?: number },
): Promise<CertificateDetailResponse> => {
  const { data } = await publicClient.get<CertificateDetailResponse>(URL_PATHS.TLS.detailById(certificateId), {
    timeout: options?.timeout ?? 30000,
  });
  return data;
};

export const ApplyCertificate = async (request: ApplyCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(URL_PATHS.TLS.apply, request);
  return data;
};

export const CreateCertificate = async (request: CreateCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(URL_PATHS.TLS.create, request);
  return data;
};

export const UpdateManualAddCertificate = async (request: UpdateManualAddCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.put<CertificateResponse>(URL_PATHS.TLS.updateManualAdd, request);
  return data;
};

export const DeleteCertificate = async (request: DeleteCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.delete<CertificateResponse>(URL_PATHS.TLS.delete, {
    data: request,
  });
  return data;
};

export interface InvalidateCacheResponse {
  success: boolean;
  message: string;
}

export const InvalidateCache = async (): Promise<InvalidateCacheResponse> => {
  const { data } = await publicClient.post<InvalidateCacheResponse>(URL_PATHS.TLS.invalidateCache);
  return data;
};

export const SearchCertificate = async (request: SearchCertificateRequest): Promise<SearchCertificateResponse> => {
  const { data } = await publicClient.post<SearchCertificateResponse>(URL_PATHS.TLS.search, request);
  return data;
};

export const ParseCertificatePreview = async (
  request: ParseCertificatePreviewRequest,
): Promise<ParseCertificatePreviewResponse> => {
  const { data } = await publicClient.post<ParseCertificatePreviewResponse>(URL_PATHS.TLS.parsePreview, request);
  return data;
};

import type {
  CertType,
  CertificateListResponse,
  CertificateDetailResponse,
  RefreshResponse,
  CreateCertificateRequest,
  UpdateManualAddCertificateRequest,
  UpdateManualApplyCertificateRequest,
  DeleteCertificateRequest,
  ApplyCertificateRequest,
  ReapplyAutoCertificateRequest,
  ReapplyManualApplyCertificateRequest,
  ReapplyManualAddCertificateRequest,
  SearchCertificateRequest,
  CertificateResponse,
  SearchCertificateResponse,
} from "@/types";

import { publicClient } from "@/apis/clients";
import { URL_PATHS } from "./ip";

export interface GetCertificateListParams {
  certType: CertType;
  offset?: number;
  limit?: number;
}

export const GetCertificateList = async (params: GetCertificateListParams): Promise<CertificateListResponse> => {
  const { certType, offset = 0, limit = 20 } = params;
  const { data } = await publicClient.get<CertificateListResponse>(URL_PATHS.TLS.check(certType), {
    params: { offset, limit },
  });
  return data;
};

export const GetCertificateDetailById = async (certificateId: string): Promise<CertificateDetailResponse> => {
  const { data } = await publicClient.get<CertificateDetailResponse>(URL_PATHS.TLS.detailById(certificateId));
  return data;
};

export const RefreshCertificates = async (certType: CertType): Promise<RefreshResponse> => {
  const { data } = await publicClient.post<RefreshResponse>(URL_PATHS.TLS.refresh(certType));
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

export const UpdateManualApplyCertificate = async (request: UpdateManualApplyCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.put<CertificateResponse>(URL_PATHS.TLS.updateManualApply, request);
  return data;
};

export const DeleteCertificate = async (request: DeleteCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.delete<CertificateResponse>(URL_PATHS.TLS.delete, {
    data: request,
  });
  return data;
};

export const ApplyCertificate = async (request: ApplyCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(URL_PATHS.TLS.apply, request, {
    timeout: 360000,
  });
  return data;
};

export interface InvalidateCacheResponse {
  success: boolean;
  message: string;
}

export const InvalidateCache = async (certType: CertType): Promise<InvalidateCacheResponse> => {
  const { data } = await publicClient.post<InvalidateCacheResponse>(URL_PATHS.TLS.invalidateCache(certType));
  return data;
};

export const ReapplyAutoCertificate = async (request: ReapplyAutoCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(URL_PATHS.TLS.reapplyAuto, request, {
    timeout: 360000,
  });
  return data;
};

export const ReapplyManualApplyCertificate = async (request: ReapplyManualApplyCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(URL_PATHS.TLS.reapplyManualApply, request, {
    timeout: 360000,
  });
  return data;
};

export const ReapplyManualAddCertificate = async (request: ReapplyManualAddCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(URL_PATHS.TLS.reapplyManualAdd, request, {
    timeout: 360000,
  });
  return data;
};

export const SearchCertificate = async (request: SearchCertificateRequest): Promise<SearchCertificateResponse> => {
  const { data } = await publicClient.post<SearchCertificateResponse>(URL_PATHS.TLS.search, request);
  return data;
};


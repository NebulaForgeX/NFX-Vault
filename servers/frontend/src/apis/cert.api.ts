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
} from "@/apis/domain";

import { publicClient } from "@/apis/clients";

const baseUrl = "/tls";

export interface GetCertificateListParams {
  certType: CertType;
  offset?: number;
  limit?: number;
}

export const GetCertificateList = async (params: GetCertificateListParams): Promise<CertificateListResponse> => {
  const { certType, offset = 0, limit = 20 } = params;
  const { data } = await publicClient.get<CertificateListResponse>(`${baseUrl}/check/${certType}`, {
    params: { offset, limit },
  });
  return data;
};

export const GetCertificateDetailById = async (certificateId: string): Promise<CertificateDetailResponse> => {
  const { data } = await publicClient.get<CertificateDetailResponse>(`${baseUrl}/detail-by-id/${certificateId}`);
  return data;
};

export const RefreshCertificates = async (certType: CertType): Promise<RefreshResponse> => {
  const { data } = await publicClient.post<RefreshResponse>(`${baseUrl}/refresh/${certType}`);
  return data;
};

export const CreateCertificate = async (request: CreateCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(`${baseUrl}/create`, request);
  return data;
};

export const UpdateManualAddCertificate = async (request: UpdateManualAddCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.put<CertificateResponse>(`${baseUrl}/update/manual-add`, request);
  return data;
};

export const UpdateManualApplyCertificate = async (request: UpdateManualApplyCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.put<CertificateResponse>(`${baseUrl}/update/manual-apply`, request);
  return data;
};

export const DeleteCertificate = async (request: DeleteCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.delete<CertificateResponse>(`${baseUrl}/delete`, {
    data: request,
  });
  return data;
};

export const ApplyCertificate = async (request: ApplyCertificateRequest): Promise<CertificateResponse> => {
  // 证书申请需要较长时间（通常需要 10-60 秒），设置超时为 6 分钟（360 秒）
  const { data } = await publicClient.post<CertificateResponse>(`${baseUrl}/apply`, request, {
    timeout: 360000, // 360 秒 = 6 分钟
  });
  return data;
};

export interface InvalidateCacheResponse {
  success: boolean;
  message: string;
}

export const InvalidateCache = async (certType: CertType): Promise<InvalidateCacheResponse> => {
  const { data } = await publicClient.post<InvalidateCacheResponse>(`${baseUrl}/invalidate-cache/${certType}`);
  return data;
};

export const ReapplyAutoCertificate = async (request: ReapplyAutoCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(`${baseUrl}/reapply/auto`, request, {
    timeout: 360000, // 360 秒 = 6 分钟
  });
  return data;
};

export const ReapplyManualApplyCertificate = async (request: ReapplyManualApplyCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(`${baseUrl}/reapply/manual-apply`, request, {
    timeout: 360000, // 360 秒 = 6 分钟
  });
  return data;
};

export const ReapplyManualAddCertificate = async (request: ReapplyManualAddCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.post<CertificateResponse>(`${baseUrl}/reapply/manual-add`, request, {
    timeout: 360000, // 360 秒 = 6 分钟
  });
  return data;
};

export const SearchCertificate = async (request: SearchCertificateRequest): Promise<SearchCertificateResponse> => {
  const { data } = await publicClient.post<SearchCertificateResponse>(`${baseUrl}/search`, request);
  return data;
};


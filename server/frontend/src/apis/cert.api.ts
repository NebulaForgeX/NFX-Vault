import type {
  CertType,
  CertificateListResponse,
  CertificateDetailResponse,
  RefreshResponse,
  CreateCertificateRequest,
  UpdateCertificateRequest,
  DeleteCertificateRequest,
  ApplyCertificateRequest,
  CertificateResponse,
} from "@/apis/domain";
import { CertificateSource } from "@/apis/domain";

import { publicClient } from "@/apis/clients";

const baseUrl = "/tls";

export interface GetCertificateListParams {
  certType: CertType;
  page?: number;
  pageSize?: number;
}

export const GetCertificateList = async (params: GetCertificateListParams): Promise<CertificateListResponse> => {
  const { certType, page = 1, pageSize = 20 } = params;
  const { data } = await publicClient.get<CertificateListResponse>(`${baseUrl}/check/${certType}`, {
    params: { page, page_size: pageSize },
  });
  return data;
};


export const GetCertificateDetail = async (
  certType: CertType,
  domain: string,
  source: CertificateSource = CertificateSource.AUTO
): Promise<CertificateDetailResponse> => {
  const { data } = await publicClient.get<CertificateDetailResponse>(`${baseUrl}/detail/${certType}`, {
    params: { domain, source },
  });
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

export const UpdateCertificate = async (request: UpdateCertificateRequest): Promise<CertificateResponse> => {
  const { data } = await publicClient.put<CertificateResponse>(`${baseUrl}/update`, request);
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


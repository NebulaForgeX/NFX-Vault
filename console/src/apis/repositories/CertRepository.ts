import type {
  ApplyCertificateRequest,
  CertificateDetailResponse,
  CertificateListResponse,
  CertificateResponse,
  CreateCertificateRequest,
  DeleteCertificateRequest,
  ParseCertificatePreviewRequest,
  ParseCertificatePreviewResponse,
  ReapplyCertificateRequest,
  SearchCertificateRequest,
  SearchCertificateResponse,
  UpdateManualAddCertificateRequest,
} from "@/types";

import {
  ApplyCertificate,
  CreateCertificate,
  DeleteCertificate,
  GetCertificateDetailById,
  GetCertificateList,
  InvalidateCache,
  ParseCertificatePreview,
  ReapplyCertificate,
  SearchCertificate,
  UpdateManualAddCertificate,
  type GetCertificateListParams,
  type InvalidateCacheResponse,
} from "@/apis/cert.api";

export type { GetCertificateListParams };

export interface CertRepository {
  GetCertificateList(params?: GetCertificateListParams): Promise<CertificateListResponse>;
  GetCertificateDetailById(certificateId: string, options?: { timeout?: number }): Promise<CertificateDetailResponse>;
  ApplyCertificate(request: ApplyCertificateRequest): Promise<CertificateResponse>;
  ReapplyCertificate(request: ReapplyCertificateRequest): Promise<CertificateResponse>;
  CreateCertificate(request: CreateCertificateRequest): Promise<CertificateResponse>;
  UpdateManualAddCertificate(request: UpdateManualAddCertificateRequest): Promise<CertificateResponse>;
  DeleteCertificate(request: DeleteCertificateRequest): Promise<CertificateResponse>;
  InvalidateCache(): Promise<InvalidateCacheResponse>;
  SearchCertificate(request: SearchCertificateRequest): Promise<SearchCertificateResponse>;
  ParseCertificatePreview(request: ParseCertificatePreviewRequest): Promise<ParseCertificatePreviewResponse>;
}

export class ApiCertRepository implements CertRepository {
  GetCertificateList = GetCertificateList;
  GetCertificateDetailById = GetCertificateDetailById;
  ApplyCertificate = ApplyCertificate;
  ReapplyCertificate = ReapplyCertificate;
  CreateCertificate = CreateCertificate;
  UpdateManualAddCertificate = UpdateManualAddCertificate;
  DeleteCertificate = DeleteCertificate;
  InvalidateCache = InvalidateCache;
  SearchCertificate = SearchCertificate;
  ParseCertificatePreview = ParseCertificatePreview;
}

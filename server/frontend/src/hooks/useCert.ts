import type { CertType, CreateCertificateRequest, UpdateCertificateRequest, DeleteCertificateRequest, ApplyCertificateRequest } from "@/apis/domain";
import { CertificateSource } from "@/apis/domain";
import type { ListNumberCursorFetchResult } from "@/hooks/core/type";
import type { FetchNumberListParams } from "@/hooks/core/type";

import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { makeUnifiedQuery, makeUnifiedInfiniteQuery } from "@/hooks/core";

import * as certApi from "@/apis/cert.api";
import { cacheEventEmitter, cacheEvents } from "@/events";

// Query keys
export const certKeys = {
  list: (certType: CertType) => 
    ["certs", "list", certType] as const,
  detail: (certType: CertType, domain: string, source?: CertificateSource) => 
    ["certs", "detail", certType, domain, source] as const,
};

// API wrapper functions for makeUnifiedQuery (deprecated, use fetchCertificateList instead)
// const getCertificateList = async (params: { certType: CertType; page?: number; pageSize?: number }) => {
//   return certApi.GetCertificateList(params);
// };

// Adapter function for infinite query: converts offset/limit to page/pageSize and transforms response
const fetchCertificateList = async (
  params: FetchNumberListParams<{ certType: CertType }>
): Promise<ListNumberCursorFetchResult<import("@/apis/domain").CertificateInfo>> => {
  const { offset, limit, certType } = params;
  // Convert offset/limit to page/pageSize
  const page = Math.floor(offset / limit) + 1;
  const pageSize = limit;
  
  const result = await certApi.GetCertificateList({ certType, page, pageSize });
  
  // Transform response: { certificates, total } -> { items, total }
  return {
    items: result.certificates,
    total: result.total,
  };
};

const getCertificateDetail = async (params: { certType: CertType; domain: string; source?: CertificateSource }) => {
  return certApi.GetCertificateDetail(params.certType, params.domain, params.source || CertificateSource.AUTO);
};

/**
 * Hook to fetch certificate list (with infinite scroll)
 */
export const useCertificateList = makeUnifiedInfiniteQuery(
  fetchCertificateList,
  "suspense",
  20
);

/**
 * Hook to fetch certificate detail
 */
export const useCertificateDetail = (
  certType: CertType,
  domain: string,
  source: CertificateSource = CertificateSource.AUTO
) => {
  const filter = useMemo(() => ({ certType, domain, source }), [certType, domain, source]);
  return makeUnifiedQuery(getCertificateDetail, "suspense")(
    certKeys.detail(certType, domain, source),
    filter,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    }
  );
};

/**
 * Hook to export certificates
 */
export const useExportCertificates = () => {
  return useMutation({
    mutationFn: (certType: CertType) => certApi.ExportCertificates(certType),
    onSuccess: (_data, certType) => {
      // 发送事件触发缓存刷新（QueryProvider 会监听这个事件）
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, certType);
    },
  });
};

/**
 * Hook to refresh certificates (read acme.json and update database)
 */
export const useRefreshCertificates = () => {
  return useMutation({
    mutationFn: (certType: CertType) => certApi.RefreshCertificates(certType),
    onSuccess: (_data, certType) => {
      // 发送事件触发缓存刷新（QueryProvider 会监听这个事件）
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, certType);
    },
  });
};

/**
 * Hook to create certificate (manual)
 */
export const useCreateCertificate = () => {
  return useMutation({
    mutationFn: (request: CreateCertificateRequest) => certApi.CreateCertificate(request),
    onSuccess: () => {
      // 发送事件触发缓存刷新（QueryProvider 会监听这个事件）
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
    },
  });
};

/**
 * Hook to update certificate
 */
export const useUpdateCertificate = () => {
  return useMutation({
    mutationFn: (request: UpdateCertificateRequest) => certApi.UpdateCertificate(request),
    onSuccess: () => {
      // 发送事件触发缓存刷新（QueryProvider 会监听这个事件）
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
    },
  });
};

/**
 * Hook to delete certificate
 */
export const useDeleteCertificate = () => {
  return useMutation({
    mutationFn: (request: DeleteCertificateRequest) => certApi.DeleteCertificate(request),
    onSuccess: () => {
      // 发送事件触发缓存刷新（QueryProvider 会监听这个事件）
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
    },
  });
};

/**
 * Hook to apply certificate (Let's Encrypt)
 */
export const useApplyCertificate = () => {
  return useMutation({
    mutationFn: (request: ApplyCertificateRequest) => certApi.ApplyCertificate(request),
    onSuccess: () => {
      // 发送事件触发缓存刷新（QueryProvider 会监听这个事件）
      // apply 的证书存储在 database，但也需要刷新所有类型的缓存
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "database");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
    },
  });
};


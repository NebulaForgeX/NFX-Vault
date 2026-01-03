import type { CertType, CreateCertificateRequest, UpdateManualAddCertificateRequest, UpdateManualApplyCertificateRequest, DeleteCertificateRequest, ApplyCertificateRequest } from "@/apis/domain";
import { CertificateSource } from "@/apis/domain";
import type { FetchNumberListParams } from "@/hooks/core/type";

import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { makeUnifiedQuery, makeUnifiedInfiniteQuery } from "@/hooks/core";

import * as certApi from "@/apis/cert.api";
import * as fileApi from "@/apis/file.api";
import { cacheEventEmitter, cacheEvents } from "@/events";

// Query keys
export const certKeys = {
  list: (certType: CertType) => 
    ["certs", "list", certType] as const,
  detailById: (certificateId: string) => 
    ["certs", "detail-by-id", certificateId] as const,
  search: (keyword: string, store?: CertType, source?: CertificateSource) =>
    ["certs", "search", keyword, store, source] as const,
};

// API wrapper functions for makeUnifiedQuery (deprecated, use fetchCertificateList instead)
// const getCertificateList = async (params: { certType: CertType; page?: number; pageSize?: number }) => {
//   return certApi.GetCertificateList(params);
// };


/**
 * Hook to fetch certificate list (with infinite scroll)
 */
export const useCertificateList = makeUnifiedInfiniteQuery(
  async (params: FetchNumberListParams<{ certType: CertType }>) => {
    const result = await certApi.GetCertificateList(params);
    return { items: result.items, total: result.total };
  },
  "suspense",
  20
);

/**
 * Hook to fetch certificate detail by ID
 */
export const useCertificateDetailById = (certificateId: string) => {
  const filter = useMemo(() => ({ certificateId }), [certificateId]);
  return makeUnifiedQuery(
    (params: { certificateId: string }) => certApi.GetCertificateDetailById(params.certificateId),
    "suspense"
  )(
    certKeys.detailById(certificateId),
    filter,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    }
  );
};

/**
 * Hook to search certificates (with infinite scroll)
 */
export const useSearchCertificateList = makeUnifiedInfiniteQuery(
  async (params: FetchNumberListParams<{ keyword: string; store?: CertType; source?: CertificateSource }>) => {
    const result = await certApi.SearchCertificate(params);
    return { items: result.items, total: result.total };
  },
  "suspense",
  20
);

/**
 * Hook to export certificates
 */
export const useExportCertificates = () => {
  return useMutation({
    mutationFn: (certType: CertType) => fileApi.ExportCertificates({ store: certType }),
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
 * Hook to invalidate cache (trigger Redis cache invalidation)
 */
export const useInvalidateCache = () => {
  return useMutation({
    mutationFn: (certType: CertType) => certApi.InvalidateCache(certType),
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
 * Hook to update manual add certificate
 */
export const useUpdateManualAddCertificate = () => {
  return useMutation({
    mutationFn: (request: UpdateManualAddCertificateRequest) => certApi.UpdateManualAddCertificate(request),
    onSuccess: () => {
      // 发送事件触发缓存刷新（QueryProvider 会监听这个事件）
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "database");
    },
  });
};

/**
 * Hook to update manual apply certificate
 */
export const useUpdateManualApplyCertificate = () => {
  return useMutation({
    mutationFn: (request: UpdateManualApplyCertificateRequest) => certApi.UpdateManualApplyCertificate(request),
    onSuccess: () => {
      // 发送事件触发缓存刷新（QueryProvider 会监听这个事件）
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "database");
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


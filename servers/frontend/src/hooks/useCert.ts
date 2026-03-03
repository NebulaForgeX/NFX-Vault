/**
 * Cert hooks - 与 Sjgz-Admin 一致：使用 nfx-ui/hooks（makeUnifiedQuery / makeUnifiedInfiniteQuery）与 nfx-ui/constants 的 query key
 */
import type { CertType, CreateCertificateRequest, UpdateManualAddCertificateRequest, UpdateManualApplyCertificateRequest, DeleteCertificateRequest, ApplyCertificateRequest } from "@/types";
import type { CertificateDetailResponse, CertificateInfo } from "@/types";
import { CertificateSource } from "@/types";
import type { SuspenseInfiniteQueryOptions, SuspenseUnifiedQueryOptions, UnifiedQueryParams } from "nfx-ui/hooks";

import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { makeUnifiedInfiniteQuery, makeUnifiedQuery } from "nfx-ui/hooks";
import { getApiErrorMessage } from "nfx-ui/utils";

import * as certApi from "@/apis/cert.api";
import * as fileApi from "@/apis/file.api";
import { CERT_DETAIL, CERT_LIST, CERT_SEARCH } from "@/constants";
import { cacheEventEmitter, cacheEvents } from "@/events";
import { showError } from "@/stores/modalStore";

// ========== List (infinite) ==========

export const useCertificateList = (
  filter?: { certType: CertType },
  options?: SuspenseInfiniteQueryOptions<CertificateInfo>,
) => {
  const makeQuery = makeUnifiedInfiniteQuery<CertificateInfo, { certType: CertType }>(
    async (params) => {
      const { offset, limit, certType } = params;
      const result = await certApi.GetCertificateList({ certType, offset, limit });
      return { items: result.items, total: result.total };
    },
    "suspense",
    20,
  );
  return makeQuery(CERT_LIST, filter, options);
};

// ========== Detail (suspense) ==========

export const useCertificateDetailById = (
  certificateId: string,
  params?: Omit<UnifiedQueryParams<CertificateDetailResponse>, "id">,
) => {
  const { options, postProcess } = params ?? {};
  const makeQuery = makeUnifiedQuery<CertificateDetailResponse, { id: string }>(
    async (p) => certApi.GetCertificateDetailById(p.id),
    "suspense",
    postProcess as ((data: CertificateDetailResponse) => void) | undefined,
  );
  return makeQuery(
    CERT_DETAIL(certificateId),
    { id: certificateId },
    options as SuspenseUnifiedQueryOptions<CertificateDetailResponse> | undefined,
  );
};

// ========== Search (infinite) ==========

export interface SearchCertificateFilter {
  keyword: string;
  store?: CertType;
  source?: CertificateSource;
}

export const useSearchCertificateList = (
  filter?: SearchCertificateFilter,
  options?: SuspenseInfiniteQueryOptions<CertificateInfo>,
) => {
  const makeQuery = makeUnifiedInfiniteQuery<CertificateInfo, SearchCertificateFilter>(
    async (params) => {
      const { offset, limit, ...rest } = params;
      const result = await certApi.SearchCertificate({ ...rest, offset, limit });
      return { items: result.items, total: result.total };
    },
    "suspense",
    20,
  );
  return makeQuery(CERT_SEARCH, filter, options);
};

// ========== Mutations ==========

const onSuccessRefresh = (_data: unknown, certType: CertType) => {
  cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, certType);
};

export const useExportCertificates = () => {
  return useMutation({
    mutationFn: (certType: CertType) => fileApi.ExportCertificates({ store: certType }),
    onSuccess: onSuccessRefresh,
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useExportCertificates]")),
  });
};

export const useRefreshCertificates = () => {
  return useMutation({
    mutationFn: (certType: CertType) => certApi.RefreshCertificates(certType),
    onSuccess: onSuccessRefresh,
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useRefreshCertificates]")),
  });
};

export const useInvalidateCache = () => {
  return useMutation({
    mutationFn: (certType: CertType) => certApi.InvalidateCache(certType),
    onSuccess: onSuccessRefresh,
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useInvalidateCache]")),
  });
};

export const useCreateCertificate = () => {
  return useMutation({
    mutationFn: (request: CreateCertificateRequest) => certApi.CreateCertificate(request),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useCreateCertificate]")),
  });
};

export const useUpdateManualAddCertificate = () => {
  return useMutation({
    mutationFn: (request: UpdateManualAddCertificateRequest) => certApi.UpdateManualAddCertificate(request),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "database");
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpdateManualAddCertificate]")),
  });
};

export const useUpdateManualApplyCertificate = () => {
  return useMutation({
    mutationFn: (request: UpdateManualApplyCertificateRequest) => certApi.UpdateManualApplyCertificate(request),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "database");
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpdateManualApplyCertificate]")),
  });
};

export const useDeleteCertificate = () => {
  return useMutation({
    mutationFn: (request: DeleteCertificateRequest) => certApi.DeleteCertificate(request),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDeleteCertificate]")),
  });
};

export const useApplyCertificate = () => {
  return useMutation({
    mutationFn: (request: ApplyCertificateRequest) => certApi.ApplyCertificate(request),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "database");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useApplyCertificate]")),
  });
};

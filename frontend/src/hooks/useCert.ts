/**
 * Cert hooks — nfx-ui/hooks + 证书 API（无 store / source 维度）
 */
import type {
  ApplyCertificateRequest,
  CreateCertificateRequest,
  UpdateManualAddCertificateRequest,
  DeleteCertificateRequest,
  ParseCertificatePreviewRequest,
} from "@/types";
import type { CertificateDetailResponse, CertificateInfo } from "@/types";
import type { SuspenseInfiniteQueryOptions, SuspenseUnifiedQueryOptions, UnifiedQueryParams } from "nfx-ui/hooks";

import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { makeUnifiedInfiniteQuery, makeUnifiedQuery } from "nfx-ui/hooks";
import { getApiErrorMessage } from "nfx-ui/utils";

import * as certApi from "@/apis/cert.api";
import * as fileApi from "@/apis/file.api";
import { CERT_DETAIL, CERT_LIST } from "@/constants";
import { cacheEventEmitter, cacheEvents } from "@/events";
import { showError } from "@/stores/modalStore";

export const useCertificateList = (options?: SuspenseInfiniteQueryOptions<CertificateInfo>) => {
  const makeQuery = makeUnifiedInfiniteQuery<CertificateInfo, Record<string, never>>(
    async (params) => {
      const { offset, limit } = params;
      const result = await certApi.GetCertificateList({ offset, limit });
      return { items: result.items, total: result.total };
    },
    "suspense",
    20,
  );
  return makeQuery(CERT_LIST, {}, options);
};

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

export const useExportCertificates = () => {
  return useMutation({
    mutationFn: () => fileApi.ExportCertificates(),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES);
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useExportCertificates]")),
  });
};

export const useInvalidateCache = () => {
  return useMutation({
    mutationFn: () => certApi.InvalidateCache(),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES);
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useInvalidateCache]")),
  });
};

export const useApplyCertificate = () => {
  return useMutation({
    mutationFn: (request: ApplyCertificateRequest) => certApi.ApplyCertificate(request),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES);
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useApplyCertificate]")),
  });
};

export const useCreateCertificate = () => {
  return useMutation({
    mutationFn: (request: CreateCertificateRequest) => certApi.CreateCertificate(request),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES);
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useCreateCertificate]")),
  });
};

export const useUpdateManualAddCertificate = () => {
  return useMutation({
    mutationFn: (request: UpdateManualAddCertificateRequest) => certApi.UpdateManualAddCertificate(request),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES);
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpdateManualAddCertificate]")),
  });
};

export const useDeleteCertificate = () => {
  return useMutation({
    mutationFn: (request: DeleteCertificateRequest) => certApi.DeleteCertificate(request),
    onSuccess: () => {
      cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES);
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDeleteCertificate]")),
  });
};

export const useParseCertificatePreview = () => {
  return useMutation({
    mutationFn: (request: ParseCertificatePreviewRequest) => certApi.ParseCertificatePreview(request),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useParseCertificatePreview]")),
  });
};

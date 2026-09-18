/**
 * TLS hooks — nfx-ui/hooks + TlsRepository
 */
import type {
  ApplyCertificateRequest,
  CertificateDetailResponse,
  CertificateInfo,
  CreateCertificateRequest,
  DeleteCertificateRequest,
  ParseCertificatePreviewRequest,
  ReapplyCertificateRequest,
  UpdateManualAddCertificateRequest,
} from "@/types";
import type { AxiosError } from "axios";
import type { SuspenseInfiniteQueryOptions, SuspenseUnifiedQueryOptions } from "nfx-ui/hooks";

import { useMutation } from "@tanstack/react-query";
import { useUnifiedSuspenseInfiniteQuery, useUnifiedSuspenseQuery } from "nfx-ui/hooks";
import { getApiErrorMessage } from "nfx-ui/utils";
import { showError } from "@/stores/modalStore";

import { useFileRepository, useTlsRepository } from "@/apis/repositories";
import { TLS_DETAIL, TLS_LIST } from "@/constants";
import { tlsEventEmitter } from "@/events/tls";

export const useCertificateList = (options?: SuspenseInfiniteQueryOptions<CertificateInfo>) => {
  const tls = useTlsRepository();
  return useUnifiedSuspenseInfiniteQuery<CertificateInfo, { offset?: number; limit?: number }>(
    (params) => tls.GetCertificateList({ offset: params.offset, limit: params.limit }),
    TLS_LIST,
    {},
    options,
  );
};

export const useCertificateDetailById = (certificateId: string, options?: SuspenseUnifiedQueryOptions<CertificateDetailResponse>) => {
  const tls = useTlsRepository();
  return useUnifiedSuspenseQuery((p: { id: string }) => tls.GetCertificateDetailById(p.id), TLS_DETAIL(certificateId), { id: certificateId }, options);
};

export const useExportCertificates = () => {
  const file = useFileRepository();
  return useMutation({
    mutationFn: () => file.ExportCertificates(),
    onSuccess: () => {
      tlsEventEmitter.invalidateTls();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useExportCertificates]")),
  });
};

export const useInvalidateCache = () => {
  const tls = useTlsRepository();
  return useMutation({
    mutationFn: () => tls.InvalidateCache(),
    onSuccess: () => {
      tlsEventEmitter.invalidateTls();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useInvalidateCache]")),
  });
};

async function invalidateServerTlsCacheAfterIssueSuccess(tls: { InvalidateCache(): Promise<unknown> }, data: { success?: boolean }) {
  if (!data.success) return;
  try {
    await tls.InvalidateCache();
  } catch {
    /* 后端可能已清缓存；仍发前端刷新事件 */
  }
}

export const useApplyCertificate = () => {
  const tls = useTlsRepository();
  return useMutation({
    mutationFn: (request: ApplyCertificateRequest) => tls.ApplyCertificate(request),
    onSuccess: async (data) => {
      await invalidateServerTlsCacheAfterIssueSuccess(tls, data);
      tlsEventEmitter.invalidateTls();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useApplyCertificate]")),
  });
};

export const useReapplyCertificate = () => {
  const tls = useTlsRepository();
  return useMutation({
    mutationFn: (request: ReapplyCertificateRequest) => tls.ReapplyCertificate(request),
    onSuccess: async (data) => {
      await invalidateServerTlsCacheAfterIssueSuccess(tls, data);
      tlsEventEmitter.invalidateTls();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useReapplyCertificate]")),
  });
};

export const useCreateCertificate = () => {
  const tls = useTlsRepository();
  return useMutation({
    mutationFn: (request: CreateCertificateRequest) => tls.CreateCertificate(request),
    onSuccess: () => {
      tlsEventEmitter.invalidateTls();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useCreateCertificate]")),
  });
};

export const useUpdateManualAddCertificate = () => {
  const tls = useTlsRepository();
  return useMutation({
    mutationFn: (request: UpdateManualAddCertificateRequest) => tls.UpdateManualAddCertificate(request),
    onSuccess: (_data, variables) => {
      tlsEventEmitter.invalidateTls(variables.certificateId ? TLS_DETAIL(variables.certificateId) : undefined);
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpdateManualAddCertificate]")),
  });
};

export const useDeleteCertificate = () => {
  const tls = useTlsRepository();
  return useMutation({
    mutationFn: (request: DeleteCertificateRequest) => tls.DeleteCertificate(request),
    onSuccess: () => {
      tlsEventEmitter.invalidateTls();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDeleteCertificate]")),
  });
};

export const useParseCertificatePreview = () => {
  const tls = useTlsRepository();
  return useMutation({
    mutationFn: (request: ParseCertificatePreviewRequest) => tls.ParseCertificatePreview(request),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useParseCertificatePreview]")),
  });
};

/**
 * Cert hooks — nfx-ui/hooks + CertRepository
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
import { showError } from "nfx-ui/stores";

import { useCertRepository, useFileRepository } from "@/apis/repositories";
import { CERT_DETAIL, CERT_LIST } from "@/constants";
import { certEventEmitter } from "@/events/cert";

export const useCertificateList = (options?: SuspenseInfiniteQueryOptions<CertificateInfo>) => {
  const cert = useCertRepository();
  return useUnifiedSuspenseInfiniteQuery<CertificateInfo, { offset?: number; limit?: number }>(
    (params) => cert.GetCertificateList({ offset: params.offset, limit: params.limit }),
    CERT_LIST,
    {},
    options,
  );
};

export const useCertificateDetailById = (certificateId: string, options?: SuspenseUnifiedQueryOptions<CertificateDetailResponse>) => {
  const cert = useCertRepository();
  return useUnifiedSuspenseQuery((p: { id: string }) => cert.GetCertificateDetailById(p.id), CERT_DETAIL(certificateId), { id: certificateId }, options);
};

export const useExportCertificates = () => {
  const file = useFileRepository();
  return useMutation({
    mutationFn: () => file.ExportCertificates(),
    onSuccess: () => {
      certEventEmitter.invalidateCertificates();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useExportCertificates]")),
  });
};

export const useInvalidateCache = () => {
  const cert = useCertRepository();
  return useMutation({
    mutationFn: () => cert.InvalidateCache(),
    onSuccess: () => {
      certEventEmitter.invalidateCertificates();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useInvalidateCache]")),
  });
};

async function invalidateServerCertCacheAfterIssueSuccess(cert: { InvalidateCache(): Promise<unknown> }, data: { success?: boolean }) {
  if (!data.success) return;
  try {
    await cert.InvalidateCache();
  } catch {
    /* 后端可能已清缓存；仍发前端刷新事件 */
  }
}

export const useApplyCertificate = () => {
  const cert = useCertRepository();
  return useMutation({
    mutationFn: (request: ApplyCertificateRequest) => cert.ApplyCertificate(request),
    onSuccess: async (data) => {
      await invalidateServerCertCacheAfterIssueSuccess(cert, data);
      certEventEmitter.invalidateCertificates();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useApplyCertificate]")),
  });
};

export const useReapplyCertificate = () => {
  const cert = useCertRepository();
  return useMutation({
    mutationFn: (request: ReapplyCertificateRequest) => cert.ReapplyCertificate(request),
    onSuccess: async (data) => {
      await invalidateServerCertCacheAfterIssueSuccess(cert, data);
      certEventEmitter.invalidateCertificates();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useReapplyCertificate]")),
  });
};

export const useCreateCertificate = () => {
  const cert = useCertRepository();
  return useMutation({
    mutationFn: (request: CreateCertificateRequest) => cert.CreateCertificate(request),
    onSuccess: () => {
      certEventEmitter.invalidateCertificates();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useCreateCertificate]")),
  });
};

export const useUpdateManualAddCertificate = () => {
  const cert = useCertRepository();
  return useMutation({
    mutationFn: (request: UpdateManualAddCertificateRequest) => cert.UpdateManualAddCertificate(request),
    onSuccess: (_data, variables) => {
      certEventEmitter.invalidateCertificates(variables.certificateId ? CERT_DETAIL(variables.certificateId) : undefined);
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useUpdateManualAddCertificate]")),
  });
};

export const useDeleteCertificate = () => {
  const cert = useCertRepository();
  return useMutation({
    mutationFn: (request: DeleteCertificateRequest) => cert.DeleteCertificate(request),
    onSuccess: () => {
      certEventEmitter.invalidateCertificates();
    },
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useDeleteCertificate]")),
  });
};

export const useParseCertificatePreview = () => {
  const cert = useCertRepository();
  return useMutation({
    mutationFn: (request: ParseCertificatePreviewRequest) => cert.ParseCertificatePreview(request),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useParseCertificatePreview]")),
  });
};

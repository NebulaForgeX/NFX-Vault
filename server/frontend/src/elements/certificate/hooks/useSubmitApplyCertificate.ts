import type { FieldErrors } from "react-hook-form";
import type { ApplyCertificateFormValues } from "../controllers/applyCertificateSchema";
import type { CertificateDetailResponse } from "@/apis/domain";
import { CertificateSource } from "@/apis/domain";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { 
  ApplyCertificate, 
  ReapplyAutoCertificate, 
  ReapplyManualApplyCertificate, 
  ReapplyManualAddCertificate 
} from "@/apis/cert.api";
import { showError, showSuccess, showLoading, hideLoading, showConfirm } from "@/stores/modalStore";
import { ROUTES } from "@/types/navigation";
import { cacheEventEmitter, cacheEvents } from "@/events";

export const useSubmitApplyCertificate = (
  source: CertificateSource = CertificateSource.MANUAL_APPLY,
  certificate?: CertificateDetailResponse | null
) => {
  const navigate = useNavigate();
  const { t } = useTranslation("certificateElements");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { values: ApplyCertificateFormValues }) => {
      showLoading({
        title: t("apply.title"),
        message: t("apply.applying"),
      });
      try {
        // 根据 source 调用不同的 API
        if (certificate?.id) {
          // Reapply 场景
          switch (source) {
            case CertificateSource.AUTO:
              return await ReapplyAutoCertificate({
                certificateId: certificate.id,
                email: data.values.email.trim(),
                sans: data.values.sans && data.values.sans.length > 0 ? data.values.sans : undefined,
                webroot: data.values.webroot && data.values.webroot.trim() ? data.values.webroot.trim() : undefined,
                forceRenewal: data.values.forceRenewal || false,
              });
            case CertificateSource.MANUAL_APPLY:
              return await ReapplyManualApplyCertificate({
                certificateId: certificate.id,
                domain: data.values.domain.trim(),
                email: data.values.email.trim(),
                folderName: data.values.folderName.trim(),
                sans: data.values.sans && data.values.sans.length > 0 ? data.values.sans : undefined,
                webroot: data.values.webroot && data.values.webroot.trim() ? data.values.webroot.trim() : undefined,
                forceRenewal: data.values.forceRenewal || false,
              });
            case CertificateSource.MANUAL_ADD:
              return await ReapplyManualAddCertificate({
                certificateId: certificate.id,
                email: data.values.email.trim(),
                sans: data.values.sans && data.values.sans.length > 0 ? data.values.sans : undefined,
                webroot: data.values.webroot && data.values.webroot.trim() ? data.values.webroot.trim() : undefined,
                forceRenewal: data.values.forceRenewal || false,
              });
            default:
              throw new Error("Invalid certificate source");
          }
        } else {
          // 新申请场景
          return await ApplyCertificate({
            domain: data.values.domain.trim(),
            email: data.values.email.trim(),
            folderName: data.values.folderName.trim(),
            sans: data.values.sans && data.values.sans.length > 0 ? data.values.sans : undefined,
            webroot: data.values.webroot && data.values.webroot.trim() ? data.values.webroot.trim() : undefined,
          });
        }
      } finally {
        hideLoading();
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        // apply 的证书存储在 database，但也需要刷新所有类型的缓存
        cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "database");
        cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
        cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
        showSuccess(result.message || t("messages.certificateApplySuccess"));
        navigate(ROUTES.CHECK);
      } else {
        const errorMsg = result.error 
          ? `${result.message}\n${t("messages.errorReason")}: ${result.error}`
          : result.message || t("messages.certificateApplyFailed");
        showError(errorMsg);
      }
    },
    onError: (error: Error) => {
      console.error("Apply certificate error:", error);
      showError(error.message || t("messages.certificateApplyFailed"));
    },
  });

  const onSubmit = useCallback(
    async (values: ApplyCertificateFormValues) => {
      // 显示确认 modal
      const domain = certificate?.domain || values.domain;
      const confirmMessage = values.forceRenewal
        ? t("reapply.confirmMessageForce", { domain })
        : t("reapply.confirmMessage", { domain });
      
      showConfirm({
        title: t("reapply.confirmTitle"),
        message: confirmMessage,
        confirmText: t("reapply.confirm"),
        cancelText: t("reapply.cancel"),
        onConfirm: async () => {
          try {
            await mutateAsync({ values });
          } catch (error) {
            console.error("Apply certificate error:", error);
          }
        },
      });
    },
    [mutateAsync, certificate, t],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<ApplyCertificateFormValues>) => {
      console.error("Form validation errors:", errors);
      const firstError = Object.values(errors)[0];
      showError(firstError?.message || t("messages.checkFormErrors"));
    },
    [t],
  );

  return {
    onSubmit,
    onSubmitError,
    isPending,
  };
};

export default useSubmitApplyCertificate;


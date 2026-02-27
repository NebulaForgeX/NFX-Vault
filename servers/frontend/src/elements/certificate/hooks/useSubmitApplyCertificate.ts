import type { FieldErrors } from "react-hook-form";
import type { ApplyCertificateFormValues } from "../controllers/applyCertificateSchema";
import type { CertificateDetailResponse } from "@/types";
import { CertificateSource } from "@/types";

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
  const { t: tElements } = useTranslation("certificateElements");
  const { t: tEditApply } = useTranslation("certEditApply");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { values: ApplyCertificateFormValues }) => {
      showLoading({
        title: tElements("apply.title"),
        message: tElements("apply.applying"),
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
        showSuccess(result.message || tElements("messages.certificateApplySuccess"));
        navigate(ROUTES.CHECK);
      } else {
        const errorMsg = result.error 
          ? `${result.message}\n${tElements("messages.errorReason")}: ${result.error}`
          : result.message || tElements("messages.certificateApplyFailed");
        showError(errorMsg);
      }
    },
    onError: (error: Error) => {
      console.error("Apply certificate error:", error);
      showError(error.message || tElements("messages.certificateApplyFailed"));
    },
  });

  const onSubmit = useCallback(
    async (values: ApplyCertificateFormValues) => {
      // 显示确认 modal
      const domain = certificate?.domain || values.domain;
      // 对于 manual apply，使用 "申请证书" 而不是 "重新申请证书"
      const confirmMessage = values.forceRenewal
        ? tEditApply("reapply.confirmMessageForce", { domain })
        : tEditApply("reapply.confirmMessage", { domain });
      
      showConfirm({
        title: source === CertificateSource.MANUAL_APPLY 
          ? tEditApply("form.applyTitle") || "申请证书"
          : tEditApply("reapply.confirmTitle"),
        message: confirmMessage,
        confirmText: tEditApply("reapply.confirm"),
        cancelText: tEditApply("reapply.cancel"),
        onConfirm: async () => {
          try {
            await mutateAsync({ values });
          } catch (error) {
            console.error("Apply certificate error:", error);
          }
        },
      });
    },
    [mutateAsync, certificate, source, tEditApply],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<ApplyCertificateFormValues>) => {
      console.error("Form validation errors:", errors);
      const firstError = Object.values(errors)[0];
      showError(firstError?.message || tElements("messages.checkFormErrors"));
    },
    [tElements],
  );

  return {
    onSubmit,
    onSubmitError,
    isPending,
  };
};

export default useSubmitApplyCertificate;


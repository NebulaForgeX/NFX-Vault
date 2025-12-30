import type { FieldErrors } from "react-hook-form";
import type { ApplyCertificateFormValues } from "../controllers/applyCertificateSchema";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ApplyCertificate } from "@/apis/cert.api";
import { showError, showSuccess, showLoading, hideLoading } from "@/stores/modalStore";
import { ROUTES } from "@/types/navigation";
import { cacheEventEmitter, cacheEvents } from "@/events";

export const useSubmitApplyCertificate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("certApply");
  const { t: tCommon } = useTranslation("common");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { values: ApplyCertificateFormValues }) => {
      showLoading({
        title: t("apply.title") || "申请证书",
        message: t("apply.applying") || "正在申请证书，请稍候...",
      });
      try {
        const result = await ApplyCertificate({
          domain: data.values.domain.trim(),
          email: data.values.email.trim(),
          folderName: data.values.folderName.trim(), // axios-case-converter 会将 folderName 转换为 folder_name
          sans: data.values.sans && data.values.sans.length > 0 ? data.values.sans : undefined,
          webroot: data.values.webroot && data.values.webroot.trim() ? data.values.webroot.trim() : undefined,
        });
        return result;
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
        showSuccess(result.message || tCommon("messages.certificateApplySuccess"));
        navigate(ROUTES.CHECK);
      } else {
        const errorMsg = result.error 
          ? `${result.message}\n${tCommon("messages.errorReason")}: ${result.error}`
          : result.message || tCommon("messages.certificateApplyFailed");
        showError(errorMsg);
      }
    },
    onError: (error: Error) => {
      console.error("Apply certificate error:", error);
      showError(error.message || tCommon("messages.certificateApplyFailed"));
    },
  });

  const onSubmit = useCallback(
    async (values: ApplyCertificateFormValues) => {
      try {
        await mutateAsync({ values });
      } catch (error) {
        console.error("Apply certificate error:", error);
      }
    },
    [mutateAsync],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<ApplyCertificateFormValues>) => {
      console.error("Form validation errors:", errors);
      const firstError = Object.values(errors)[0];
      showError(firstError?.message || tCommon("messages.checkFormErrors"));
    },
    [tCommon],
  );

  return {
    onSubmit,
    onSubmitError,
    isPending,
  };
};

export default useSubmitApplyCertificate;


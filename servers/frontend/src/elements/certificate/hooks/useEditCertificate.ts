import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../controllers/certificateSchema";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "node_modules/react-i18next";

import { useUpdateManualAddCertificate, useUpdateManualApplyCertificate } from "@/hooks";
import { CertificateSource } from "@/apis/domain";
import type { CertType } from "@/types";
import { showError, showSuccess } from "@/stores/modalStore";
import { ROUTES } from "@/types/navigation";

export const useEditCertificate = (domain: string, source: CertificateSource, certificateId?: string) => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { mutateAsync: mutateManualAdd, isPending: isPendingManualAdd } = useUpdateManualAddCertificate();
  const { mutateAsync: mutateManualApply, isPending: isPendingManualApply } = useUpdateManualApplyCertificate();

  const isPending = isPendingManualAdd || isPendingManualApply;

  const onSubmit = useCallback(
    async (values: CertificateFormValues) => {
      try {
        let result;
        
        if (source === CertificateSource.MANUAL_APPLY) {
          // MANUAL_APPLY 可以更新 folder_name 和 store
          if (!values.folderName) {
            showError(t("messages.folderNameRequired"));
            return;
          }
          result = await mutateManualApply({
            domain,
            folderName: values.folderName,
            store: values.store as CertType,
          });
        } else if (source === CertificateSource.MANUAL_ADD) {
          // MANUAL_ADD 可以更新所有字段
          if (!certificateId) {
            showError(t("messages.certificateIdMissing"));
            return;
          }
          result = await mutateManualAdd({
            certificateId, // 传递证书 ID（必需）
            certificate: values.certificate?.trim(),
            privateKey: values.privateKey?.trim(),
            store: values.store as CertType,
            sans: values.sans && values.sans.length > 0 ? values.sans : undefined,
            folderName: values.folderName?.trim() || undefined,
            email: values.email?.trim() || undefined,
          });
        } else {
          showError(t("messages.unsupportedSource"));
          return;
        }

        if (result.success) {
          showSuccess(result.message || t("messages.certificateUpdateSuccess"));
          navigate(ROUTES.CHECK);
        } else {
          showError(result.message || t("messages.certificateUpdateFailed"));
        }
      } catch (error: any) {
        console.error("Edit certificate error:", error);
        showError(error?.message || t("messages.certificateUpdateFailed"));
      }
    },
    [mutateManualAdd, mutateManualApply, navigate, domain, source, certificateId, t],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<CertificateFormValues>) => {
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

export default useEditCertificate;


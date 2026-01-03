import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../controllers/certificateSchema";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "node_modules/react-i18next";

import { useCreateCertificate } from "@/hooks";
import { showError, showSuccess } from "@/stores/modalStore";
import { ROUTES } from "@/types/navigation";

export const useSubmitCertificate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { mutateAsync, isPending } = useCreateCertificate();

  const onSubmit = useCallback(
    async (values: CertificateFormValues) => {
      try {
        const result = await mutateAsync({
          store: values.store,
          domain: values.domain.trim(),
          certificate: values.certificate.trim(),
          privateKey: values.privateKey.trim(),
          sans: values.sans && values.sans.length > 0 ? values.sans : undefined,
          folderName: values.folderName?.trim() || undefined, // axios-case-converter 会将 folderName 转换为 folder_name
          email: values.email?.trim() || undefined,
          issuer: values.issuer?.trim() || undefined,
        });

        if (result.success) {
          showSuccess(result.message || t("messages.certificateCreateSuccess"));
          navigate(ROUTES.CHECK);
        } else {
          showError(result.message || t("messages.certificateCreateFailed"));
        }
      } catch (error: any) {
        console.error("Submit certificate error:", error);
        showError(error?.message || t("messages.certificateCreateFailed"));
      }
    },
    [mutateAsync, navigate, t],
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

export default useSubmitCertificate;


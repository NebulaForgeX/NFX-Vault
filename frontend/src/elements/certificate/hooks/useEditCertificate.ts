import type { FieldErrors } from "react-hook-form";
import type { EditCertificateFormValues } from "../schemas/certificateSchema";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { useUpdateManualAddCertificate } from "@/hooks";
import { showError, showSuccess } from "@/stores/modalStore";
import { ROUTES } from "@/navigations";

export const useEditCertificate = (certificateId: string) => {
  const { t } = useTranslation("common");
  const { mutateAsync, isPending } = useUpdateManualAddCertificate();

  const onSubmit = useCallback(
    async (values: EditCertificateFormValues) => {
      try {
        if (!certificateId) {
          showError(t("messages.certificateIdMissing"));
          return;
        }
        const result = await mutateAsync({
          certificateId,
          sans: values.sans ?? [],
          folderName: values.folderName?.trim() || undefined,
          email: values.email?.trim() || undefined,
        });

        if (result.success) {
          showSuccess(result.message || t("messages.certificateUpdateSuccess"));
          routerEventEmitter.navigate({ to: ROUTES.CHECK });
        } else {
          showError(result.message || t("messages.certificateUpdateFailed"));
        }
      } catch (error: unknown) {
        console.error("Edit certificate error:", error);
        const msg = error instanceof Error ? error.message : t("messages.certificateUpdateFailed");
        showError(msg);
      }
    },
    [mutateAsync, certificateId, t],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<EditCertificateFormValues>) => {
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

import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../schemas/certificateSchema";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { useApplyCertificate } from "@/hooks";
import { ROUTES } from "@/navigations";
import { showError, showSuccess } from "@/stores/modalStore";

export const useSubmitCertificate = () => {
  const { t } = useTranslation("common");
  const { mutateAsync, isPending } = useApplyCertificate();

  const onSubmit = useCallback(
    async (values: CertificateFormValues) => {
      try {
        const email = values.email?.trim();
        if (!email) {
          showError(t("validation.emailRequired"));
          return;
        }
        const result = await mutateAsync({
          domain: values.domain.trim(),
          email,
          sans: values.sans && values.sans.length > 0 ? values.sans : undefined,
          folderName: values.folderName?.trim() || undefined,
          webroot: values.webroot?.trim() || undefined,
          forceRenewal: values.forceRenewal,
        });

        if (result.success) {
          showSuccess(result.message || t("messages.certificateApplySuccess"));
          routerEventEmitter.navigate({ to: ROUTES.CHECK });
        } else {
          let msg = result.message || t("messages.certificateApplyFailed");
          if (result.rateLimit && result.retryAfter) {
            msg = `${msg} (retry after ${result.retryAfter})`;
          }
          showError(msg);
        }
      } catch (error: unknown) {
        console.error("Apply certificate error:", error);
        const msg = error instanceof Error ? error.message : t("messages.certificateApplyFailed");
        showError(msg);
      }
    },
    [mutateAsync, t],
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

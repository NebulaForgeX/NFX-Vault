import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { buildCertCheckPath } from "@/utils/certCheckUrl";
import { hideLoading, showConfirm, showError, showLoading, showSuccess } from "@/stores/modalStore";
import { useCertificateDetailById, useDeleteCertificate, useReapplyCertificate } from "@/hooks";

export const useOperationCertificate = (certificateId: string) => {
  const { t } = useTranslation("certDetail");
  const { t: tc } = useTranslation("common");
  const deleteMutation = useDeleteCertificate();
  const reapplyMutation = useReapplyCertificate();
  const { data: certificate } = useCertificateDetailById(certificateId);

  const handleEdit = useCallback(() => {
    if (!certificateId) {
      console.error("Certificate ID is required");
      return;
    }
    routerEventEmitter.navigate({ to: ROUTES.CERT_EDIT.replace(":certificateId", encodeURIComponent(certificateId)) });
  }, [certificateId]);

  const handleReapply = useCallback(() => {
    if (!certificate) {
      showError(t("reapply.notLoaded"));
      return;
    }
    const domain = certificate.domain;
    const line1 = t("reapply.confirm").replace("{{domain}}", domain);
    const message = `${line1}\n\n${t("reapply.confirmDetail")}`;

    showConfirm({
      title: t("reapply.title"),
      message,
      confirmText: t("reapply.confirmSubmit"),
      cancelText: t("delete.confirm.cancel"),
      forceRenewalOption: {
        label: t("reapply.forceRenewal"),
        defaultChecked: false,
      },
      onConfirm: (opts) => {
        const forceRenewal = opts?.forceRenewal ?? false;
        void (async () => {
          showLoading({ message: t("reapply.applying") });
          try {
            const result = await reapplyMutation.mutateAsync({
              certificateId,
              forceRenewal,
            });
            if (result.success) {
              showSuccess(result.message || tc("messages.certificateApplySuccess"));
              routerEventEmitter.navigate({ to: ROUTES.CHECK });
            } else {
              let msg = result.message || tc("messages.certificateApplyFailed");
              if (result.rateLimit && result.retryAfter) {
                msg = `${msg} (retry after ${result.retryAfter})`;
              }
              showError(msg);
            }
          } catch {
            // useReapplyCertificate onError 已弹窗
          } finally {
            hideLoading();
          }
        })();
      },
    });
  }, [reapplyMutation, certificate, certificateId, t, tc]);

  const handleDelete = useCallback(() => {
    if (!certificate) {
      console.error("Certificate not loaded");
      return;
    }
    const domain = certificate.domain;

    showConfirm({
      title: t("delete.confirm.title") || "Delete Certificate",
      message: (t("delete.confirm.message") || `Are you sure you want to delete the certificate for domain "{{domain}}"?`).replace(
        "{{domain}}",
        domain,
      ),
      confirmText: t("delete.confirm.confirm") || "Delete",
      cancelText: t("delete.confirm.cancel") || "Cancel",
      onConfirm: async () => {
        try {
          const result = await deleteMutation.mutateAsync({
            certificateId,
          });

          if (result.success) {
            showSuccess(result.message || t("delete.success") || "Certificate deleted successfully");
            routerEventEmitter.navigate({ to: buildCertCheckPath() });
          } else {
            showError(result.message || t("delete.error") || "Failed to delete certificate");
          }
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : t("delete.error");
          showError(msg || "Failed to delete certificate");
        }
      },
    });
  }, [deleteMutation, certificate, certificateId, t]);

  return {
    handleEdit,
    handleReapply,
    handleDelete,
    isDeleting: deleteMutation.isPending,
    isReapplying: reapplyMutation.isPending,
  };
};

export default useOperationCertificate;

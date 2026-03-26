import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { buildCertCheckPath } from "@/utils/certCheckUrl";
import { showConfirm, showError, showSuccess } from "@/stores/modalStore";
import { useDeleteCertificate, useCertificateDetailById } from "@/hooks";

export const useOperationCertificate = (certificateId: string) => {
  const { t } = useTranslation("certDetail");
  const deleteMutation = useDeleteCertificate();
  const { data: certificate } = useCertificateDetailById(certificateId);

  const handleEdit = useCallback(() => {
    if (!certificateId) {
      console.error("Certificate ID is required");
      return;
    }
    routerEventEmitter.navigate({ to: ROUTES.CERT_EDIT.replace(":certificateId", encodeURIComponent(certificateId)) });
  }, [certificateId]);

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
    handleDelete,
    isDeleting: deleteMutation.isPending,
  };
};

export default useOperationCertificate;

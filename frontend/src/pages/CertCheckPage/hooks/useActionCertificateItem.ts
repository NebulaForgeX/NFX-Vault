import type { CertificateInfo } from "@/types";

import { useCallback } from "react";

import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { useDeleteCertificate } from "@/hooks";
import { showConfirm, showError, showSuccess } from "@/stores/modalStore";
import { useTranslation } from "react-i18next";

export const useActionCertificateItem = () => {
  const { t } = useTranslation("certCheck");
  const deleteMutation = useDeleteCertificate();

  const handleEdit = useCallback((cert: CertificateInfo) => {
    return () => {
      if (!cert.id) {
        console.error("Certificate ID is required", cert);
        return;
      }
      routerEventEmitter.navigate({ to: ROUTES.CERT_EDIT.replace(":certificateId", encodeURIComponent(cert.id)) });
    };
  }, []);

  const handleView = useCallback((cert: CertificateInfo) => {
    return () => {
      if (!cert.id) {
        console.error("Certificate ID is required", cert);
        return;
      }
      routerEventEmitter.navigate({ to: ROUTES.CERT_DETAIL.replace(":certificateId", encodeURIComponent(cert.id)) });
    };
  }, []);

  const handleDelete = useCallback(
    (cert: CertificateInfo) => {
      return () => {
        if (!cert.id) {
          console.error("Certificate ID is required", cert);
          return;
        }
        showConfirm({
          title: t("delete.confirm.title") || "Delete Certificate",
          message: (t("delete.confirm.message") || `Are you sure you want to delete the certificate for domain "{{domain}}"?`).replace("{{domain}}", cert.domain),
          confirmText: t("delete.confirm.confirm") || "Delete",
          cancelText: t("delete.confirm.cancel") || "Cancel",
          onConfirm: async () => {
            try {
              const result = await deleteMutation.mutateAsync({
                certificateId: cert.id,
              });

              if (result.success) {
                showSuccess(result.message || t("delete.success") || "Certificate deleted successfully");
              } else {
                showError(result.message || t("delete.error") || "Failed to delete certificate");
              }
            } catch (error: any) {
              showError(error?.message || t("delete.error") || "Failed to delete certificate");
            }
          },
        });
      };
    },
    [deleteMutation, t],
  );

  return { handleEdit, handleView, handleDelete };
};

export default useActionCertificateItem;


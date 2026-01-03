import type { CertificateInfo } from "@/apis/domain";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/types/navigation";
import { useDeleteCertificate } from "@/hooks";
import { showConfirm, showError, showSuccess } from "@/stores/modalStore";
import { useTranslation } from "node_modules/react-i18next";

export const useActionCertificateItem = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("certCheck");
  const deleteMutation = useDeleteCertificate();

  const handleEdit = useCallback(
    (cert: CertificateInfo) => {
      return () => {
        if (!cert.id) {
          console.error("Certificate ID is required", cert);
          return;
        }
        navigate(ROUTES.CERT_EDIT_PATH(cert.id));
      };
    },
    [navigate],
  );

  const handleView = useCallback(
    (cert: CertificateInfo) => {
      return () => {
        if (!cert.id) {
          console.error("Certificate ID is required", cert);
          return;
        }
        navigate(ROUTES.CERT_DETAIL_PATH(cert.id));
      };
    },
    [navigate],
  );

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
                certificate_id: cert.id,
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


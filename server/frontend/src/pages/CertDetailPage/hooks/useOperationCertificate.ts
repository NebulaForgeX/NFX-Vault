import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/types/navigation";
import { showConfirm, showError, showSuccess } from "@/stores/modalStore";
import { useDeleteCertificate, useApplyCertificate, useCertificateDetailById } from "@/hooks";

export const useOperationCertificate = (certificateId: string) => {
  const navigate = useNavigate();
  const { t } = useTranslation("certDetail");
  const deleteMutation = useDeleteCertificate();
  const applyMutation = useApplyCertificate();
  const { data: certificate } = useCertificateDetailById(certificateId);

  const handleEdit = useCallback(() => {
    if (!certificateId) {
      console.error("Certificate ID is required");
      return;
    }
    navigate(ROUTES.CERT_EDIT_PATH(certificateId));
  }, [navigate, certificateId]);

  const handleReapply = useCallback(() => {
    if (!certificate) {
      console.error("Certificate not loaded");
      return;
    }
    const domain = certificate.domain;
    
    showConfirm({
      title: t("reapply.title") || "Re-apply Certificate",
      message: (t("reapply.confirm") || `Are you sure you want to re-apply certificate for "${domain}"?`).replace("{{domain}}", domain),
      confirmText: t("actions.reapply") || "Re-apply",
      cancelText: t("delete.confirm.cancel") || "Cancel",
      onConfirm: async () => {
        navigate(ROUTES.CERT_EDIT_APPLY_PATH(certificateId));
      },
    });
  }, [navigate, certificate, certificateId, t]);

  const handleDelete = useCallback(() => {
    if (!certificate) {
      console.error("Certificate not loaded");
      return;
    }
    const domain = certificate.domain;
    
    showConfirm({
      title: t("delete.confirm.title") || "Delete Certificate",
      message: (t("delete.confirm.message") || `Are you sure you want to delete the certificate for domain "${domain}"?`).replace("{{domain}}", domain),
      confirmText: t("delete.confirm.confirm") || "Delete",
      cancelText: t("delete.confirm.cancel") || "Cancel",
      onConfirm: async () => {
        try {
          const result = await deleteMutation.mutateAsync({
            certificate_id: certificateId,
          });

          if (result.success) {
            showSuccess(result.message || t("delete.success") || "Certificate deleted successfully");
            navigate(ROUTES.CHECK);
          } else {
            showError(result.message || t("delete.error") || "Failed to delete certificate");
          }
        } catch (error: any) {
          showError(error?.message || t("delete.error") || "Failed to delete certificate");
        }
      },
    });
  }, [deleteMutation, certificate, certificateId, navigate, t]);

  return {
    handleEdit,
    handleReapply,
    handleDelete,
    isDeleting: deleteMutation.isPending,
    isReapplying: applyMutation.isPending,
  };
};

export default useOperationCertificate;

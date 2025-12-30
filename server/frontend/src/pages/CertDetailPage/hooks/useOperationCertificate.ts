import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CertificateSource } from "@/apis/domain";
import { ROUTES } from "@/types/navigation";
import { showConfirm, showError } from "@/stores/modalStore";
import { useDeleteCertificate, useApplyCertificate } from "@/hooks";
import type { CertType } from "@/types";

interface UseOperationCertificateProps {
  domain: string;
  source: CertificateSource;
  certType: CertType;
}

export const useOperationCertificate = ({ domain, source, certType }: UseOperationCertificateProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation("cert");
  const deleteMutation = useDeleteCertificate();
  const applyMutation = useApplyCertificate();

  const handleUpdate = useCallback(() => {
    // 如果是 AUTO 源的证书，不允许编辑
    if (source === CertificateSource.AUTO) {
      showError(t("update.autoNotEditable") || "Auto source certificates cannot be manually updated. Please re-apply instead.");
      return;
    }
    // 导航到编辑页面
    navigate(ROUTES.CERT_EDIT_PATH(certType, domain, source));
  }, [navigate, certType, domain, source, t]);

  const handleReapply = useCallback(() => {
    showConfirm({
      title: t("reapply.title") || "Re-apply Certificate",
      message: (t("reapply.confirm") || `Are you sure you want to re-apply certificate for "${domain}"?`).replace("{{domain}}", domain),
      confirmText: t("actions.reapply") || "Re-apply",
      cancelText: t("delete.confirm.cancel") || "Cancel",
      onConfirm: async () => {
        // 导航到重新申请页面
        navigate(ROUTES.CERT_EDIT_APPLY_PATH(certType, domain, source));
      },
    });
  }, [navigate, certType, domain, source, t]);

  const handleDelete = useCallback(() => {
    showConfirm({
      title: t("delete.confirm.title") || "Delete Certificate",
      message: (t("delete.confirm.message") || `Are you sure you want to delete the certificate for domain "${domain}"?`).replace("{{domain}}", domain),
      confirmText: t("delete.confirm.confirm") || "Delete",
      cancelText: t("delete.confirm.cancel") || "Cancel",
      onConfirm: async () => {
        try {
          const result = await deleteMutation.mutateAsync({
            domain,
            source,
          });

          if (result.success) {
            navigate(ROUTES.CHECK);
          } else {
            showError(result.message || t("delete.error") || "Failed to delete certificate");
          }
        } catch (error: any) {
          showError(error?.message || t("delete.error") || "Failed to delete certificate");
        }
      },
    });
  }, [deleteMutation, domain, source, navigate, t]);

  return {
    handleUpdate,
    handleReapply,
    handleDelete,
    isUpdating: false, // update 操作不需要 loading 状态（直接导航）
    isDeleting: deleteMutation.isPending,
    isReapplying: applyMutation.isPending,
  };
};

export default useOperationCertificate;


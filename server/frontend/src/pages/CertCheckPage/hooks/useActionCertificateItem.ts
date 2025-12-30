import type { CertificateInfo } from "@/apis/domain";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/types/navigation";
import { CertificateSource } from "@/apis/domain";
import { useDeleteCertificate } from "@/hooks";
import { showConfirm, showError, showSuccess } from "@/stores/modalStore";
import { useTranslation } from "react-i18next";

export const useActionCertificateItem = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("certCheck");
  const deleteMutation = useDeleteCertificate();

  const handleEdit = useCallback(
    (cert: CertificateInfo, certType: string) => {
      return () => {
        const source = (cert.source as CertificateSource) || CertificateSource.AUTO;
        // 允许所有类型的证书点击编辑，编辑页面会根据 source 显示不同的表单（只读或可编辑）
        navigate(ROUTES.CERT_EDIT_PATH(certType, cert.domain, source));
      };
    },
    [navigate],
  );

  const handleView = useCallback(
    (cert: CertificateInfo, certType: string) => {
      return () => {
        navigate(
          ROUTES.CERT_DETAIL_PATH(
            certType,
            cert.domain,
            (cert.source as CertificateSource) || CertificateSource.AUTO
          )
        );
      };
    },
    [navigate],
  );

  const handleDelete = useCallback(
    (cert: CertificateInfo) => {
      return () => {
        showConfirm({
          title: t("delete.confirm.title") || "Delete Certificate",
          message: (t("delete.confirm.message") || `Are you sure you want to delete the certificate for domain "{{domain}}"?`).replace("{{domain}}", cert.domain),
          confirmText: t("delete.confirm.confirm") || "Delete",
          cancelText: t("delete.confirm.cancel") || "Cancel",
          onConfirm: async () => {
            try {
              const result = await deleteMutation.mutateAsync({
                domain: cert.domain,
                source: (cert.source as CertificateSource) || CertificateSource.AUTO,
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


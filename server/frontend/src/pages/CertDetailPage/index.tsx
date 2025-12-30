import { memo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Suspense } from "@/components";
import { useCertificateDetail, useDeleteCertificate, useUpdateCertificate, useApplyCertificate } from "@/hooks";
import { CertificateSource } from "@/apis/domain";
import type { CertType } from "@/types";
import { ROUTES } from "@/types/navigation";
import { showSuccess, showError, showConfirm } from "@/stores/modalStore";
import {
  CertDetailHeader,
  CertificateInfo,
  CertificateContent,
  PrivateKeyContent,
  CertificateOperations,
} from "./components";
import styles from "./styles.module.css";

// 内部组件：实际渲染证书详情
const CertDetailContent = memo(() => {
  const { t } = useTranslation("cert");
  const { certType } = useParams<{ certType: CertType }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const deleteMutation = useDeleteCertificate();
  const updateMutation = useUpdateCertificate();
  const applyMutation = useApplyCertificate();

  // 从查询参数获取 domain 和 source
  const domain = searchParams.get("domain") || "";
  const sourceParam = searchParams.get("source") || CertificateSource.AUTO;
  const source = (sourceParam === CertificateSource.AUTO || sourceParam === CertificateSource.MANUAL)
    ? (sourceParam as CertificateSource)
    : CertificateSource.AUTO;
  
  // Suspense 模式下，certType 和 domain 必须存在（由父组件保证）
  const { data: certDetail } = useCertificateDetail(certType!, domain, source);

  // Suspense 模式下，certDetail 一定存在，无需检查
  const handleCopyCertificate = () => {
    navigator.clipboard.writeText(certDetail.certificate);
    showSuccess(t("copy.success") || "Certificate copied to clipboard");
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(certDetail.privateKey);
    showSuccess(t("copy.success") || "Private key copied to clipboard");
  };

  const handleDownloadCertificate = () => {
    const blob = new Blob([certDetail.certificate], { type: "application/x-x509-ca-cert" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${certDetail.domain}.crt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess(t("download.success") || "Certificate downloaded");
  };

  const handleDownloadPrivateKey = () => {
    const blob = new Blob([certDetail.privateKey], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${certDetail.domain}.key`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess(t("download.success") || "Private key downloaded");
  };

  const handleExportBoth = () => {
    handleDownloadCertificate();
    setTimeout(() => {
      handleDownloadPrivateKey();
    }, 200);
  };

  const handleDelete = () => {
    showConfirm({
      title: t("delete.confirm.title") || "Delete Certificate",
      message: (t("delete.confirm.message") || `Are you sure you want to delete the certificate for domain "${certDetail.domain}"?`).replace("{{domain}}", certDetail.domain),
      confirmText: t("delete.confirm.confirm") || "Delete",
      cancelText: t("delete.confirm.cancel") || "Cancel",
      onConfirm: async () => {
        try {
          const result = await deleteMutation.mutateAsync({
            domain: certDetail.domain,
            source: (certDetail.source as CertificateSource) || CertificateSource.AUTO,
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
  };

  const handleReapply = () => {
    // 导航到重新申请页面
    navigate(ROUTES.CERT_EDIT_APPLY_PATH(certType!, certDetail.domain, source));
  };


  return (
    <div className={styles.container}>
      <CertDetailHeader certDetail={certDetail} />

      <div className={styles.content}>
        <CertificateInfo certDetail={certDetail} />
        <CertificateContent certificate={certDetail.certificate} onCopy={handleCopyCertificate} />
        <PrivateKeyContent privateKey={certDetail.privateKey} onCopy={handleCopyPrivateKey} />
        <CertificateOperations
          certDetail={certDetail}
          certType={certType!}
          source={source}
          onDownloadCertificate={handleDownloadCertificate}
          onDownloadPrivateKey={handleDownloadPrivateKey}
          onExportBoth={handleExportBoth}
          onDelete={handleDelete}
          onReapply={handleReapply}
          isUpdating={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          isReapplying={applyMutation.isPending}
        />
      </div>
    </div>
  );
});

CertDetailContent.displayName = "CertDetailContent";

// 主组件：使用 Suspense 包装
const CertDetailPage = memo(() => {
  const { certType } = useParams<{ certType: CertType }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation("cert");

  const domain = searchParams.get("domain");

  if (!certType || !domain) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{t("error.loadFailed") || "Invalid certificate parameters"}</p>
          <Button onClick={() => navigate(ROUTES.CHECK)} variant="primary">
            {t("back") || "Back to Certificate List"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      loadingType="truck"
      loadingText={t("loading") || "Loading certificate..."}
      loadingSize="medium"
    >
      <CertDetailContent />
    </Suspense>
  );
});

CertDetailPage.displayName = "CertDetailPage";

export default CertDetailPage;


import { memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "node_modules/react-i18next";
import { Button, Suspense } from "@/components";
import { useCertificateDetailById } from "@/hooks";
import { ROUTES } from "@/types/navigation";
import { showSuccess } from "@/stores/modalStore";
import {
  CertDetailHeader,
  CertificateInfo,
  CertificateContent,
  PrivateKeyContent,
  CertificateOperations,
  ExportCertificate,
} from "./components";
import styles from "./styles.module.css";

// 内部组件：使用 ID 获取详情
const CertDetailContent = memo(() => {
  const { t } = useTranslation("certDetail");
  const { certificateId } = useParams<{ certificateId: string }>();
  const { data: certDetail } = useCertificateDetailById(certificateId || ""); 

  // Suspense 模式下，certDetail 一定存在，无需检查
  const handleCopyCertificate = () => {
    navigator.clipboard.writeText(certDetail.certificate);
    showSuccess(t("copy.success") || "Certificate copied to clipboard");
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(certDetail.privateKey);
    showSuccess(t("copy.success") || "Private key copied to clipboard");
  };

  return (
    <div className={styles.container}>
      <CertDetailHeader certDetail={certDetail} />

      <div className={styles.content}>
        <CertificateInfo certDetail={certDetail} />
        <CertificateContent certificate={certDetail.certificate} onCopy={handleCopyCertificate} />
        <PrivateKeyContent privateKey={certDetail.privateKey} onCopy={handleCopyPrivateKey} />
        <ExportCertificate
          certificate={certDetail.certificate}
          privateKey={certDetail.privateKey}
          domain={certDetail.domain}
          certificateId={certDetail.id}
        />
        <CertificateOperations certificateId={certDetail.id} />
      </div>
    </div>
  );
});

CertDetailContent.displayName = "CertDetailContent";

// 主组件：使用 Suspense 包装
const CertDetailPage = memo(() => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("certDetail");

  if (!certificateId) {
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

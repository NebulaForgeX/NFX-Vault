import { memo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Suspense } from "@/components";
import { useCertificateDetail } from "@/hooks";
import { CertificateSource } from "@/apis/domain";
import type { CertType } from "@/types";
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

// 内部组件：实际渲染证书详情
const CertDetailContent = memo(() => {
  const { t } = useTranslation("cert");
  const { certType } = useParams<{ certType: CertType }>();
  const [searchParams] = useSearchParams();

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
        />
        <CertificateOperations
          domain={certDetail.domain}
          source={(certDetail.source as CertificateSource) || source}
          certType={certType!}
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


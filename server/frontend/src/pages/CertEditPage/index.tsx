import { memo } from "react";
import { ArrowLeft } from "@/assets/icons/lucide";
import { FormProvider } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Suspense } from "@/components";
import { useInitCertificateForm, useEditCertificate } from "@/elements/certificate";
import { useCertificateDetail } from "@/hooks";
import { CertificateSource } from "@/apis/domain";
import type { CertType } from "@/types";

import { CertForm } from "./components";
import styles from "./styles.module.css";

const CertEditPageContent = memo(() => {
  const { t } = useTranslation("cert");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const domain = searchParams.get("domain");
  const sourceParam = searchParams.get("source") || CertificateSource.AUTO;
  const certType = searchParams.get("certType") as CertType | null;

  const source = (sourceParam === CertificateSource.AUTO || sourceParam === CertificateSource.MANUAL)
    ? (sourceParam as CertificateSource)
    : CertificateSource.AUTO;

  if (!domain || !certType) {
    navigate(-1);
    return null;
  }

  const { data: certificate } = useCertificateDetail(certType, domain, source);
  const methods = useInitCertificateForm(certificate || null);
  const { onSubmit, onSubmitError, isPending } = useEditCertificate(domain, source);

  const handleBack = () => {
    navigate(-1);
  };

  // 如果是 AUTO 源的证书，不允许编辑，重定向回列表页
  if (certificate && source === CertificateSource.AUTO) {
    navigate(-1);
    return null;
  }

  if (!certificate) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <div className={styles.page}>
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.title}>
              {t("form.editTitle") || "编辑证书"} - {certificate.domain}
            </h1>
            <p className={styles.subtitle}>
              {t("form.editSubtitle") || `更新「${certificate.domain}」的证书信息`}
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.rightColumn}>
            <CertForm
              onSubmit={onSubmit}
              onSubmitError={onSubmitError}
              isPending={isPending}
              isEditMode
            />
          </div>
        </div>
      </div>
    </FormProvider>
  );
});

CertEditPageContent.displayName = "CertEditPageContent";

const CertEditPage = memo(() => {
  const { t } = useTranslation("cert");

  return (
    <Suspense
      loadingType="truck"
      loadingText={t("loading") || "Loading certificate..."}
      loadingSize="medium"
    >
      <CertEditPageContent />
    </Suspense>
  );
});

CertEditPage.displayName = "CertEditPage";

export default CertEditPage;


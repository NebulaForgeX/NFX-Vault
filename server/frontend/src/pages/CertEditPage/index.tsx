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

import { AutoForm, ManualApplyForm, ManualAddForm } from "./components";
import styles from "./styles.module.css";

const CertEditPageContent = memo(() => {
  const { t } = useTranslation("certEdit");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const domain = searchParams.get("domain");
  const sourceParam = searchParams.get("source") || CertificateSource.AUTO;
  const certType = searchParams.get("certType") as CertType | null;

  const source = (sourceParam === CertificateSource.AUTO || 
                  sourceParam === CertificateSource.MANUAL_APPLY || 
                  sourceParam === CertificateSource.MANUAL_ADD)
    ? (sourceParam as CertificateSource)
    : CertificateSource.AUTO;

  if (!domain || !certType) {
    navigate(-1);
    return null;
  }

  const { data: certificate } = useCertificateDetail(certType, domain, source);
  const methods = useInitCertificateForm(certificate || null);
  const { onSubmit, onSubmitError, isPending } = useEditCertificate(domain, source, certificate?.id);

  const handleBack = () => {
    navigate(-1);
  };

  if (!certificate)  return null;
  // 根据 source 选择不同的表单组件
  const renderForm = () => {
    switch (source) {
      case CertificateSource.AUTO:
        return (
          <AutoForm
            onSubmit={onSubmit}
            onSubmitError={onSubmitError}
            isPending={isPending}
          />
        );
      case CertificateSource.MANUAL_APPLY:
        return (
          <ManualApplyForm
            onSubmit={onSubmit}
            onSubmitError={onSubmitError}
            isPending={isPending}
          />
        );
      case CertificateSource.MANUAL_ADD:
        return (
          <ManualAddForm
            onSubmit={onSubmit}
            onSubmitError={onSubmitError}
            isPending={isPending}
          />
        );
      default:
        return null;
    }
  };

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
              {certificate.source && (
                <span className={styles.sourceBadge}>
                  ({t(`source.${certificate.source}`) || certificate.source})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.rightColumn}>
            {renderForm()}
          </div>
        </div>
      </div>
    </FormProvider>
  );
});

CertEditPageContent.displayName = "CertEditPageContent";

const CertEditPage = memo(() => {
  const { t } = useTranslation("certEdit");

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


import { memo } from "react";
import { ArrowLeft } from "@/assets/icons/lucide";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Suspense } from "nfx-ui/components";
import { routerEventEmitter } from "@/events/router";
import { useInitCertificateForm, useEditCertificate } from "@/elements/certificate";
import { useCertificateDetailById } from "@/hooks";
import { CertificateSource } from "@/types";

import { AutoForm, ManualApplyForm, ManualAddForm } from "./components";
import styles from "./styles.module.css";

const CertEditPageContent = memo(() => {
  const { t } = useTranslation("certEdit");
  const { certificateId } = useParams<{ certificateId: string }>();

  if (!certificateId) {
    routerEventEmitter.navigateBack();
    return null;
  }

  const { data: certificate } = useCertificateDetailById(certificateId);
  const methods = useInitCertificateForm(certificate || null);
  const { onSubmit, onSubmitError, isPending } = useEditCertificate(
    certificate.domain, 
    certificate.source as CertificateSource, 
    certificate.id
  );

  const handleBack = () => routerEventEmitter.navigateBack();

  if (!certificate) return null;
  
  const source = (certificate.source as CertificateSource) || CertificateSource.AUTO;
  
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


import { memo } from "react";
import { ArrowLeft } from "@/assets/icons/lucide";
import { FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Suspense } from "@/components";
import { useInitApplyCertificateForm, useSubmitApplyCertificate } from "@/elements/certificate";
import { useCertificateDetailById } from "@/hooks";
import { CertificateSource } from "@/apis/domain";

import { AutoForm, ManualApplyForm, ManualAddForm } from "./components";
import styles from "./styles.module.css";

const CertEditApplyPageContent = memo(() => {
  const { t } = useTranslation("certEditApply");
  const navigate = useNavigate();
  const { certificateId } = useParams<{ certificateId: string }>();

  if (!certificateId) {
    navigate(-1);
    return null;
  }

  // 获取证书详情用于回填
  const { data: certificate } = useCertificateDetailById(certificateId);
  
  // Form setup - 传入证书数据用于回填
  const methods = useInitApplyCertificateForm(certificate);
  const { onSubmit, onSubmitError, isPending } = useSubmitApplyCertificate(certificate.source, certificate);

  const handleBack = () => navigate(-1);
  

  // 根据 source 选择不同的表单组件
  const renderForm = () => {
    switch (certificate.source) {
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
            certificate={certificate}
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
              {t("title")} - {certificate.domain}
            </h1>
            <p className={styles.subtitle}>
              {t("subtitle", { domain: certificate.domain })}
              <span className={styles.sourceBadge}>
                ({t(`source.${certificate.source}`)})
              </span>
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

CertEditApplyPageContent.displayName = "CertEditApplyPageContent";

const CertEditApplyPage = memo(() => {
  const { t } = useTranslation("certEditApply");

  return (
    <Suspense
      loadingType="truck"
      loadingText={t("loading")}
      loadingSize="medium"
    >
      <CertEditApplyPageContent />
    </Suspense>
  );
});

CertEditApplyPage.displayName = "CertEditApplyPage";

export default CertEditApplyPage;


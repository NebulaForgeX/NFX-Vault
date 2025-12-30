import { memo } from "react";
import { ArrowLeft } from "@/assets/icons/lucide";
import { FormProvider } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Suspense } from "@/components";
import { useInitApplyCertificateForm, useSubmitApplyCertificate } from "@/elements/certificate";
import { useCertificateDetail } from "@/hooks";
import { CertificateSource } from "@/apis/domain";
import type { CertType } from "@/types";

import { AutoForm, ManualApplyForm, ManualAddForm } from "./components";
import styles from "./styles.module.css";

const CertEditApplyPageContent = memo(() => {
  const { t } = useTranslation("certEditApply");
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

  // 获取证书详情用于回填
  const { data: certificate } = useCertificateDetail(certType, domain, source);
  
  // Form setup - 传入证书数据用于回填
  const methods = useInitApplyCertificateForm(certificate || null);
  const { onSubmit, onSubmitError, isPending } = useSubmitApplyCertificate(source, certificate);

  const handleBack = () => {
    navigate(-1);
  };

  // 等待证书数据加载完成
  if (!certificate) {
    return null;
  }

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
              {t("title")} - {domain}
            </h1>
            <p className={styles.subtitle}>
              {t("subtitle", { domain })}
              {certificate.source && (
                <span className={styles.sourceBadge}>
                  ({t(`source.${certificate.source}`)})
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


import { memo } from "react";
import { ArrowLeft } from "@/assets/icons/lucide";
import { FormProvider } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Suspense } from "@/components";
import { useInitApplyCertificateForm, useSubmitApplyCertificate } from "@/elements/certificate";

import { EditApplyForm } from "./components";
import styles from "./styles.module.css";

const CertEditApplyPageContent = memo(() => {
  const { t } = useTranslation("certEditApply");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const domain = searchParams.get("domain");

  if (!domain) {
    navigate(-1);
    return null;
  }

  // Form setup
  const methods = useInitApplyCertificateForm();
  const { onSubmit, onSubmitError, isPending } = useSubmitApplyCertificate();

  const handleBack = () => {
    navigate(-1);
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
              {t("title") || "编辑申请证书"} - {domain}
            </h1>
            <p className={styles.subtitle}>
              {t("subtitle") || `重新申请「${domain}」的 Let's Encrypt 证书`}
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.rightColumn}>
            <EditApplyForm 
              onSubmit={onSubmit} 
              onSubmitError={onSubmitError} 
              isPending={isPending}
              domain={domain}
            />
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
      loadingText={t("loading") || "Loading..."}
      loadingSize="medium"
    >
      <CertEditApplyPageContent />
    </Suspense>
  );
});

CertEditApplyPage.displayName = "CertEditApplyPage";

export default CertEditApplyPage;


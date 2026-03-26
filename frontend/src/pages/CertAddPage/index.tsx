import { memo } from "react";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ArrowLeft } from "@/assets/icons/lucide";
import { routerEventEmitter } from "@/events/router";
import { CertificateApplyForm, useInitApplyCertificateForm, useSubmitCertificate } from "@/elements/certificate";
import { Suspense } from "nfx-ui/components";
import styles from "./styles.module.css";

const CertAddPage = memo(() => {
  const { t } = useTranslation("certAdd");

  const methods = useInitApplyCertificateForm();
  const { onSubmit, onSubmitError, isPending } = useSubmitCertificate();

  const handleBack = () => routerEventEmitter.navigateBack();

  return (
    <FormProvider {...methods}>
      <div className={styles.page}>
        <div className={styles.main}>
          <div className={styles.header}>
            <button type="button" onClick={handleBack} className={styles.backBtn} aria-label={t("title")}>
              <ArrowLeft size={20} />
            </button>
            <h1 className={styles.title}>{t("title")}</h1>
          </div>
          <Suspense loadingType="ecg" loadingText={t("loading")} loadingSize="medium">
            <CertificateApplyForm onSubmit={onSubmit} onSubmitError={onSubmitError} isPending={isPending} />
          </Suspense>
        </div>
      </div>
    </FormProvider>
  );
});

CertAddPage.displayName = "CertAddPage";

export default CertAddPage;

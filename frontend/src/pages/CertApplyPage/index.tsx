import { memo } from "react";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { BackButton } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { useInitApplyCertificateForm, useSubmitApplyCertificate } from "@/elements/certificate";

import { ApplyForm } from "./components";
import styles from "./styles.module.css";

const CertApplyPage = memo(() => {
  const { t } = useTranslation("certApply");

  const methods = useInitApplyCertificateForm();
  const { onSubmit, onSubmitError, isPending } = useSubmitApplyCertificate();

  const handleBack = () => routerEventEmitter.navigateBack();

  return (
    <FormProvider {...methods}>
      <div className={styles.page}>
        <div className={styles.header}>
          <BackButton onClick={handleBack} className={styles.backBtn} />
          <h1 className={styles.title}>{t("apply.title") || "申请 Let's Encrypt 证书"}</h1>
        </div>

        <div className={styles.content}>
          <div className={styles.rightColumn}>
            <ApplyForm onSubmit={onSubmit} onSubmitError={onSubmitError} isPending={isPending} />
          </div>
        </div>
      </div>
    </FormProvider>
  );
});

CertApplyPage.displayName = "CertApplyPage";

export default CertApplyPage;


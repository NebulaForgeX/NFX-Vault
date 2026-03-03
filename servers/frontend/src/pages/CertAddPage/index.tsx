import { memo } from "react";
import { ArrowLeft } from "@/assets/icons/lucide";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { useInitCertificateForm, useSubmitCertificate } from "@/elements/certificate";

import { CertForm } from "./components";
import styles from "./styles.module.css";

const CertAddPage = memo(() => {
  const { t } = useTranslation("certAdd");

  const methods = useInitCertificateForm();
  const { onSubmit, onSubmitError, isPending } = useSubmitCertificate();

  const handleBack = () => routerEventEmitter.navigateBack();

  return (
    <FormProvider {...methods}>
      <div className={styles.page}>
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>{t("title") || "创建新证书"}</h1>
        </div>

        <div className={styles.content}>
          <div className={styles.rightColumn}>
            <CertForm onSubmit={onSubmit} onSubmitError={onSubmitError} isPending={isPending} />
          </div>
        </div>
      </div>
    </FormProvider>
  );
});

CertAddPage.displayName = "CertAddPage";

export default CertAddPage;


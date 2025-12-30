import { memo } from "react";
import { ArrowLeft } from "@/assets/icons/lucide";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useInitCertificateForm, useSubmitCertificate } from "@/elements/certificate";

import { CertForm } from "./components";
import styles from "./styles.module.css";

const CertAddPage = memo(() => {
  const { t } = useTranslation("cert");
  const navigate = useNavigate();

  // Form setup
  const methods = useInitCertificateForm();
  const { onSubmit, onSubmitError, isPending } = useSubmitCertificate();

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
          <h1 className={styles.title}>{t("form.title") || "创建新证书"}</h1>
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


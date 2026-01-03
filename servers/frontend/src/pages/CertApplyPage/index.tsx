import { memo } from "react";
import { ArrowLeft } from "@/assets/icons/lucide";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "node_modules/react-i18next";

import { useInitApplyCertificateForm, useSubmitApplyCertificate } from "@/elements/certificate";

import { ApplyForm } from "./components";
import styles from "./styles.module.css";

const CertApplyPage = memo(() => {
  const { t } = useTranslation("certApply");
  const navigate = useNavigate();

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


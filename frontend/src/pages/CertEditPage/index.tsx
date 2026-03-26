import { memo } from "react";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ArrowLeft } from "@/assets/icons/lucide";
import { Suspense } from "nfx-ui/components";
import { routerEventEmitter } from "@/events/router";
import { CertificateEditForm, useInitCertificateForm, useEditCertificate } from "@/elements/certificate";
import { useCertificateDetailById } from "@/hooks";

import styles from "./styles.module.css";

const CertEditPageContent = memo(({ certificateId }: { certificateId: string }) => {
  const { t } = useTranslation("certEdit");

  const { data: certificate } = useCertificateDetailById(certificateId);
  const methods = useInitCertificateForm(certificate);
  const { onSubmit, onSubmitError, isPending } = useEditCertificate(certificateId);

  const handleBack = () => routerEventEmitter.navigateBack();

  return (
    <FormProvider {...methods}>
      <div className={styles.page}>
        <div className={styles.main}>
          <div className={styles.header}>
            <button type="button" onClick={handleBack} className={styles.backBtn} aria-label={t("title")}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={styles.title}>
                {t("title")} — {certificate.domain}
              </h1>
              <p className={styles.subtitle}>{t("subtitle")}</p>
            </div>
          </div>
          <CertificateEditForm onSubmit={onSubmit} onSubmitError={onSubmitError} isPending={isPending} />
        </div>
      </div>
    </FormProvider>
  );
});

CertEditPageContent.displayName = "CertEditPageContent";

export default function CertEditPage() {
  const { t } = useTranslation("certEdit");
  const { certificateId } = useParams<{ certificateId: string }>();

  if (!certificateId) {
    routerEventEmitter.navigateBack();
    return null;
  }

  return (
    <Suspense loadingType="ecg" loadingText={t("loading")} loadingSize="medium">
      <CertEditPageContent certificateId={certificateId} />
    </Suspense>
  );
}

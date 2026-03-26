import type { FieldErrors } from "react-hook-form";
import type { EditCertificateFormValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "nfx-ui/components";

import {
  DomainController,
  EmailControllerForAdd,
  FolderNameController,
  IssuerController,
  SANsController,
} from "../../controllers";

import styles from "./styles.module.css";

export interface CertificateEditFormProps {
  onSubmit: (data: EditCertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<EditCertificateFormValues>) => void;
  isPending: boolean;
}

const CertificateEditForm = memo(({ onSubmit, onSubmitError, isPending }: CertificateEditFormProps) => {
  const { t } = useTranslation("certificateElements");
  const methods = useFormContext<EditCertificateFormValues>();

  return (
    <div className={styles.root}>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("form.basicInfo")}</h3>
          <div className={styles.basicInfoGrid}>
            <div className={styles.leftColumn}>
              <DomainController />
              <FolderNameController />
              <EmailControllerForAdd requireEmail={false} />
              <IssuerController />
            </div>
          </div>
          <SANsController />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            size="large"
            className={styles.submitBtn}
            disabled={isPending}
            onClick={methods.handleSubmit(onSubmit, onSubmitError)}
          >
            {isPending ? t("form.updating") : t("form.update")}
          </Button>
        </div>
      </form>
    </div>
  );
});

CertificateEditForm.displayName = "CertificateEditForm";

export default CertificateEditForm;

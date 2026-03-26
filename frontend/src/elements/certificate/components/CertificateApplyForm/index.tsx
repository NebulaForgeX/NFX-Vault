import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../../schemas/certificateSchema";

import { memo, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "nfx-ui/components";

import {
  DomainController,
  EmailControllerForAdd,
  FolderNameController,
  ForceRenewalController,
  IssuerController,
  SANsController,
  WebrootController,
} from "../../controllers";
import { useParseCertificatePreview } from "@/hooks";
import { showError, showSuccess } from "@/stores/modalStore";

import styles from "./styles.module.css";

export interface CertificateApplyFormProps {
  onSubmit: (data: CertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<CertificateFormValues>) => void;
  isPending: boolean;
}

const CertificateApplyForm = memo(({ onSubmit, onSubmitError, isPending }: CertificateApplyFormProps) => {
  const { t } = useTranslation("certificateElements");
  const methods = useFormContext<CertificateFormValues>();
  const certFileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: parsePreview, isPending: parsing } = useParseCertificatePreview();

  const handleCertFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const text = await file.text();
        const r = await parsePreview({ certificate: text.trim() });
        if (!r.success) {
          showError(r.message || t("upload.parseFailed"));
          return;
        }
        if (r.domain) methods.setValue("domain", r.domain, { shouldValidate: true });
        if (r.sans?.length) {
          const primary = (r.domain || "").trim().toLowerCase();
          const filtered = r.sans.map((s) => s.trim()).filter(Boolean);
          const dedup = primary ? filtered.filter((s) => s.toLowerCase() !== primary) : filtered;
          methods.setValue("sans", dedup, { shouldValidate: true });
        }
        if (r.issuer) methods.setValue("issuer", r.issuer, { shouldValidate: true });
        showSuccess(t("upload.parseOk"));
      } catch {
        showError(t("upload.parseFailed"));
      }
    },
    [methods, parsePreview, t],
  );

  return (
    <div className={styles.root}>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("form.sectionImport")}</h3>
          <p className={styles.sectionHint}>{t("form.sectionImportHint")}</p>
          <div className={styles.uploadRow}>
            <input
              ref={certFileRef}
              type="file"
              accept=".pem,.crt,.cer,.txt"
              className={styles.hiddenFile}
              onChange={handleCertFile}
            />
            <Button type="button" variant="outline" disabled={parsing} onClick={() => certFileRef.current?.click()}>
              {parsing ? t("upload.parsing") : t("upload.certPemParseOnly")}
            </Button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("form.basicInfo")}</h3>
          <div className={styles.basicInfoGrid}>
            <div className={styles.leftColumn}>
              <DomainController />
              <FolderNameController />
              <EmailControllerForAdd requireEmail />
              <IssuerController />
            </div>
          </div>
          <SANsController />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("form.verification")}</h3>
          <WebrootController />
          <ForceRenewalController />
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
            {isPending ? t("form.applySubmitting") : t("form.applySubmit")}
          </Button>
        </div>
      </form>
    </div>
  );
});

CertificateApplyForm.displayName = "CertificateApplyForm";

export default CertificateApplyForm;

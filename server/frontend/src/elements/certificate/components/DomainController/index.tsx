import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import styles from "./styles.module.css";

const DomainController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.domain")} <span className={styles.required}>*</span>
      </label>
      <Input
        {...register("domain")}
        type="text"
        placeholder={t("form.domainPlaceholder")}
        error={!!errors.domain}
      />
      {errors.domain && <p className={styles.errorMessage}>{errors.domain.message}</p>}
    </div>
  );
});

DomainController.displayName = "DomainController";

export default DomainController;


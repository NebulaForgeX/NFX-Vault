import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

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
        {t("form.domain") || "域名"} <span className={styles.required}>*</span>
      </label>
      <input
        {...register("domain")}
        type="text"
        placeholder={t("form.domainPlaceholder") || "例如：example.com"}
        className={`${styles.input} ${errors.domain ? styles.inputError : ""}`}
      />
      {errors.domain && <p className={styles.errorMessage}>{errors.domain.message}</p>}
    </div>
  );
});

DomainController.displayName = "DomainController";

export default DomainController;


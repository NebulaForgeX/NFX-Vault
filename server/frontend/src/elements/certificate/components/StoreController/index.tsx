import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.css";

const StoreController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.store") || "证书类型"} <span className={styles.required}>*</span>
      </label>
      <select
        {...register("store")}
        className={`${styles.select} ${errors.store ? styles.inputError : ""}`}
      >
        <option value="database">{t("certType.database") || "Database"}</option>
        <option value="websites">{t("certType.websites")}</option>
        <option value="apis">{t("certType.apis")}</option>
      </select>
      {errors.store && <p className={styles.errorMessage}>{errors.store.message}</p>}
    </div>
  );
});

StoreController.displayName = "StoreController";

export default StoreController;


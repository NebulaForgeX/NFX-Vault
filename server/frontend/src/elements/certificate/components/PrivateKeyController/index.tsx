import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.css";

const PrivateKeyController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.privateKey") || "私钥内容"} <span className={styles.required}>*</span>
      </label>
      <textarea
        {...register("privateKey")}
        placeholder={t("form.privateKeyPlaceholder") || "请输入PEM格式的私钥内容"}
        className={`${styles.textarea} ${errors.privateKey ? styles.inputError : ""}`}
        rows={10}
      />
      {errors.privateKey && <p className={styles.errorMessage}>{errors.privateKey.message}</p>}
    </div>
  );
});

PrivateKeyController.displayName = "PrivateKeyController";

export default PrivateKeyController;


import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "node_modules/react-i18next";
import { Upload } from "@/assets/icons/lucide";

import styles from "./styles.module.css";

const PrivateKeyController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  const privateKeyValue = watch("privateKey");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setValue("privateKey", content, { shouldValidate: true });
      };
      reader.readAsText(file);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = "";
  };

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.privateKey")} <span className={styles.required}>*</span>
      </label>
      <div className={styles.uploadArea}>
        <label className={styles.uploadLabel}>
          <Upload size={20} />
          <span>{t("form.uploadPrivateKey")}</span>
          <input
            type="file"
            accept=".key,.pem"
            onChange={handleFileUpload}
            className={styles.fileInput}
          />
        </label>
      </div>
      <textarea
        {...register("privateKey")}
        placeholder={t("form.privateKeyPlaceholder")}
        className={`${styles.textarea} ${errors.privateKey ? styles.inputError : ""}`}
        rows={10}
        value={privateKeyValue || ""}
      />
      {errors.privateKey && <p className={styles.errorMessage}>{errors.privateKey.message}</p>}
    </div>
  );
});

PrivateKeyController.displayName = "PrivateKeyController";

export default PrivateKeyController;


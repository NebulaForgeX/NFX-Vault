import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import styles from "../DomainController/styles.module.css";

const FolderNameController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.folderName")}
      </label>
      <Input
        {...register("folderName")}
        type="text"
        placeholder={t("form.folderNamePlaceholder")}
        error={!!errors.folderName}
      />
      {errors.folderName && <p className={styles.errorMessage}>{errors.folderName.message}</p>}
      <p className={styles.helpText}>
        {t("form.folderNameHelp")}
      </p>
    </div>
  );
});

FolderNameController.displayName = "FolderNameController";

export default FolderNameController;


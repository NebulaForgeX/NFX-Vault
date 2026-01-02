import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo, useMemo } from "react";
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

  const folderNameRegister = useMemo(
    () => register("folderName"),
    [register]
  );

  const displayError = errors.folderName?.message;
  const hasError = !!displayError;

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.folderName")}
      </label>
      <Input
        {...folderNameRegister}
        type="text"
        placeholder={t("form.folderNamePlaceholder")}
        error={hasError}
      />
      {displayError && <p className={styles.errorMessage}>{displayError}</p>}
      {!displayError && (
        <p className={styles.helpText}>
          {t("form.folderNameHelp")}
        </p>
      )}
    </div>
  );
});

FolderNameController.displayName = "FolderNameController";

export default FolderNameController;

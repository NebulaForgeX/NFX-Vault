import type { ApplyCertificateFormValues } from "../../controllers/applyCertificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import styles from "./styles.module.css";

interface WebrootControllerProps {
  disabled?: boolean;
}

const WebrootController = memo(({ disabled = false }: WebrootControllerProps) => {
  const { t } = useTranslation("certificateElements");
  const { register } = useFormContext<ApplyCertificateFormValues>();

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{t("form.verification")}</h3>
      <div className={styles.optionsGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t("form.webroot")}</label>
          <Input
            {...register("webroot")}
            type="text"
            placeholder={t("form.webrootPlaceholder")}
            disabled={disabled}
          />
          <p className={styles.helpText}>
            {t("form.webrootHelp")}
          </p>
        </div>
      </div>
    </div>
  );
});

WebrootController.displayName = "WebrootController";

export default WebrootController;


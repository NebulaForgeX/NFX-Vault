import type { ApplyCertificateFormValues } from "../../controllers/applyCertificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "@/assets/icons/lucide";

import { showInfo } from "@/stores/modalStore";
import styles from "./styles.module.css";

const ForceRenewalController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const { watch, setValue } = useFormContext<ApplyCertificateFormValues>();
  
  const forceRenewal = watch("forceRenewal") || false;

  const handleShowRateLimitInfo = () => {
    showInfo(
      t("form.rateLimitInfo"),
      t("form.rateLimitTitle")
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.forceRenewalContainer}>
        <button
          type="button"
          className={styles.warningButton}
          onClick={handleShowRateLimitInfo}
          title={t("form.rateLimitTitle")}
        >
          <AlertTriangle size={18} />
        </button>
        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={forceRenewal}
            onChange={(e) => setValue("forceRenewal", e.target.checked)}
            className={styles.switch}
          />
          <span className={styles.switchText}>
            {t("form.forceRenewal")}
          </span>
        </label>
      </div>
      <p className={styles.helpText}>
        {t("form.forceRenewalHelp")}
      </p>
    </div>
  );
});

ForceRenewalController.displayName = "ForceRenewalController";

export default ForceRenewalController;


import type { FieldErrors } from "react-hook-form";
import type { ApplyCertificateFormValues } from "@/elements/certificate/controllers/applyCertificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "node_modules/react-i18next";

import { Input } from "@/components";
import { ForceRenewalController, SANsController, WebrootController } from "@/elements/certificate/components";
import styles from "./styles.module.css";

interface AutoFormProps {
  onSubmit: (data: ApplyCertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<ApplyCertificateFormValues>) => void;
  isPending: boolean;
}

/**
 * AUTO 源证书重新申请表单 - domain和folderName不可编辑，其他可编辑
 */
const AutoForm = memo(({ onSubmit, onSubmitError, isPending }: AutoFormProps) => {
  const { t } = useTranslation("certEditApply");
  const methods = useFormContext<ApplyCertificateFormValues>();
  const { watch, handleSubmit, formState: { errors } } = methods;
  
  const domain = watch("domain");
  const folderName = watch("folderName");

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {t("form.reapplyTitle")} - {t("form.autoSource")}
        </h2>
        <p className={styles.description}>
          {t("form.autoReapplyDescription")}
        </p>

        <form
          onSubmit={handleSubmit(onSubmit, onSubmitError)}
          className={styles.form}
        >
          {/* Basic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.basicInfo")}</h3>
            <div className={styles.basicInfoGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("form.domain")}</label>
                <Input
                  type="text"
                  value={domain || ""}
                  disabled
                />
                <p className={styles.helpText}>
                  {t("form.domainReadOnly")}
                </p>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("form.folderName")}</label>
                <Input
                  type="text"
                  value={folderName || ""}
                  disabled
                />
                <p className={styles.helpText}>
                  {t("form.folderNameReadOnly")}
                </p>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t("form.email")} <span className={styles.required}>*</span>
                </label>
                <Input
                  {...methods.register("email", {
                    required: t("validation.emailRequired", { ns: "common" }),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t("validation.emailInvalid", { ns: "common" })
                    }
                  })}
                  type="email"
                  placeholder={t("form.emailPlaceholder")}
                  error={!!errors.email}
                />
                {errors.email && (
                  <p className={styles.errorText}>{errors.email.message}</p>
                )}
                <p className={styles.helpText}>
                  {t("form.emailHelp")}
                </p>
              </div>
            </div>
          </div>

          {/* SANs */}
          <SANsController />

          {/* Verification Options */}
          <WebrootController />

          {/* Force Renewal Option */}
          <ForceRenewalController />

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isPending}
            >
              {isPending ? t("form.reapplying") : t("form.reapply")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

AutoForm.displayName = "AutoForm";

export default AutoForm;


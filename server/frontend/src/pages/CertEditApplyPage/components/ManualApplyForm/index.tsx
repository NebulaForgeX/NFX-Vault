import type { FieldErrors } from "react-hook-form";
import type { ApplyCertificateFormValues } from "@/elements/certificate/controllers/applyCertificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import { ForceRenewalController, SANsController, WebrootController } from "@/elements/certificate/components";
import styles from "./styles.module.css";

interface ManualApplyFormProps {
  onSubmit: (data: ApplyCertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<ApplyCertificateFormValues>) => void;
  isPending: boolean;
}

/**
 * MANUAL_APPLY 源证书重新申请表单 - 所有字段可编辑
 */
const ManualApplyForm = memo(({ onSubmit, onSubmitError, isPending }: ManualApplyFormProps) => {
  const { t } = useTranslation("certEditApply");
  const methods = useFormContext<ApplyCertificateFormValues>();
  const { handleSubmit, formState: { errors } } = methods;

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {t("form.reapplyTitle")} - {t("form.manualApplySource")}
        </h2>
        <p className={styles.description}>
          {t("form.manualApplyReapplyDescription")}
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
                <label className={styles.label}>
                  {t("form.domain")} <span className={styles.required}>*</span>
                </label>
                <Input
                  {...methods.register("domain", {
                    required: t("validation.domainRequired", { ns: "common" }),
                  })}
                  type="text"
                  placeholder={t("form.domainPlaceholder")}
                  error={!!errors.domain}
                />
                {errors.domain && (
                  <p className={styles.errorText}>{errors.domain.message}</p>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t("form.folderName")} <span className={styles.required}>*</span>
                </label>
                <Input
                  {...methods.register("folderName", {
                    required: t("validation.folderNameRequired", { ns: "common" }),
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: t("validation.folderNameInvalid", { ns: "common" })
                    }
                  })}
                  type="text"
                  placeholder={t("form.folderNamePlaceholder")}
                  error={!!errors.folderName}
                />
                {errors.folderName && (
                  <p className={styles.errorText}>{errors.folderName.message}</p>
                )}
                <p className={styles.helpText}>
                  {t("form.folderNameHelp")}
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

ManualApplyForm.displayName = "ManualApplyForm";

export default ManualApplyForm;


import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "@/elements/certificate/controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "node_modules/react-i18next";

import {
  StoreController,
  DomainController,
  FolderNameController,
  EmailControllerForAdd,
  CertificateController,
  PrivateKeyController,
} from "@/elements/certificate/components";

import styles from "./styles.module.css";

interface ManualAddFormProps {
  onSubmit: (data: CertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<CertificateFormValues>) => void;
  isPending: boolean;
}

/**
 * MANUAL_ADD 源证书表单 - 所有字段都可以编辑
 */
const ManualAddForm = memo(({ onSubmit, onSubmitError, isPending }: ManualAddFormProps) => {
  const { t } = useTranslation("certEdit");
  const methods = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {t("form.editTitle") || "编辑证书"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={styles.form}
        >
          {/* Basic Information - 所有字段可编辑 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.basicInfo") || "基本信息"}</h3>
            <div className={styles.basicInfoGrid}>
              <StoreController />
              <DomainController />
              <FolderNameController />
              <EmailControllerForAdd />
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("form.source") || "来源"}</label>
                <span className={styles.sourceBadge}>
                  {t("source.manual_add") || "Manual Add"}
                </span>
              </div>
            </div>
          </div>

          {/* Certificate Content - 可编辑 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.certificate") || "证书内容"}</h3>
            <CertificateController />
          </div>

          {/* Private Key - 可编辑 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.privateKey") || "私钥内容"}</h3>
            <PrivateKeyController />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.submitBtn}
              disabled={isPending}
              onClick={methods.handleSubmit(onSubmit, onSubmitError)}
            >
              {isPending
                ? (t("form.updating") || "更新中...")
                : (t("form.update") || "更新证书")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ManualAddForm.displayName = "ManualAddForm";

export default ManualAddForm;


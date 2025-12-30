import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "@/elements/certificate/controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import { StoreController } from "@/elements/certificate/components";
import styles from "./styles.module.css";

interface ManualApplyFormProps {
  onSubmit: (data: CertificateFormValues) => Promise<void>;
  onSubmitError?: (errors: FieldErrors<CertificateFormValues>) => void;
  isPending: boolean;
}

/**
 * MANUAL_APPLY 源证书表单 - 可以编辑 folderName 和 store
 */
const ManualApplyForm = memo(({ onSubmit, isPending }: ManualApplyFormProps) => {
  const { t } = useTranslation("certEdit");
  const methods = useFormContext<CertificateFormValues>();
  const { watch, handleSubmit, formState: { errors } } = methods;
  
  const domain = watch("domain");
  const certificate = watch("certificate");
  const privateKey = watch("privateKey");

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {t("form.editTitle") || "编辑证书"}
        </h2>
        <p className={styles.description}>
          {t("form.manualApplyEditable") || "手动申请的证书可以编辑文件夹名称和证书类型"}
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
        >
          {/* Basic Information - folderName 和 store 可编辑，其他只读 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.basicInfo") || "基本信息"}</h3>
            <div className={styles.basicInfoGrid}>
              {/* folderName 字段 - 可编辑 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t("form.folderName") || "文件夹名称"} <span className={styles.required}>*</span>
                </label>
                <Input
                  {...methods.register("folderName", {
                    required: "请输入文件夹名称",
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: "文件夹名称只能包含字母、数字、下划线和连字符"
                    }
                  })}
                  type="text"
                  placeholder={t("form.folderNamePlaceholder") || "例如: api_lucaslyu_com"}
                  error={!!errors.folderName}
                />
                {errors.folderName && (
                  <p className={styles.errorText}>{errors.folderName.message}</p>
                )}
                <p className={styles.helpText}>
                  {t("form.folderNameHelp") || "唯一标识符，只能包含字母、数字、下划线和连字符"}
                </p>
              </div>
              {/* store 字段 - 可编辑 */}
              <div className={styles.formGroup}>
                <StoreController />
              </div>
              {/* domain 字段 - 只读 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("form.domain") || "域名"}</label>
                <Input
                  type="text"
                  value={domain || ""}
                  disabled
                />
              </div>
              {/* source 字段 - 只读 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("form.source") || "来源"}</label>
                <span className={styles.sourceBadge}>
                  {t("source.manual_apply") || "Manual Apply"}
                </span>
              </div>
            </div>
          </div>

          {/* Certificate Content - 只读 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.certificate") || "证书内容"}</h3>
            <textarea
              value={certificate || ""}
              disabled
              rows={10}
              className={styles.textarea}
            />
          </div>

          {/* Private Key - 只读 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.privateKey") || "私钥内容"}</h3>
            <textarea
              value={privateKey || ""}
              disabled
              rows={10}
              className={styles.textarea}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isPending}
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

ManualApplyForm.displayName = "ManualApplyForm";

export default ManualApplyForm;

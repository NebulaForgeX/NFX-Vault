import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "@/elements/certificate/controllers/certificateSchema";

import { memo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.css";

interface ManualApplyFormProps {
  onSubmit: (data: CertificateFormValues & { folder_name: string }) => Promise<void>;
  onSubmitError?: (errors: FieldErrors<CertificateFormValues>) => void;
  isPending: boolean;
}

/**
 * MANUAL_APPLY 源证书表单 - 只能编辑 folder_name
 */
const ManualApplyForm = memo(({ onSubmit, isPending }: ManualApplyFormProps) => {
  const { t } = useTranslation("certEdit");
  const methods = useFormContext<CertificateFormValues>();
  const { watch, getValues } = methods;
  
  const store = watch("store");
  const domain = watch("domain");
  const certificate = watch("certificate");
  const privateKey = watch("privateKey");
  
  // 使用独立的 state 管理 folder_name（不在 schema 中）
  const [folderName, setFolderName] = useState<string>("");
  const [folderNameError, setFolderNameError] = useState<string>("");
  
  // 验证 folder_name
  const validateFolderName = (value: string): string => {
    if (!value.trim()) {
      return "请输入文件夹名称";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return "文件夹名称只能包含字母、数字、下划线和连字符";
    }
    return "";
  };
  
  const handleFolderNameChange = (value: string) => {
    setFolderName(value);
    setFolderNameError(validateFolderName(value));
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateFolderName(folderName);
    if (error) {
      setFolderNameError(error);
      return;
    }
    
    // 合并 folder_name 到表单数据中
    const formData = getValues();
    await onSubmit({
      ...formData,
      folder_name: folderName
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {t("form.editTitle") || "编辑证书"}
        </h2>
        <p className={styles.description}>
          {t("form.manualApplyEditable") || "手动申请的证书只能编辑文件夹名称"}
        </p>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          {/* Basic Information - folder_name 可编辑，其他只读 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.basicInfo") || "基本信息"}</h3>
            <div className={styles.basicInfoGrid}>
              <div className={styles.leftColumn}>
                {/* folder_name 字段 - 可编辑 */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {t("form.folderName") || "文件夹名称"} <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => handleFolderNameChange(e.target.value)}
                    placeholder={t("form.folderNamePlaceholder") || "例如: api_lucaslyu_com"}
                    className={`${styles.input} ${folderNameError ? styles.inputError : ""}`}
                  />
                  {folderNameError && (
                    <p className={styles.errorText}>{folderNameError}</p>
                  )}
                  <p className={styles.helpText}>
                    {t("form.folderNameHelp") || "唯一标识符，只能包含字母、数字、下划线和连字符"}
                  </p>
                </div>
                {/* store 字段 - 只读 */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("form.store") || "证书类型"}</label>
                  <input
                    type="text"
                    value={store || ""}
                    disabled
                    className={`${styles.input} ${styles.inputDisabled}`}
                  />
                </div>
                {/* domain 字段 - 只读 */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("form.domain") || "域名"}</label>
                  <input
                    type="text"
                    value={domain || ""}
                    disabled
                    className={`${styles.input} ${styles.inputDisabled}`}
                  />
                </div>
                {/* source 字段 - 只读 */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("form.source") || "来源"}</label>
                  <input
                    type="text"
                    value={t("source.manual_apply") || "Manual Apply"}
                    disabled
                    className={`${styles.input} ${styles.inputDisabled}`}
                  />
                </div>
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
              disabled={isPending || !!folderNameError}
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

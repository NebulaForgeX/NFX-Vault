import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "@/elements/certificate/controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.css";

interface AutoFormProps {
  onSubmit: (data: CertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<CertificateFormValues>) => void;
  isPending: boolean;
}

/**
 * AUTO 源证书表单 - 所有字段都不可编辑（只读模式）
 */
const AutoForm = memo(({ }: AutoFormProps) => {
  const { t } = useTranslation("certEdit");
  const { watch } = useFormContext<CertificateFormValues>();
  
  const store = watch("store");
  const domain = watch("domain");
  const certificate = watch("certificate");
  const privateKey = watch("privateKey");

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {t("form.editTitle") || "编辑证书"} - {t("form.readOnly") || "（只读）"}
        </h2>
        <p className={styles.description}>
          {t("form.autoNotEditable") || "自动发现的证书无法手动编辑，请通过刷新文件夹来更新"}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={styles.form}
        >
          {/* Basic Information - 只读 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.basicInfo") || "基本信息"}</h3>
            <div className={styles.basicInfoGrid}>
              <div className={styles.leftColumn}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("form.store") || "证书类型"}</label>
                  <input
                    type="text"
                    value={store || ""}
                    disabled
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("form.domain") || "域名"}</label>
                  <input
                    type="text"
                    value={domain || ""}
                    disabled
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t("form.source") || "来源"}</label>
                  <input
                    type="text"
                    value={t("source.auto") || "Auto"}
                    disabled
                    className={styles.input}
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
              type="button"
              className={styles.submitBtn}
              disabled
            >
              {t("form.readOnly") || "只读模式"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

AutoForm.displayName = "AutoForm";

export default AutoForm;


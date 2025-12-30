import type { FieldErrors } from "react-hook-form";
import type { ApplyCertificateFormValues } from "@/elements/certificate/controllers/applyCertificateSchema";

import { memo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { DomainController, EmailController } from "@/elements/certificate/components";

import styles from "./styles.module.css";

interface ApplyFormProps {
  onSubmit: (data: ApplyCertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<ApplyCertificateFormValues>) => void;
  isPending: boolean;
}

const ApplyForm = memo(({ onSubmit, onSubmitError, isPending }: ApplyFormProps) => {
  const { t } = useTranslation("cert");
  const methods = useFormContext<ApplyCertificateFormValues>();

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>{t("apply.title") || "申请 Let's Encrypt 证书"}</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={styles.form}
        >
          {/* Basic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("apply.basicInfo") || "基本信息"}</h3>
            <div className={styles.basicInfoGrid}>
              <div className={styles.leftColumn}>
                <DomainController />
                <EmailController />
                <Controller
                  name="folder_name"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t("apply.folderName") || "文件夹名称"} *</label>
                      <input
                        {...field}
                        type="text"
                        placeholder={t("apply.folderNamePlaceholder") || "例如: api_lucaslyu_com"}
                        className={`${styles.input} ${fieldState.error ? styles.inputError : ""}`}
                      />
                      {fieldState.error && (
                        <p className={styles.errorText}>{fieldState.error.message}</p>
                      )}
                      <p className={styles.helpText}>
                        {t("apply.folderNameHelp") || "唯一标识符，只能包含字母、数字、下划线和连字符"}
                      </p>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* SANs */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("apply.sans") || "SANs (可选)"}</h3>
            <Controller
              name="sans"
              control={methods.control}
              render={({ field }) => (
                <div className={styles.sansContainer}>
                  <textarea
                    {...field}
                    value={field.value?.join("\n") || ""}
                    onChange={(e) => {
                      const lines = e.target.value.split("\n").filter((line) => line.trim());
                      field.onChange(lines);
                    }}
                    placeholder={t("apply.sansPlaceholder") || "每行一个域名，例如：\nwww.example.com\napi.example.com"}
                    className={styles.textarea}
                    rows={5}
                  />
                  <p className={styles.helpText}>{t("apply.sansHelp") || "每行输入一个域名，留空则只申请主域名"}</p>
                </div>
              )}
            />
          </div>

          {/* Verification Options */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("apply.verification") || "验证选项"}</h3>
            <div className={styles.optionsGrid}>
              <Controller
                name="webroot"
                control={methods.control}
                render={({ field }) => (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("apply.webroot") || "Webroot 路径"}</label>
                    <input
                      {...field}
                      type="text"
                      placeholder={t("apply.webrootPlaceholder") || "/var/www/html"}
                      className={styles.input}
                    />
                    <p className={styles.helpText}>{t("apply.webrootHelp") || "用于 HTTP-01 验证的 Web 根目录路径，留空使用默认路径"}</p>
                  </div>
                )}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.submitBtn}
              disabled={isPending}
              onClick={methods.handleSubmit(onSubmit, onSubmitError)}
            >
              {isPending ? (t("apply.applying") || "申请中...") : (t("apply.submit") || "申请证书")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ApplyForm.displayName = "ApplyForm";

export default ApplyForm;


import type { FieldErrors } from "react-hook-form";
import type { ApplyCertificateFormValues } from "@/elements/certificate/controllers/applyCertificateSchema";

import { memo, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { DomainController, EmailController } from "@/elements/certificate/components";

import styles from "./styles.module.css";

interface EditApplyFormProps {
  onSubmit: (data: ApplyCertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<ApplyCertificateFormValues>) => void;
  isPending: boolean;
  domain: string;
}

const EditApplyForm = memo(({ onSubmit, onSubmitError, isPending, domain }: EditApplyFormProps) => {
  const { t } = useTranslation("certEditApply");
  const methods = useFormContext<ApplyCertificateFormValues>();

  // 初始化域名和邮箱（从现有证书中获取）
  useEffect(() => {
    methods.setValue("domain", domain);
    // 邮箱需要从现有证书中获取，这里先留空，用户需要重新填写
  }, [domain, methods]);

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={styles.form}
        >
          {/* Basic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("basicInfo") || "基本信息"}</h3>
            <div className={styles.basicInfoGrid}>
              <div className={styles.leftColumn}>
                <Controller
                  name="folder_name"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t("folderName") || "文件夹名称"} *</label>
                      <input
                        {...field}
                        type="text"
                        placeholder={t("folderNamePlaceholder") || "例如: api_lucaslyu_com"}
                        className={`${styles.input} ${error ? styles.inputError : ""}`}
                      />
                      {error && (
                        <p className={styles.errorText}>{error.message}</p>
                      )}
                      <p className={styles.helpText}>
                        {t("folderNameHelp") || "唯一标识符，只能包含字母、数字、下划线和连字符"}
                      </p>
                    </div>
                  )}
                />
                <DomainController />
                <EmailController />
              </div>
            </div>
          </div>

          {/* SANs */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("sans") || "SANs (可选)"}</h3>
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
                    placeholder={t("sansPlaceholder") || "每行一个域名，例如：\nwww.example.com\napi.example.com"}
                    className={styles.textarea}
                    rows={5}
                  />
                  <p className={styles.helpText}>{t("sansHelp") || "每行输入一个域名，留空则只申请主域名"}</p>
                </div>
              )}
            />
          </div>

          {/* Verification Options */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("verification") || "验证选项"}</h3>
            <div className={styles.optionsGrid}>
              <Controller
                name="webroot"
                control={methods.control}
                render={({ field }) => (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("webroot") || "Webroot 路径"}</label>
                    <input
                      {...field}
                      type="text"
                      placeholder={t("webrootPlaceholder") || "/var/www/html"}
                      className={styles.input}
                    />
                    <p className={styles.helpText}>{t("webrootHelp") || "用于 HTTP-01 验证的 Web 根目录路径，留空使用默认路径"}</p>
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
              {isPending ? (t("applying") || "申请中...") : (t("submit") || "重新申请证书")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

EditApplyForm.displayName = "EditApplyForm";

export default EditApplyForm;


import { memo, useState, useCallback } from "react";
import { useTranslation } from "node_modules/react-i18next";
import { Link } from "react-router-dom";
import { Suspense } from "@/components";
import type { CertType } from "@/apis/domain";
import { ROUTES } from "@/types/navigation";
import { Plus, RefreshCw } from "@/assets/icons/lucide";
import { useInvalidateCache } from "@/hooks";
import { showError, showSuccess } from "@/stores/modalStore";
import { CertList } from "./components";
import styles from "./styles.module.css";

// 内部组件：实际渲染证书列表
const CertCheckPage = memo(() => {
  const { t } = useTranslation("certCheck");
  const [certType, setCertType] = useState<CertType>("websites");
  const invalidateCacheMutation = useInvalidateCache();

  const handleCertTypeChange = useCallback((newType: CertType) => {
    setCertType(newType);
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      const result = await invalidateCacheMutation.mutateAsync(certType);
      if (result.success) {
        showSuccess(result.message || t("refresh.success") || "Cache invalidated successfully");
      } else {
        showError(result.message || t("refresh.error") || "Failed to invalidate cache");
      }
    } catch (error: any) {
      showError(error?.message || t("refresh.error") || "Failed to invalidate cache");
    }
  }, [certType, invalidateCacheMutation, t]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleRefresh}
            disabled={invalidateCacheMutation.isPending}
            className={styles.refreshButton}
          >
            <RefreshCw size={20} className={invalidateCacheMutation.isPending ? styles.spinning : ""} />
            <span>
              {invalidateCacheMutation.isPending
                ? (t("actions.refreshing") || "Refreshing...")
                : (t("actions.refresh") || "Refresh")}
            </span>
          </button>
          <Link to={ROUTES.CERT_APPLY} className={styles.addButton}>
            <Plus size={20} />
            <span>{t("actions.apply") || "Apply Certificate"}</span>
          </Link>
          <Link to={ROUTES.CERT_ADD} className={styles.addButton}>
            <Plus size={20} />
            <span>{t("actions.add") || "Add Certificate"}</span>
          </Link>
        </div>
      </div>

      {/* 证书类型选择 */}
      <div className={styles.section}>
        <label className={styles.label}>{t("certType.label")}</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="websites"
              checked={certType === "websites"}
              onChange={(e) => handleCertTypeChange(e.target.value as CertType)}
              className={styles.radioInput}
            />
            <span>{t("certType.websites")}</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="apis"
              checked={certType === "apis"}
              onChange={(e) => handleCertTypeChange(e.target.value as CertType)}
              className={styles.radioInput}
            />
            <span>{t("certType.apis")}</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="database"
              checked={certType === "database"}
              onChange={(e) => handleCertTypeChange(e.target.value as CertType)}
              className={styles.radioInput}
            />
            <span>{t("certType.database")}</span>
          </label>
        </div>
      </div>

      {/* 证书列表 - 使用虚拟列表 */}
      <Suspense       
        loadingType="truck"
        loadingText={t("actions.checking") || "Checking certificates..."}
        loadingSize="medium"
      >
        <CertList certType={certType} />
      </Suspense>
    </div>
  );
});

CertCheckPage.displayName = "CertCheckPage";

export default CertCheckPage;


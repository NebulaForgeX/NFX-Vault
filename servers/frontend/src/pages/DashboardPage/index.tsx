import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components";
import { ROUTES } from "@/types/navigation";
import { useRefreshCertificates } from "@/hooks";
import { showSuccess, showError } from "@/stores/modalStore";
import type { CertType } from "@/types";
import styles from "./styles.module.css";

export default function DashboardPage() {
  const { t } = useTranslation("common");
  const { t: tCert } = useTranslation("certCheck");
  const [selectedCertType, setSelectedCertType] = useState<CertType>("websites");
  const refreshMutation = useRefreshCertificates();

  const handleRefresh = async () => {
    try {
      const result = await refreshMutation.mutateAsync(selectedCertType);
      if (result.success) {
        const message = result.processed !== undefined 
          ? `Successfully refreshed ${result.processed} certificates`
          : (result.message || t("refresh.success") || "Successfully refreshed certificates");
        showSuccess(message);
      } else {
        showError(result.message || t("refresh.error") || "Failed to refresh certificates");
      }
    } catch (error: any) {
      showError(error?.message || t("refresh.error") || "Failed to refresh certificates");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <img src="/logo.png" alt="Logo" className={styles.logo} />
          <h1 className={styles.title}>{t("title")}</h1>
        </div>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      {/* 刷新按钮区域 */}
      <div className={styles.refreshSection}>
        <div className={styles.refreshControls}>
          <label className={styles.label}>
            {t("refresh.certType") || "Certificate Type"}:
            <select
              value={selectedCertType}
              onChange={(e) => setSelectedCertType(e.target.value as CertType)}
              className={styles.select}
            >
              <option value="websites">{tCert("certType.websites")}</option>
              <option value="apis">{tCert("certType.apis")}</option>
            </select>
          </label>
          <Button
            onClick={handleRefresh}
            variant="primary"
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending 
              ? (t("refresh.refreshing") || "Refreshing...") 
              : (t("refresh.button") || "Refresh Certificates")}
          </Button>
        </div>
        <p className={styles.refreshDescription}>
          {t("refresh.description") || "Click to read acme.json files and update the certificate database"}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("certManagement.title")}</h2>
            <p className={styles.cardDescription}>
              {t("certManagement.description")}
            </p>
            <Link to={ROUTES.CHECK} className={styles.cardLink}>
              {t("certManagement.action")}
            </Link>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("quickCheck.title")}</h2>
            <p className={styles.cardDescription}>
              {t("quickCheck.description")}
            </p>
            <Link to={ROUTES.CHECK} className={styles.cardLink}>
              {t("quickCheck.action")}
            </Link>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("certExport.title")}</h2>
            <p className={styles.cardDescription}>
              {t("certExport.description")}
            </p>
            <Link to={ROUTES.CHECK} className={styles.cardLink}>
              {t("certExport.action")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


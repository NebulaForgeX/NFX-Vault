import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button, Suspense } from "nfx-ui/components";

import { Plus, RefreshCw } from "@/assets/icons/lucide";
import { useInvalidateCache } from "@/hooks";
import { ROUTES } from "@/navigations";
import { showError, showSuccess } from "@/stores/modalStore";

import { CertList } from "./components";
import styles from "./styles.module.css";

const CertCheckPage = memo(() => {
  const { t } = useTranslation("certCheck");
  const navigate = useNavigate();
  const invalidateCacheMutation = useInvalidateCache();

  const handleRefresh = useCallback(async () => {
    try {
      const result = await invalidateCacheMutation.mutateAsync();
      if (result.success) {
        showSuccess(result.message || t("refresh.success") || "Cache invalidated successfully");
      } else {
        showError(result.message || t("refresh.error") || "Failed to invalidate cache");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      showError(message || t("refresh.error") || "Failed to invalidate cache");
    }
  }, [invalidateCacheMutation, t]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={invalidateCacheMutation.isPending}
            leftIcon={<RefreshCw size={20} className={invalidateCacheMutation.isPending ? styles.spinning : undefined} />}
          >
            {invalidateCacheMutation.isPending
              ? (t("actions.refreshing") ?? "Refreshing...")
              : (t("actions.refresh") ?? "Refresh")}
          </Button>
          <Button variant="primary" leftIcon={<Plus size={20} />} onClick={() => navigate(ROUTES.CERT_ADD)}>
            {t("actions.add") ?? "Add Certificate"}
          </Button>
        </div>
      </div>

      <Suspense
        loadingType="truck"
        loadingText={t("actions.checking") ?? "Checking certificates..."}
        loadingSize="medium"
      >
        <CertList />
      </Suspense>
    </div>
  );
});

CertCheckPage.displayName = "CertCheckPage";

export default CertCheckPage;

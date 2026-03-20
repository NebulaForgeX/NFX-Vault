import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button, SlideDownSwitcher, Suspense } from "nfx-ui/components";

import type { CertType } from "@/types";
import { Plus, RefreshCw } from "@/assets/icons/lucide";
import { useInvalidateCache } from "@/hooks";
import { ROUTES } from "@/navigations";
import { showError, showSuccess } from "@/stores/modalStore";

import { CERT_TYPE_SEARCH_PARAM, getCertTypeFromSearchParams } from "@/utils/certCheckUrl";

import { CertList } from "./components";
import styles from "./styles.module.css";

const CERT_TYPES = ["websites", "apis", "database"] as const satisfies readonly CertType[];

const CertCheckPage = memo(() => {
  const { t } = useTranslation("certCheck");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const certType = useMemo(() => getCertTypeFromSearchParams(searchParams), [searchParams]);
  const invalidateCacheMutation = useInvalidateCache();

  const setCertType = useCallback(
    (v: CertType) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (v === "websites") next.delete(CERT_TYPE_SEARCH_PARAM);
          else next.set(CERT_TYPE_SEARCH_PARAM, v);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const getCertTypeLabel = useCallback(
    (v: CertType) => {
      if (v === "websites") return t("certType.websites");
      if (v === "apis") return t("certType.apis");
      return t("certType.database");
    },
    [t],
  );

  const certTypeOptions = useMemo(() => [...CERT_TYPES], []);

  const handleRefresh = useCallback(async () => {
    try {
      const result = await invalidateCacheMutation.mutateAsync(certType);
      if (result.success) {
        showSuccess(result.message || t("refresh.success") || "Cache invalidated successfully");
      } else {
        showError(result.message || t("refresh.error") || "Failed to invalidate cache");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      showError(message || t("refresh.error") || "Failed to invalidate cache");
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
          <Button
            variant="primary"
            leftIcon={<Plus size={20} />}
            onClick={() => navigate(ROUTES.CERT_APPLY)}
          >
            {t("actions.apply") ?? "Apply Certificate"}
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Plus size={20} />}
            onClick={() => navigate(ROUTES.CERT_ADD)}
          >
            {t("actions.add") ?? "Add Certificate"}
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>{t("certType.label")}</label>
        <div className={styles.switcherRow}>
          <SlideDownSwitcher<CertType>
            value={certType}
            options={certTypeOptions}
            getDisplayName={getCertTypeLabel}
            onChange={setCertType}
            status="default"
          />
        </div>
      </div>

      <Suspense
        loadingType="truck"
        loadingText={t("actions.checking") ?? "Checking certificates..."}
        loadingSize="medium"
      >
        <CertList certType={certType} />
      </Suspense>
    </div>
  );
});

CertCheckPage.displayName = "CertCheckPage";

export default CertCheckPage;

import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { VirtualWindowList } from "@/components";
import { useCertificateList } from "@/hooks";
import { certKeys } from "@/hooks/useCert";
import type { CertType } from "@/apis/domain";
import  CertCard  from "../CertCard";
import styles from "./styles.module.css";

interface CertListProps {
  certType: CertType;
}

const CertList = memo(({ certType }: CertListProps) => {
  const { t } = useTranslation("cert");
  
  const filter = useMemo(() => ({ certType }), [certType]);
  
  // Use infinite query hook for data fetching
  const {
    data: certificates = [],
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCertificateList(
    certKeys.list(certType),
    filter,
    { staleTime: 1000 * 60 * 5 } // 5 minutes
  );

  const emptyStateContent = useMemo(() => {
    return (
      <div className={styles.emptyState}>
        {t("certificate.empty")}
      </div>
    );
  }, [t]);

  const loadingIndicator = useMemo(() => {
    return (
      <div className={styles.loadingMore}>
        <div className={styles.spinner}></div>
        <span>{t("actions.loadingMore") || "Loading more certificates..."}</span>
      </div>
    );
  }, [t]);

  const endOfListIndicator = useMemo(() => {
    return (
      <div className={styles.endState}>
        <div className={styles.endLine}></div>
        <span className={styles.endText}>{t("certificate.allLoaded") || "All certificates loaded"}</span>
        <div className={styles.endLine}></div>
      </div>
    );
  }, [t]);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>
        {t("certificate.list")} ({certificates.length} {t("certificate.total") || "total"})
      </h2>
      <div className={styles.listContainer}>
        <VirtualWindowList
          data={certificates.filter((cert) => cert && cert.domain)}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          renderItem={(cert) => (
            <CertCard
              key={`${cert.domain}-${cert.source || "auto"}`}
              cert={cert}
              certType={certType}
            />
          )}
          estimateSize={200}
          getItemKey={(cert) => `${cert.domain}-${cert.source || "auto"}`}
          emptyState={emptyStateContent}
          loadingIndicator={loadingIndicator}
          endOfListIndicator={endOfListIndicator}
        />
      </div>
    </div>
  );
});

CertList.displayName = "CertList";

export default CertList;


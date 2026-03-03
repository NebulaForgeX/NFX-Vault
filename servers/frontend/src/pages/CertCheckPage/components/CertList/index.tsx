import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { VirtualWindowList } from "nfx-ui/components";
import { useCertificateList } from "@/hooks";
import type { CertType } from "@/types";
import  CertCard  from "../CertCard";
import styles from "./styles.module.css";

interface CertListProps {
  certType: CertType;
}

const CertList = memo(({ certType }: CertListProps) => {
  const { t } = useTranslation("certCheck");
  
  const filter = useMemo(() => ({ certType }), [certType]);

  const {
    data: certificates = [],
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCertificateList(filter, { staleTime: 1000 * 60 * 5 });

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
              key={cert.id || `${cert.domain}-${cert.source || "auto"}`}
              cert={cert}
            />
          )}
          estimateSize={200}
          getItemKey={(cert) => cert.id || `${cert.domain}-${cert.source || "auto"}`}
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


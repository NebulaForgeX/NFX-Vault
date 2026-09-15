import { memo, useMemo } from "react";
import { FileKey } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CardHeader, EmptyState } from "nfx-ui/components";
import { VirtualWindowList } from "@/components";
import { useCertificateList } from "@/hooks";
import CertCard from "../CertCard";
import styles from "./styles.module.css";

const CertList = memo(() => {
  const { t } = useTranslation("certCheck");

  const {
    data: certificates = [],
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCertificateList({ staleTime: 1000 * 60 * 5 });

  const emptyStateContent = useMemo(() => {
    return <EmptyState icon={FileKey} title={t("certificate.empty")} />;
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
      <CardHeader icon={<FileKey size={18} />} title={`${t("certificate.list")} (${certificates.length} ${t("certificate.total") || "total"})`} />
      <div className={styles.listContainer}>
        <VirtualWindowList
          data={certificates.filter((cert) => cert && cert.domain)}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          renderItem={(cert) => <CertCard key={cert.id || cert.domain} cert={cert} />}
          estimateSize={268}
          getItemKey={(cert) => cert.id || cert.domain}
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

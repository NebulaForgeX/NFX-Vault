import { memo, useMemo } from "react";
import { useTranslation } from "node_modules/react-i18next";
import { VirtualWindowList } from "@/components";
import { useSearchCertificateList, certKeys } from "@/hooks";
import { CertificateSource, type CertType } from "@/apis/domain";
import type { CertificateInfo } from "@/apis/domain";
import { ROUTES } from "@/types/navigation";
import { useCertificateSource } from "@/hooks";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

interface CertSearchListProps {
  keyword: string;
  store?: CertType;
  source?: CertificateSource;
}

const CertSearchCard = memo(({ cert }: { cert: CertificateInfo }) => {
  const { t } = useTranslation("certSearch");
  const navigate = useNavigate();
  const sourceInfo = useCertificateSource(cert.source);

  const handleClick = () => {
    if (!cert.id) {
      console.error("Certificate ID is required", cert);
      return;
    }
    navigate(ROUTES.CERT_DETAIL_PATH(cert.id));
  };

  return (
    <div className={styles.certCard} onClick={handleClick}>
      <div className={styles.certHeader}>
        <h3 className={styles.certDomain}>{cert.domain}</h3>
        {cert.source && (
          <span
            className={styles.sourceBadge}
            style={{ backgroundColor: sourceInfo.bgColor, color: sourceInfo.textColor }}
          >
            {sourceInfo.label}
          </span>
        )}
      </div>
      <div className={styles.certInfo}>
        {cert.folderName && (
          <div className={styles.certInfoItem}>
            <span className={styles.certInfoLabel}>{t("cert.folderName") || "文件夹"}:</span>
            <span className={styles.certInfoValue}>{cert.folderName}</span>
          </div>
        )}
        {cert.sans && cert.sans.length > 0 && (
          <div className={styles.certInfoItem}>
            <span className={styles.certInfoLabel}>{t("cert.sans") || "SANs"}:</span>
            <span className={styles.certInfoValue}>{cert.sans.join(", ")}</span>
          </div>
        )}
        {cert.store && (
          <div className={styles.certInfoItem}>
            <span className={styles.certInfoLabel}>{t("cert.store") || "存储位置"}:</span>
            <span className={styles.certInfoValue}>{cert.store}</span>
          </div>
        )}
        {cert.daysRemaining !== undefined && (
          <div className={styles.certInfoItem}>
            <span className={styles.certInfoLabel}>{t("cert.daysRemaining") || "剩余天数"}:</span>
            <span className={styles.certInfoValue}>{cert.daysRemaining}</span>
          </div>
        )}
      </div>
    </div>
  );
});

CertSearchCard.displayName = "CertSearchCard";

const CertSearchList = memo(({ keyword, store, source }: CertSearchListProps) => {
  const { t } = useTranslation("certSearch");
  
  const filter = useMemo(
    () => ({
      keyword: keyword.trim(),
      store,
      source,
    }),
    [keyword, store, source]
  );

  const {
    data: certificates = [],
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSearchCertificateList(
    certKeys.search(keyword.trim(), store, source),
    filter,
    { staleTime: 1000 * 60 * 5 } // 5 minutes
  );

  const emptyStateContent = useMemo(() => {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>{t("results.empty") || "未找到匹配的证书"}</p>
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
      <div className={styles.resultsHeader}>
        <p className={styles.resultsCount}>
          {t("results.count", { count: certificates.length }) || `找到 ${certificates.length} 个证书`}
        </p>
      </div>
      <div className={styles.listContainer}>
        <VirtualWindowList
          data={certificates.filter((cert) => cert && cert.domain)}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          renderItem={(cert) => <CertSearchCard key={cert.id || `${cert.domain}-${cert.source}`} cert={cert} />}
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

CertSearchList.displayName = "CertSearchList";

export default CertSearchList;


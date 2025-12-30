import { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "@/assets/icons/lucide";

import { Button, Input, Suspense } from "@/components";
import { SearchCertificate } from "@/apis/cert.api";
import { CertificateSource, type CertType } from "@/apis/domain";
import { ROUTES } from "@/types/navigation";
import { useCertificateSource } from "@/hooks";
import type { CertificateInfo } from "@/apis/domain";

import styles from "./styles.module.css";

// 子组件：显示 source badge
const SourceBadge = memo(({ source }: { source?: CertificateSource | string }) => {
  const sourceInfo = useCertificateSource(source);
  if (!source) return null;
  return (
    <span
      className={styles.sourceBadge}
      style={{ backgroundColor: sourceInfo.bgColor, color: sourceInfo.textColor }}
    >
      {sourceInfo.label}
    </span>
  );
});

SourceBadge.displayName = "SourceBadge";

const CertSearchPageContent = memo(() => {
  const { t } = useTranslation("certSearch");
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [store, setStore] = useState<CertType | "">("");
  const [source, setSource] = useState<CertificateSource | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["searchCertificates", keyword, store, source, page],
    queryFn: async () => {
      if (!keyword.trim()) {
        return {
          success: true,
          certificates: [],
          total: 0,
          page: 1,
          pageSize: 20,
        };
      }
      return await SearchCertificate({
        keyword: keyword.trim(),
        store: store || undefined,
        source: source || undefined,
        page,
        pageSize,
      });
    },
    enabled: false, // 手动触发搜索
  });

  const handleSearch = useCallback(() => {
    if (keyword.trim()) {
      setPage(1);
      refetch();
    }
  }, [keyword, refetch]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleClearFilters = useCallback(() => {
    setStore("");
    setSource("");
    setPage(1);
    if (keyword.trim()) {
      refetch();
    }
  }, [keyword, refetch]);

  const handleCertificateClick = useCallback(
    (cert: CertificateInfo) => {
      const certType = (cert.store as CertType) || "database";
      const certSource = cert.source || CertificateSource.AUTO;
      navigate(ROUTES.CERT_DETAIL_PATH(certType, cert.domain, certSource));
    },
    [navigate]
  );

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title") || "搜索证书"}</h1>
        <p className={styles.subtitle}>{t("subtitle") || "根据域名或文件夹名称搜索证书"}</p>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <Input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("search.placeholder") || "输入域名或文件夹名称..."}
            className={styles.searchInput}
          />
          <Button onClick={handleSearch} disabled={!keyword.trim() || isLoading} className={styles.searchButton}>
            <Search size={20} />
            {t("search.button") || "搜索"}
          </Button>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t("filters.store") || "存储位置"}</label>
            <select
              value={store}
              onChange={(e) => setStore(e.target.value as CertType | "")}
              className={styles.filterSelect}
            >
              <option value="">{t("filters.all") || "全部"}</option>
              <option value="websites">{t("filters.websites") || "Websites"}</option>
              <option value="apis">{t("filters.apis") || "Apis"}</option>
              <option value="database">{t("filters.database") || "Database"}</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t("filters.source") || "来源"}</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as CertificateSource | "")}
              className={styles.filterSelect}
            >
              <option value="">{t("filters.all") || "全部"}</option>
              <option value={CertificateSource.AUTO}>{t("filters.auto") || "自动发现"}</option>
              <option value={CertificateSource.MANUAL_APPLY}>{t("filters.manualApply") || "手动申请"}</option>
              <option value={CertificateSource.MANUAL_ADD}>{t("filters.manualAdd") || "手动添加"}</option>
            </select>
          </div>

          {(store || source) && (
            <Button variant="secondary" onClick={handleClearFilters} className={styles.clearButton}>
              <X size={16} />
              {t("filters.clear") || "清除筛选"}
            </Button>
          )}
        </div>
      </div>

      {data && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              {t("results.count", { count: data.total }) || `找到 ${data.total} 个证书`}
            </p>
          </div>

          {data.certificates.length > 0 ? (
            <>
              <div className={styles.certList}>
                {data.certificates.map((cert) => (
                  <div
                    key={`${cert.domain}-${cert.source}`}
                    className={styles.certCard}
                    onClick={() => handleCertificateClick(cert)}
                  >
                    <div className={styles.certHeader}>
                      <h3 className={styles.certDomain}>{cert.domain}</h3>
                      <SourceBadge source={cert.source} />
                    </div>
                    <div className={styles.certInfo}>
                      {cert.folderName && (
                        <div className={styles.certInfoItem}>
                          <span className={styles.certInfoLabel}>{t("cert.folderName") || "文件夹"}:</span>
                          <span className={styles.certInfoValue}>{cert.folderName}</span>
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
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {t("pagination.previous") || "上一页"}
                  </Button>
                  <span className={styles.paginationInfo}>
                    {t("pagination.page", { current: page, total: totalPages }) || `第 ${page} 页，共 ${totalPages} 页`}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {t("pagination.next") || "下一页"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>{t("results.empty") || "未找到匹配的证书"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

CertSearchPageContent.displayName = "CertSearchPageContent";

const CertSearchPage = memo(() => {
  const { t } = useTranslation("certSearch");

  return (
    <Suspense
      loadingType="truck"
      loadingText={t("loading") || "Loading..."}
      loadingSize="medium"
    >
      <CertSearchPageContent />
    </Suspense>
  );
});

CertSearchPage.displayName = "CertSearchPage";

export default CertSearchPage;


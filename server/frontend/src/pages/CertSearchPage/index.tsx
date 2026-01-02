import { memo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "@/assets/icons/lucide";

import { Button, Input, Suspense } from "@/components";
import { CertificateSource, type CertType } from "@/apis/domain";
import { CertSearchList } from "./components";
import styles from "./styles.module.css";

const CertSearchPageContent = memo(() => {
  const { t } = useTranslation("certSearch");

  const [keyword, setKeyword] = useState("");
  const [store, setStore] = useState<CertType | "">("");
  const [source, setSource] = useState<CertificateSource | "">("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = useCallback(() => {
    if (keyword.trim()) {
      setSearchKeyword(keyword.trim());
    }
  }, [keyword]);

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
  }, []);

  const hasActiveSearch = searchKeyword.trim().length > 0;

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
          <Button onClick={handleSearch} disabled={!keyword.trim()} className={styles.searchButton}>
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

      {hasActiveSearch && (
        <Suspense
          loadingType="truck"
          loadingText={t("loading") || "Loading..."}
          loadingSize="medium"
        >
          <CertSearchList
            keyword={searchKeyword}
            store={store || undefined}
            source={source || undefined}
          />
        </Suspense>
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

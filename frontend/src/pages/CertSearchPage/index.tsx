import { memo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { SearchInput, SlideDownSwitcher, Suspense } from "nfx-ui/components";

import { PrimaryButton, SecondaryButton } from "@/components";

import { CertificateSource, type CertType } from "@/types";

import { CertSearchList } from "./components";
import styles from "./styles.module.css";

type StoreFilter = CertType | "";
type SourceFilter = CertificateSource | "";

const STORE_OPTIONS = ["", "websites", "apis", "database"] as const satisfies readonly StoreFilter[];
const SOURCE_OPTIONS = ["", CertificateSource.AUTO, CertificateSource.MANUAL_APPLY, CertificateSource.MANUAL_ADD] as const satisfies readonly SourceFilter[];

const CertSearchPageContent = memo(() => {
  const { t } = useTranslation("certSearch");

  const [keyword, setKeyword] = useState("");
  const [store, setStore] = useState<StoreFilter>("");
  const [source, setSource] = useState<SourceFilter>("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = useCallback(() => {
    const k = keyword.trim();
    if (k) setSearchKeyword(k);
  }, [keyword]);

  const handleClearFilters = useCallback(() => {
    setStore("");
    setSource("");
  }, []);

  const getStoreLabel = useCallback(
    (v: StoreFilter) => {
      if (v === "") return t("filters.all") ?? "全部";
      if (v === "websites") return t("filters.websites") ?? "Websites";
      if (v === "apis") return t("filters.apis") ?? "Apis";
      return t("filters.database") ?? "Database";
    },
    [t],
  );

  const getSourceLabel = useCallback(
    (v: SourceFilter) => {
      if (v === "") return t("filters.all") ?? "全部";
      if (v === CertificateSource.AUTO) return t("filters.auto") ?? "自动发现";
      if (v === CertificateSource.MANUAL_APPLY) return t("filters.manualApply") ?? "手动申请";
      return t("filters.manualAdd") ?? "手动添加";
    },
    [t],
  );

  const hasActiveSearch = searchKeyword.trim().length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title") ?? "搜索证书"}</h1>
        <p className={styles.subtitle}>{t("subtitle") ?? "根据域名或文件夹名称搜索证书"}</p>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchRow}>
          <SearchInput
            value={keyword}
            onChange={setKeyword}
            placeholder={t("search.placeholder") ?? "输入域名或文件夹名称..."}
            clearButtonAriaLabel={t("search.clear") ?? "清除"}
          />
          <PrimaryButton
            text={t("search.button") ?? "搜索"}
            handler={handleSearch}
            disabled={!keyword.trim()}
            className={styles.searchButton}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterColumn}>
            <span className={styles.filterLabel}>{t("filters.store") ?? "存储位置"}</span>
            <SlideDownSwitcher<StoreFilter>
              value={store}
              options={STORE_OPTIONS}
              getDisplayName={getStoreLabel}
              onChange={setStore}
              status="default"
            />
          </div>
          <div className={styles.filterColumn}>
            <span className={styles.filterLabel}>{t("filters.source") ?? "来源"}</span>
            <SlideDownSwitcher<SourceFilter>
              value={source}
              options={SOURCE_OPTIONS}
              getDisplayName={getSourceLabel}
              onChange={setSource}
              status="default"
            />
          </div>
          {(store || source) && (
            <SecondaryButton
              text={`${t("filters.clear") ?? "清除筛选"}`}
              handler={handleClearFilters}
              className={styles.clearButton}
            />
          )}
        </div>
      </div>

      {hasActiveSearch && (
        <Suspense
          loadingType="truck"
          loadingText={t("loading") ?? "Loading..."}
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
    <Suspense loadingType="truck" loadingText={t("loading") ?? "Loading..."} loadingSize="medium">
      <CertSearchPageContent />
    </Suspense>
  );
});

CertSearchPage.displayName = "CertSearchPage";

export default CertSearchPage;

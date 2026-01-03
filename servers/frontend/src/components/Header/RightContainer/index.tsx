import { memo } from "react";
import { Search } from "@/assets/icons/lucide";

import { LanguageSwitcher } from "@/components";
import { showSearch } from "@/stores/modalStore";

import styles from "./styles.module.css";

const RightContainer = memo(() => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.actions}>
        {/* 搜索按钮 */}
        <button className={`${styles.action} ${styles.controlItem}`} onClick={() => showSearch()}>
          <Search size={20} />
        </button>
        <div className={styles.separator}></div>
        {/* 语言切换器 */}
        <LanguageSwitcher status="default" />
      </div>
    </div>
  );
});

RightContainer.displayName = "RightContainer";
export default RightContainer;

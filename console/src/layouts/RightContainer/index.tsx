import { memo } from "react";
import { useTranslation } from "react-i18next";

import { LANGUAGE_VALUES, LanguageEnum } from "nfx-ui/enums";
import { useSyncPreference } from "nfx-ui/hooks";
import { getLanguageDisplayName } from "nfx-ui/languages";
import { AuthStore, clearAuth, useAuthStore, usePreferenceStore } from "nfx-ui/stores";
import { Select } from "@radix-ui/themes";
import { Button } from "@/components";
import { Search } from "@/assets/icons/lucide";
import { authEventEmitter } from "@/events/auth";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { showSearch } from "@/stores/modalStore";

import styles from "./styles.module.css";

const RightContainer = memo(() => {
  const { t } = useTranslation("LoginPage");
  const accountId = useAuthStore((s) => s.currentAccountId);
  const languageValue = usePreferenceStore((s) => s.language);
  const { syncPreference } = useSyncPreference();

  return (
    <div className={styles.headerContainer}>
      <div className={styles.actions}>
        <Select.Root value={languageValue} onValueChange={(lng) => syncPreference({ language: lng as LanguageEnum })}>
          <Select.Trigger />
          <Select.Content>
            {LANGUAGE_VALUES.map((lng) => (
              <Select.Item key={lng} value={lng}>
                {getLanguageDisplayName(lng)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <div className={styles.separator} />
        {accountId ? (
          <>
            <span className={styles.userLabel} title={accountId}>
              {accountId.slice(0, 8)}
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                clearAuth();
                AuthStore.getState().clearAuth();
                authEventEmitter.logout();
                routerEventEmitter.navigateReplace(ROUTES.LOGIN);
              }}
              className={`${styles.action} ${styles.controlItem}`}
            >
              {t("logout")}
            </Button>
            <div className={styles.separator} />
          </>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          iconOnly
          leftIcon={<Search size={20} />}
          onClick={() => showSearch()}
          className={`${styles.action} ${styles.controlItem}`}
          aria-label="Search"
        />
      </div>
    </div>
  );
});

RightContainer.displayName = "RightContainer";

export default RightContainer;

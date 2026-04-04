import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguageEnum, changeLanguage, getLanguageDisplayName } from "nfx-ui/languages";
import { Button, SlideDownSwitcher } from "nfx-ui/components";
import { safeStringable } from "nfx-ui/utils";
import { Search } from "@/assets/icons/lucide";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { showSearch } from "@/stores/modalStore";
import AuthStore, { useAuthStore } from "@/stores/authStore";
import { initialsFrom } from "@/utils/userInitials";
import { vaultImageFileUrl } from "@/utils/vaultImageUrl";

import styles from "./styles.module.css";

const LANGUAGE_OPTIONS: LanguageEnum[] = [LanguageEnum.EN, LanguageEnum.ZH, LanguageEnum.FR];

const RightContainer = memo(() => {
  const { i18n } = useTranslation();
  const { t } = useTranslation("LoginPage");
  const displayName = useAuthStore((s) => s.displayName);
  const userEmail = useAuthStore((s) => s.userEmail);
  const avatarImageId = useAuthStore((s) => s.avatarImageId);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const languageValue = (i18n.language as LanguageEnum) || LanguageEnum.ZH;

  const avatarSrc = avatarImageId ? vaultImageFileUrl(avatarImageId) : "";
  const showAvatarImg = Boolean(avatarSrc) && !avatarBroken;

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarImageId]);

  const handleLanguageChange = (lng: LanguageEnum) => {
    changeLanguage(lng);
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.actions}>
        <SlideDownSwitcher
          value={languageValue}
          options={LANGUAGE_OPTIONS}
          getDisplayName={getLanguageDisplayName}
          onChange={handleLanguageChange}
          status="default"
        />
        <div className={styles.separator} />
        {displayName ? (
          <>
            <div className={styles.userBlock}>
              <div className={styles.avatarRing} aria-hidden>
                {showAvatarImg ? (
                  <img
                    src={avatarSrc}
                    alt=""
                    className={styles.avatarImg}
                    onError={() => setAvatarBroken(true)}
                  />
                ) : (
                  <span className={styles.avatarInitials}>
                    {initialsFrom(safeStringable(displayName), safeStringable(userEmail))}
                  </span>
                )}
              </div>
              <span className={styles.userLabel} title={displayName}>
                {displayName}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                AuthStore.getState().clearAuth();
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

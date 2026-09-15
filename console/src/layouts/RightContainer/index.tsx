import { memo, useEffect, useState } from "react";

import { useAssetRepository } from "nfx-ui/apis";
import { useAuthStore } from "nfx-ui/stores";
import { safeStringable } from "nfx-ui/utils";

import { useVaultAccount } from "@/hooks/account";
import { activeAvatarOf, identityProfileOf, primaryEmailOf } from "@/utils/identityProfile";
import { initialsFrom } from "@/utils/userInitials";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";

import styles from "./styles.module.css";

const RightContainer = memo(() => {
  const accountId = useAuthStore((s) => s.currentAccountId);
  const asset = useAssetRepository();
  const { data } = useVaultAccount();
  const profile = identityProfileOf(data);
  const avatar = activeAvatarOf(profile);
  const displayName = safeStringable(profile?.displayName) || accountId?.slice(0, 8) || "";
  const email = primaryEmailOf(data);
  const avatarSrc = avatar?.imageId ? asset.FileURL("images", avatar.imageId) : "";
  const [avatarBroken, setAvatarBroken] = useState(false);
  const showAvatarImg = Boolean(avatarSrc) && !avatarBroken;

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatar?.imageId]);

  if (!accountId) return null;

  return (
    <button type="button" className={styles.userBlock} title={displayName} onClick={() => routerEventEmitter.navigate({ to: ROUTES.ACCOUNT })}>
      <div className={styles.avatarRing} aria-hidden>
        {showAvatarImg ? (
          <img src={avatarSrc} alt="" className={styles.avatarImg} onError={() => setAvatarBroken(true)} />
        ) : (
          <span className={styles.avatarInitials}>{initialsFrom(displayName, email)}</span>
        )}
      </div>
      <span className={styles.userLabel}>{displayName}</span>
    </button>
  );
});

RightContainer.displayName = "RightContainer";

export default RightContainer;

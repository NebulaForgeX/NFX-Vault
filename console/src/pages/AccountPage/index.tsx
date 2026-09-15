import { memo, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Flex } from "@radix-ui/themes";
import { User } from "lucide-react";
import { PageFrame } from "nfx-ui/layouts";
import { PageHeader } from "nfx-ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAssetRepository, useAuthRepository } from "nfx-ui/apis";
import { useAuthStore } from "nfx-ui/stores";
import { showError, showSuccess } from "nfx-ui/stores";
import { getApiErrorMessage, safeStringable } from "nfx-ui/utils";

import { Button } from "@/components";
import { Calendar, Camera, Hash, Image, LockKeyhole, Mail } from "@/assets/icons/lucide";
import { useVaultAccount, vaultAccountQueryKey } from "@/hooks/account";
import { activeAvatarOf, identityProfileOf, primaryEmailOf } from "@/utils/identityProfile";
import { initialsFrom } from "@/utils/userInitials";

import styles from "./styles.module.css";

const AccountPage = memo(() => {
  const { t, i18n } = useTranslation("LoginPage");
  const fileRef = useRef<HTMLInputElement>(null);
  const auth = useAuthRepository();
  const asset = useAssetRepository();
  const queryClient = useQueryClient();
  const kind = useAuthStore((s) => s.currentProfileKind);
  const accountId = useAuthStore((s) => s.currentAccountId);
  const profileId = useAuthStore((s) => s.currentProfileId);
  const { data, isLoading, isError, refetch, isFetching } = useVaultAccount();

  const profile = identityProfileOf(data);
  const savedAvatar = activeAvatarOf(profile);

  const [name, setName] = useState("");
  const [pendingImageId, setPendingImageId] = useState<string | null>(null);
  const [clearAvatarOnSave, setClearAvatarOnSave] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(safeStringable(profile.displayName));
    setPendingImageId(null);
    setClearAvatarOnSave(false);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [profile]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    setAvatarBroken(false);
  }, [pendingImageId, localPreviewUrl, savedAvatar?.imageId, clearAvatarOnSave]);

  const uploadImage = async (file: File) => {
    const prepared = await asset.PrepareUpload("images", { fileName: file.name, mimeType: file.type || "image/png" });
    await fetch(prepared.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "image/png" } });
    await asset.ConfirmUpload("images", { id: prepared.id });
    return prepared.id;
  };

  const onPickAvatarFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError(t("avatarFileTypeInvalid"));
      return;
    }
    setUploadingAvatar(true);
    void uploadImage(file)
      .then((imageId) => {
        setPendingImageId(imageId);
        setClearAvatarOnSave(false);
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(URL.createObjectURL(file));
      })
      .catch((error: unknown) => {
        showError(getApiErrorMessage(error as never, t("avatarUploadFailed")));
      })
      .finally(() => setUploadingAvatar(false));
  };

  const onSubmitProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError(t("validation.displayNameRequired"));
      return;
    }
    setSavingProfile(true);
    void (async () => {
      await auth.PatchProfile(kind, { displayName: name.trim() });
      if (clearAvatarOnSave) {
        await auth.ClearProfileAvatar(kind);
      } else if (pendingImageId) {
        await auth.ConfirmProfileAvatar(kind, { imageId: pendingImageId });
      }
      await queryClient.invalidateQueries({ queryKey: vaultAccountQueryKey(kind) });
      setPendingImageId(null);
      setClearAvatarOnSave(false);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }
      showSuccess(t("profileSaved"));
    })()
      .catch((error: unknown) => {
        showError(getApiErrorMessage(error as never, t("registerFailed")));
      })
      .finally(() => setSavingProfile(false));
  };

  const onSubmitPassword = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showError(t("validation.passwordMinLength8"));
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(t("passwordsMustMatch"));
      return;
    }
    setChangingPassword(true);
    void auth
      .ChangePassword({ currentPassword: oldPassword, newPassword, verificationCode: "" })
      .then(() => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showSuccess(t("passwordChanged"));
      })
      .catch((error: unknown) => {
        showError(getApiErrorMessage(error as never, t("registerFailed")));
      })
      .finally(() => setChangingPassword(false));
  };

  const email = primaryEmailOf(data);
  const createdLabel =
    profile?.createdAt != null && profile.createdAt !== ""
      ? new Date(profile.createdAt).toLocaleString(i18n.language, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  if (isLoading && !data) {
    return (
      <PageFrame>
        <PageHeader icon={User} title={t("account")} />
        <p>{t("loadingProfile")}</p>
      </PageFrame>
    );
  }

  if (isError && !data) {
    return (
      <PageFrame>
        <PageHeader icon={User} title={t("account")} />
        <Flex direction="column" gap="3">
          <p>{t("profileLoadFailed")}</p>
          <Button type="button" variant="soft" onClick={() => void refetch()}>
            {t("retry")}
          </Button>
        </Flex>
      </PageFrame>
    );
  }

  const savedAvatarSrc =
    !clearAvatarOnSave && savedAvatar?.imageId ? asset.FileURL("images", savedAvatar.imageId) : "";
  const resolvedAvatarSrc = localPreviewUrl || savedAvatarSrc;
  const showAvatarPreview = Boolean(resolvedAvatarSrc) && !avatarBroken;
  const initials = initialsFrom(name, email);
  const hasAvatarToShow = Boolean(savedAvatar?.imageId) || Boolean(pendingImageId) || Boolean(localPreviewUrl);

  const onRemoveAvatar = () => {
    setPendingImageId(null);
    setClearAvatarOnSave(true);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
  };

  return (
    <PageFrame>
      <PageHeader icon={User} title={t("account")} description={email} />
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.avatarRing}>
            <div className={styles.avatarInner}>
              {showAvatarPreview ? (
                <img className={styles.avatarImg} src={resolvedAvatarSrc} alt="" onError={() => setAvatarBroken(true)} />
              ) : (
                <span className={styles.initials}>{initials}</span>
              )}
            </div>
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroKicker}>{t("account")}</p>
            <h1 className={styles.heroTitle}>{name.trim() || t("account")}</h1>
            <p className={styles.heroEmail}>{email}</p>
            <p className={styles.heroMeta}>
              <Calendar size={14} aria-hidden />
              {createdLabel}
            </p>
          </div>
        </header>

        <div className={styles.mainGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div className={styles.panelIcon} aria-hidden>
                <Image size={18} />
              </div>
              <div className={styles.panelHeadText}>
                <h2 className={styles.panelTitle}>{t("sectionProfile")}</h2>
                <p className={styles.panelDesc}>{t("sectionProfileDesc")}</p>
              </div>
            </div>

            <form className={styles.formStack} onSubmit={onSubmitProfile}>
              <div className={styles.field}>
                <label htmlFor="acc-name">{t("displayName")}</label>
                <input
                  id="acc-name"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="nickname"
                />
              </div>

              <div className={styles.field}>
                <span id="acc-avatar-file-label">{t("avatarFile")}</span>
                <input
                  ref={fileRef}
                  id="acc-avatar-file"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className={styles.hiddenFile}
                  aria-labelledby="acc-avatar-file-label"
                  onChange={onPickAvatarFile}
                  disabled={uploadingAvatar}
                />
                <div className={styles.uploadRow}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="medium"
                    leftIcon={<Camera size={18} />}
                    disabled={uploadingAvatar}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploadingAvatar ? t("avatarUploading") : t("avatarUploadCta")}
                  </Button>
                  {hasAvatarToShow ? (
                    <Button type="button" variant="secondary" size="medium" onClick={onRemoveAvatar}>
                      {t("avatarRemove")}
                    </Button>
                  ) : null}
                  {pendingImageId ? (
                    <span className={`${styles.uploadMeta} ${styles.uploadMetaOk}`}>{t("avatarPendingSave")}</span>
                  ) : null}
                  {clearAvatarOnSave ? (
                    <span className={`${styles.uploadMeta} ${styles.uploadMetaOk}`}>{t("avatarPendingRemove")}</span>
                  ) : null}
                </div>
                <span className={styles.uploadMeta}>{t("avatarFormatsHint")}</span>
                <span className={styles.uploadMeta}>{t("avatarByImageIdHint")}</span>
              </div>

              <div className={styles.actions}>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  disabled={savingProfile || isFetching || uploadingAvatar}
                  loading={savingProfile || isFetching}
                >
                  {t("saveProfile")}
                </Button>
              </div>
            </form>
          </section>

          <aside className={styles.panel}>
            <div className={styles.panelHead}>
              <div className={styles.panelIcon} aria-hidden>
                <Mail size={18} />
              </div>
              <div className={styles.panelHeadText}>
                <h2 className={styles.panelTitle}>{t("sectionAccountInfo")}</h2>
                <p className={styles.panelDesc}>{t("sectionAccountInfoDesc")}</p>
              </div>
            </div>

            <div className={styles.metaList}>
              <div className={styles.metaRow}>
                <Mail size={16} className={styles.metaIcon} aria-hidden />
                <div className={styles.metaBody}>
                  <span className={styles.metaLabel}>{t("email")}</span>
                  <span className={styles.metaValue}>{email}</span>
                </div>
              </div>
              <div className={styles.metaRow}>
                <Hash size={16} className={styles.metaIcon} aria-hidden />
                <div className={styles.metaBody}>
                  <span className={styles.metaLabel}>{t("userId")}</span>
                  <span className={`${styles.metaValue} ${styles.mono}`}>{accountId || profileId}</span>
                </div>
              </div>
              <div className={styles.metaRow}>
                <Calendar size={16} className={styles.metaIcon} aria-hidden />
                <div className={styles.metaBody}>
                  <span className={styles.metaLabel}>{t("memberSince")}</span>
                  <span className={styles.metaValue}>{createdLabel}</span>
                </div>
              </div>
            </div>
          </aside>

          <section className={`${styles.panel} ${styles.panelFull}`}>
            <div className={styles.panelHead}>
              <div className={styles.panelIcon} aria-hidden>
                <LockKeyhole size={18} />
              </div>
              <div className={styles.panelHeadText}>
                <h2 className={styles.panelTitle}>{t("sectionSecurity")}</h2>
                <p className={styles.panelDesc}>{t("sectionSecurityDesc")}</p>
              </div>
            </div>

            <form className={styles.formStack} onSubmit={onSubmitPassword}>
              <input
                type="text"
                name="username"
                value={email === "—" ? "" : email}
                autoComplete="username"
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                className={styles.hiddenFile}
              />
              <div className={styles.pwGrid}>
                <div className={`${styles.field} ${styles.pwSpan2}`}>
                  <label htmlFor="acc-old-pw">{t("oldPassword")}</label>
                  <input
                    id="acc-old-pw"
                    className={styles.input}
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="acc-new-pw">{t("newPassword")}</label>
                  <input
                    id="acc-new-pw"
                    className={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="acc-confirm-pw">{t("confirmPassword")}</label>
                  <input
                    id="acc-confirm-pw"
                    className={styles.input}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className={styles.actions}>
                <Button type="submit" variant="primary" size="large" disabled={changingPassword} loading={changingPassword}>
                  {t("changePassword")}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </PageFrame>
  );
});

AccountPage.displayName = "AccountPage";

export default AccountPage;

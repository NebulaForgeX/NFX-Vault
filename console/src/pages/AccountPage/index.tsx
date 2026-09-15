import { memo, useEffect, useState, type FormEvent } from "react";
import { Flex } from "@radix-ui/themes";
import { User } from "lucide-react";
import { PageFrame } from "nfx-ui/layouts";
import { PageHeader } from "nfx-ui/components";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuthRepository } from "nfx-ui/apis";
import { useAuthStore } from "nfx-ui/stores";
import { showError, showSuccess } from "nfx-ui/stores";
import { getApiErrorMessage, safeStringable } from "nfx-ui/utils";

import { Button } from "@/components";
import { Mail } from "@/assets/icons/lucide";

import styles from "./styles.module.css";

const AccountPage = memo(() => {
  const { t } = useTranslation("LoginPage");
  const auth = useAuthRepository();
  const kind = useAuthStore((s) => s.currentProfileKind);
  const accountId = useAuthStore((s) => s.currentAccountId);
  const profileId = useAuthStore((s) => s.currentProfileId);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["vault-account-me", kind],
    queryFn: () => auth.GetCurrentFullAccountInformationWithProfile(kind),
  });

  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const profile = data && "profile" in data ? (data as { profile?: { displayName?: string } }).profile : undefined;

  useEffect(() => {
    if (!profile) return;
    setName(safeStringable(profile.displayName));
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: () => auth.PatchProfile(kind, { displayName: name }),
    onSuccess: () => {
      showSuccess(t("profileSaved"));
      void refetch();
    },
    onError: (error) => showError(getApiErrorMessage(error, t("registerFailed"))),
  });

  const changePassword = useMutation({
    mutationFn: () =>
      auth.ChangePassword({ currentPassword: oldPassword, newPassword, verificationCode: "" }),
    onSuccess: () => {
      showSuccess(t("passwordChanged"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => showError(getApiErrorMessage(error, t("registerFailed"))),
  });

  const onSaveProfile = (event: FormEvent) => {
    event.preventDefault();
    saveProfile.mutate();
  };

  const onChangePassword = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      showError(t("passwordsMustMatch"));
      return;
    }
    changePassword.mutate();
  };

  return (
    <PageFrame>
      <PageHeader icon={User} title={t("account")} description={t("accountSubtitle")} />
      <Flex direction="column" gap="5" className={styles.page}>
        {isLoading || isFetching ? <p>{t("loadingProfile")}</p> : null}
        {isError ? (
          <p>
            {t("profileLoadFailed")}{" "}
            <Button type="button" variant="ghost" onClick={() => void refetch()}>
              {t("retry")}
            </Button>
          </p>
        ) : null}
        <form onSubmit={onSaveProfile} className={styles.section}>
          <h2>{t("sectionProfile")}</h2>
          <p>{t("sectionProfileDesc")}</p>
          <label>
            {t("displayName")}
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <Button type="submit" disabled={saveProfile.isPending}>
            {t("saveProfile")}
          </Button>
        </form>
        <section className={styles.section}>
          <h2>{t("sectionAccountInfo")}</h2>
          <p>{t("sectionAccountInfoDesc")}</p>
          <p>
            <Mail size={14} /> {accountId}
          </p>
          <p>{profileId}</p>
        </section>
        <form onSubmit={onChangePassword} className={styles.section}>
          <h2>{t("sectionSecurity")}</h2>
          <p>{t("sectionSecurityDesc")}</p>
          <label>
            {t("oldPassword")}
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          </label>
          <label>
            {t("newPassword")}
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>
          <label>
            {t("confirmPassword")}
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </label>
          <Button type="submit" disabled={changePassword.isPending}>
            {t("changePassword")}
          </Button>
        </form>
      </Flex>
    </PageFrame>
  );
});

AccountPage.displayName = "AccountPage";

export default AccountPage;

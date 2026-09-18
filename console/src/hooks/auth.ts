import type { AxiosError } from "axios";
import type { NormalUnifiedQueryOptions } from "nfx-ui/hooks";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthRepository } from "nfx-ui/apis";
import { AuthSignupPlatformEnum, LanguageEnum } from "nfx-ui/enums";
import { useUnifiedQuery } from "nfx-ui/hooks";
import { AuthStore, clearAuth, ensureDeviceIdStorage } from "nfx-ui/stores";
import { useTranslation } from "react-i18next";

import { authEventEmitter } from "@/events/auth";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { showError } from "@/stores/modalStore";
import { vaultApiErrorMessage } from "@/utils/vaultApiError";

export function useSendSignupCode() {
  const auth = useAuthRepository();
  const { t } = useTranslation("LoginPage");
  return useMutation({
    mutationFn: (params: { email: string }) =>
      auth.SendVerificationCode({
        email: params.email,
        lang: LanguageEnum.ZH,
      }),
    onError: (error: AxiosError) => {
      showError(vaultApiErrorMessage(error, t("sendCodeFailed")));
    },
  });
}

export const useSendVerificationCode = useSendSignupCode;

export function useSignup() {
  const auth = useAuthRepository();
  const { t } = useTranslation("LoginPage");
  return useMutation({
    mutationFn: async (params: { email: string; password: string; verificationCode: string; displayName?: string }) => {
      const deviceId = await ensureDeviceIdStorage();
      return auth.SignupWithEmail({
        email: params.email,
        password: params.password,
        verificationCode: params.verificationCode,
        lang: LanguageEnum.ZH,
        signupPlatform: AuthSignupPlatformEnum.NFXVAULT,
        deviceId,
      });
    },
    onSuccess: (res) => {
      AuthStore.getState().setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      AuthStore.getState().setCurrentAccountId(res.accountId);
      routerEventEmitter.navigateReplace(ROUTES.CHECK);
    },
    onError: (error: AxiosError) => {
      showError(vaultApiErrorMessage(error, t("registerFailed")));
    },
  });
}

export function useLoginByEmail() {
  const auth = useAuthRepository();
  const { t } = useTranslation("LoginPage");
  return useMutation({
    mutationFn: async (params: { email: string; password: string }) => {
      const deviceId = await ensureDeviceIdStorage();
      return auth.LoginWithEmail({ email: params.email, password: params.password, deviceId });
    },
    onSuccess: (res) => {
      AuthStore.getState().setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      AuthStore.getState().setCurrentAccountId(res.accountId);
      routerEventEmitter.navigateReplace(ROUTES.CHECK);
    },
    onError: (error: AxiosError) => {
      showError(vaultApiErrorMessage(error, t("loginFailed")));
    },
  });
}

export function useMe(options?: NormalUnifiedQueryOptions<unknown>) {
  const auth = useAuthRepository();
  const kind = AuthStore.getState().currentProfileKind;
  return useUnifiedQuery(() => auth.GetCurrentFullAccountInformationWithProfile(kind), ["vault-me", kind], undefined, options);
}

export function useUpdateMe() {
  const auth = useAuthRepository();
  const kind = AuthStore.getState().currentProfileKind;
  return useMutation({
    mutationFn: (params: { displayName?: string }) => auth.PatchProfile(kind, params),
    onSuccess: () => {
      authEventEmitter.updateMe();
    },
  });
}

export function useUpdateMyPassword() {
  const auth = useAuthRepository();
  return useMutation({
    mutationFn: (params: { oldPassword: string; newPassword: string }) =>
      auth.ChangePassword({ currentPassword: params.oldPassword, newPassword: params.newPassword, verificationCode: "" }),
  });
}

export const useAuthInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const { accessToken, isAuthValid } = AuthStore.getState();
    if (!accessToken && isAuthValid) {
      clearAuth();
      authEventEmitter.logout();
    }
    setIsInitialized(true);
  }, []);

  return { isInitialized };
};

import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { LoginByEmail, SendSignupVerificationCode, Signup } from "@/apis/auth.api";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import AuthStore from "@/stores/authStore";
import { showError } from "@/stores/modalStore";
import { safeStringable } from "nfx-ui/utils";

import { vaultApiErrorMessage } from "@/utils/vaultApiError";

export function useSendSignupCode() {
  const { t } = useTranslation("LoginPage");
  return useMutation({
    mutationFn: SendSignupVerificationCode,
    onError: (error: AxiosError) => {
      showError(vaultApiErrorMessage(error, t("sendCodeFailed")));
    },
  });
}

export function useVaultSignup() {
  const { t } = useTranslation("LoginPage");
  return useMutation({
    mutationFn: Signup,
    onSuccess: (res) => {
      AuthStore.getState().setTokens({
        accessToken: res.token,
        refreshToken: safeStringable(res.refreshToken),
      });
      AuthStore.getState().setIsAuthValid(true);
      AuthStore.getState().setFromUser(res.user);
      routerEventEmitter.navigateReplace(ROUTES.HOME);
    },
    onError: (error: AxiosError) => {
      showError(vaultApiErrorMessage(error, t("registerFailed")));
    },
  });
}

export function useVaultLoginByEmail() {
  const { t } = useTranslation("LoginPage");
  return useMutation({
    mutationFn: LoginByEmail,
    onSuccess: (res) => {
      AuthStore.getState().setTokens({
        accessToken: res.token,
        refreshToken: safeStringable(res.refreshToken),
      });
      AuthStore.getState().setIsAuthValid(true);
      AuthStore.getState().setFromUser(res.user);
      routerEventEmitter.navigateReplace(ROUTES.HOME);
    },
    onError: (error: AxiosError) => {
      showError(vaultApiErrorMessage(error, t("loginFailed")));
    },
  });
}

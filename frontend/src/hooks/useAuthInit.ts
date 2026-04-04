import { useEffect, useState } from "react";

import { GetMe } from "@/apis/auth.api";
import AuthStore from "@/stores/authStore";

/**
 * 应用启动时验证 token 的有效性（与 Pqttec-Admin useAuthInit 一致；Vault 用 GetMe）。
 * persist 由 nfx-ui makePersistStore 同步恢复；若仅有旧版 localStorage（有 token 无 isAuthValid），在此补正后再校验。
 */
export const useAuthInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      let { accessToken, isAuthValid } = AuthStore.getState();

      if (accessToken && !isAuthValid) {
        AuthStore.setState({ isAuthValid: true });
        isAuthValid = true;
      }

      if (accessToken && isAuthValid) {
        try {
          await GetMe();
        } catch (error) {
          console.warn("Token validation failed on app init, clearing auth:", error);
          AuthStore.getState().clearAuth();
        }
      } else if (!accessToken) {
        if (isAuthValid) {
          AuthStore.getState().clearAuth();
        }
      }
      setIsInitialized(true);
    };

    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isInitialized };
};

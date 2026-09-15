import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

import { AUTH_ME, AUTH_SCOPE } from "@/constants";
import { authEventEmitter, authEvents } from "@/events/auth";

export const useAuthInv = (queryClient: QueryClient) => {
  useEffect(() => {
    const onLogout = () => {
      queryClient.getMutationCache().clear();
      queryClient.removeQueries({ queryKey: AUTH_SCOPE });
    };

    const onUpdateMe = () => {
      queryClient.invalidateQueries({ queryKey: AUTH_ME, refetchType: "active" });
    };

    authEventEmitter.on(authEvents.LOGOUT, onLogout);
    authEventEmitter.on(authEvents.UPDATE_ME, onUpdateMe);

    return () => {
      authEventEmitter.off(authEvents.LOGOUT, onLogout);
      authEventEmitter.off(authEvents.UPDATE_ME, onUpdateMe);
    };
  }, [queryClient]);
};

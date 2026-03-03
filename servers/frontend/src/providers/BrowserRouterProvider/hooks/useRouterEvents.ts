import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { routerEventEmitter, routerEvents } from "@/events/router";

export function useRouterEvents() {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (payload: { to: string; replace?: boolean; state?: unknown }) => {
      if (payload.replace) {
        navigate(payload.to, { replace: true, state: payload.state });
      } else {
        navigate(payload.to, { state: payload.state });
      }
    },
    [navigate],
  );

  const handleNavigateReplace = useCallback(
    (payload: { to: string; state?: unknown }) => {
      navigate(payload.to, { replace: true, state: payload.state });
    },
    [navigate],
  );

  const handleNavigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    const onNavigate = (args: unknown) => handleNavigate(args as { to: string; replace?: boolean; state?: unknown });
    const onNavigateReplace = (args: unknown) => handleNavigateReplace(args as { to: string; state?: unknown });
    routerEventEmitter.on(routerEvents.NAVIGATE, onNavigate);
    routerEventEmitter.on(routerEvents.NAVIGATE_REPLACE, onNavigateReplace);
    routerEventEmitter.on(routerEvents.NAVIGATE_BACK, handleNavigateBack);

    return () => {
      routerEventEmitter.off(routerEvents.NAVIGATE, onNavigate);
      routerEventEmitter.off(routerEvents.NAVIGATE_REPLACE, onNavigateReplace);
      routerEventEmitter.off(routerEvents.NAVIGATE_BACK, handleNavigateBack);
    };
  }, [handleNavigate, handleNavigateReplace, handleNavigateBack]);
}

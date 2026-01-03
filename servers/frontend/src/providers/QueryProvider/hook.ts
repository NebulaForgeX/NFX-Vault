import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

import { cacheEventEmitter, cacheEvents } from "@/events";

/**
 * Hook to handle cache refresh events
 */
export function useCacheRefreshEvents(queryClient: QueryClient) {
  useEffect(() => {
    const handleRefreshCertificates = () => {
      // 刷新所有证书相关的查询
      queryClient.invalidateQueries({ queryKey: ["certs"], exact: false });
    };

    cacheEventEmitter.on(cacheEvents.REFRESH_CERTIFICATES, handleRefreshCertificates);

    return () => {
      cacheEventEmitter.off(cacheEvents.REFRESH_CERTIFICATES, handleRefreshCertificates);
    };
  }, [queryClient]);
}


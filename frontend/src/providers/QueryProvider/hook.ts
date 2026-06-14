import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

import { CERT_LIST } from "@/constants";
import { cacheEventEmitter, cacheEvents } from "@/events";

/**
 * Hook to handle cache refresh events
 */
export function useCacheRefreshEvents(queryClient: QueryClient) {
  useEffect(() => {
    const handleRefreshCertificates = () => {
      // 与 CERT_LIST / CERT_DETAIL 对齐：["cert", "list"|"item", "certificate", ...]
      queryClient.invalidateQueries({ queryKey: CERT_LIST.getPrefix, exact: false });
    };

    cacheEventEmitter.on(cacheEvents.REFRESH_CERTIFICATES, handleRefreshCertificates);

    return () => {
      cacheEventEmitter.off(cacheEvents.REFRESH_CERTIFICATES, handleRefreshCertificates);
    };
  }, [queryClient]);
}


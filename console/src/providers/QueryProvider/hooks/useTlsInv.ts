import type { QueryKey } from "@tanstack/react-query";

import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

import { TLS_DETAIL, TLS_LIST } from "@/constants";
import { tlsEventEmitter, tlsEvents } from "@/events/tls";

export const useTlsInv = (queryClient: QueryClient) => {
  useEffect(() => {
    const onInvalidate = (detailQueryKey?: QueryKey) => {
      queryClient.invalidateQueries({ queryKey: TLS_LIST.getPrefix, exact: false });
      if (detailQueryKey) {
        queryClient.invalidateQueries({ queryKey: detailQueryKey, exact: true });
      } else {
        queryClient.invalidateQueries({ queryKey: TLS_DETAIL.getPrefix, exact: false });
      }
    };

    tlsEventEmitter.on(tlsEvents.INVALIDATE_TLS, onInvalidate);

    return () => {
      tlsEventEmitter.off(tlsEvents.INVALIDATE_TLS, onInvalidate);
    };
  }, [queryClient]);
};

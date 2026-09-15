import type { QueryKey } from "@tanstack/react-query";

import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

import { CERT_DETAIL, CERT_LIST } from "@/constants";
import { certEventEmitter, certEvents } from "@/events/cert";

export const useCertInv = (queryClient: QueryClient) => {
  useEffect(() => {
    const onInvalidate = (detailQueryKey?: QueryKey) => {
      queryClient.invalidateQueries({ queryKey: CERT_LIST.getPrefix, exact: false });
      if (detailQueryKey) {
        queryClient.invalidateQueries({ queryKey: detailQueryKey, exact: true });
      } else {
        queryClient.invalidateQueries({ queryKey: CERT_DETAIL.getPrefix, exact: false });
      }
    };

    certEventEmitter.on(certEvents.INVALIDATE_CERTIFICATES, onInvalidate);

    return () => {
      certEventEmitter.off(certEvents.INVALIDATE_CERTIFICATES, onInvalidate);
    };
  }, [queryClient]);
};

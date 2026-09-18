import type { QueryKey } from "@tanstack/react-query";

import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

import { DNS_CREDENTIAL, DNS_DDNS_HOSTS, DNS_DOMAIN_LIST, DNS_HOSTS, DNS_OUTBOUND_IP } from "@/constants";
import { dnsEventEmitter, dnsEvents } from "@/events/dns";

export const useDnsInv = (queryClient: QueryClient) => {
  useEffect(() => {
    const onInvalidate = (detailQueryKey?: QueryKey) => {
      queryClient.invalidateQueries({ queryKey: DNS_CREDENTIAL.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_DOMAIN_LIST.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_DDNS_HOSTS.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: DNS_OUTBOUND_IP.getPrefix, exact: false });
      if (detailQueryKey) {
        queryClient.invalidateQueries({ queryKey: detailQueryKey, exact: true });
      } else {
        queryClient.invalidateQueries({ queryKey: DNS_HOSTS.getPrefix, exact: false });
      }
    };

    dnsEventEmitter.on(dnsEvents.INVALIDATE_DNS, onInvalidate);
    return () => {
      dnsEventEmitter.off(dnsEvents.INVALIDATE_DNS, onInvalidate);
    };
  }, [queryClient]);
};

import { createItemKey, createListKey } from "nfx-ui/constants";

import { DOMAIN_DNS, DOMAIN_DNS_CREDENTIAL, DOMAIN_DNS_DOMAIN, DOMAIN_DNS_HOST } from "./domain.key";

export const DNS_CREDENTIAL = createItemKey(DOMAIN_DNS, DOMAIN_DNS_CREDENTIAL);
export const DNS_DOMAIN_LIST = createListKey(DOMAIN_DNS, DOMAIN_DNS_DOMAIN);
export const DNS_HOSTS = createItemKey(DOMAIN_DNS, DOMAIN_DNS_HOST);
export const DNS_DDNS_HOSTS = createItemKey(DOMAIN_DNS, "ddns-host");
export const DNS_OUTBOUND_IP = createItemKey(DOMAIN_DNS, "outbound-ip");

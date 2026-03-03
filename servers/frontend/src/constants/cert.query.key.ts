/**
 * Cert query keys - 使用 nfx-ui createListKey / createItemKey / createKey
 */
import { createItemKey, createKey, createListKey } from "nfx-ui/constants";

import { DOMAIN_CERT, DOMAIN_CERT_CERTIFICATE, DOMAIN_CERT_SEARCH } from "./domain.key";

export const CERT_LIST = createListKey(DOMAIN_CERT, DOMAIN_CERT_CERTIFICATE);
export const CERT_DETAIL = createItemKey(DOMAIN_CERT, DOMAIN_CERT_CERTIFICATE);
export const CERT_SEARCH = createKey(DOMAIN_CERT, DOMAIN_CERT_SEARCH);

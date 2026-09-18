/**
 * TLS query keys - 使用 nfx-ui createListKey / createItemKey
 */
import { createItemKey, createListKey } from "nfx-ui/constants";

import { DOMAIN_TLS, DOMAIN_TLS_CERTIFICATE } from "./domain.key";

export const TLS_LIST = createListKey(DOMAIN_TLS, DOMAIN_TLS_CERTIFICATE);
export const TLS_DETAIL = createItemKey(DOMAIN_TLS, DOMAIN_TLS_CERTIFICATE);

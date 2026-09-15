import type { QueryKey } from "@tanstack/react-query";
import type { EventNamesOf } from "nfx-ui/events";

import { defineEvents, EventEmitter } from "nfx-ui/events";
import { singleton } from "nfx-ui/utils";

export const certEvents = defineEvents({
  INVALIDATE_CERTIFICATES: "CERT:INVALIDATE_CERTIFICATES",
});

type CertDomainEvent = EventNamesOf<typeof certEvents>;

class CertDomainEmitter extends EventEmitter<CertDomainEvent> {
  constructor() {
    super(certEvents);
  }

  invalidateCertificates(detailQueryKey?: QueryKey) {
    this.emit(certEvents.INVALIDATE_CERTIFICATES, detailQueryKey);
  }
}

export const certEventEmitter = new (singleton(CertDomainEmitter))();

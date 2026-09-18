import type { QueryKey } from "@tanstack/react-query";
import type { EventNamesOf } from "nfx-ui/events";

import { defineEvents, EventEmitter } from "nfx-ui/events";
import { singleton } from "nfx-ui/utils";

export const dnsEvents = defineEvents({
  INVALIDATE_DNS: "DNS:INVALIDATE_DNS",
});

type DnsDomainEvent = EventNamesOf<typeof dnsEvents>;

class DnsDomainEmitter extends EventEmitter<DnsDomainEvent> {
  constructor() {
    super(dnsEvents);
  }

  invalidateDns(detailQueryKey?: QueryKey) {
    this.emit(dnsEvents.INVALIDATE_DNS, detailQueryKey);
  }
}

export const dnsEventEmitter = new (singleton(DnsDomainEmitter))();

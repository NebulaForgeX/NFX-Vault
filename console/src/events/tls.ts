import type { QueryKey } from "@tanstack/react-query";
import type { EventNamesOf } from "nfx-ui/events";

import { defineEvents, EventEmitter } from "nfx-ui/events";
import { singleton } from "nfx-ui/utils";

export const tlsEvents = defineEvents({
  INVALIDATE_TLS: "TLS:INVALIDATE_TLS",
});

type TlsDomainEvent = EventNamesOf<typeof tlsEvents>;

class TlsDomainEmitter extends EventEmitter<TlsDomainEvent> {
  constructor() {
    super(tlsEvents);
  }

  invalidateTls(detailQueryKey?: QueryKey) {
    this.emit(tlsEvents.INVALIDATE_TLS, detailQueryKey);
  }
}

export const tlsEventEmitter = new (singleton(TlsDomainEmitter))();

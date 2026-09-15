import type { EventNamesOf } from "nfx-ui/events";

import { defineEvents, EventEmitter } from "nfx-ui/events";
import { singleton } from "nfx-ui/utils";

export const fileEvents = defineEvents({
  INVALIDATE_DIRECTORY: "FILE:INVALIDATE_DIRECTORY",
});

type FileDomainEvent = EventNamesOf<typeof fileEvents>;

class FileDomainEmitter extends EventEmitter<FileDomainEvent> {
  constructor() {
    super(fileEvents);
  }

  invalidateDirectory() {
    this.emit(fileEvents.INVALIDATE_DIRECTORY);
  }
}

export const fileEventEmitter = new (singleton(FileDomainEmitter))();

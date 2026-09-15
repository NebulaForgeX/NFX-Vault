import type { EventNamesOf } from "nfx-ui/events";

import { defineEvents, EventEmitter } from "nfx-ui/events";
import { singleton } from "nfx-ui/utils";

export const authEvents = defineEvents({
  LOGOUT: "AUTH:LOGOUT",
  UPDATE_ME: "AUTH:UPDATE_ME",
});

type AuthDomainEvent = EventNamesOf<typeof authEvents>;

class AuthDomainEmitter extends EventEmitter<AuthDomainEvent> {
  constructor() {
    super(authEvents);
  }

  logout() {
    this.emit(authEvents.LOGOUT);
  }

  updateMe() {
    this.emit(authEvents.UPDATE_ME);
  }
}

export const authEventEmitter = new (singleton(AuthDomainEmitter))();

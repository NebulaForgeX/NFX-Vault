import type { EventNamesOf } from "nfx-ui/events";
import { defineEvents, EventEmitter } from "nfx-ui/events";
import { singleton } from "nfx-ui/utils";

/**
 * 路由导航事件 - 与 Sjgz-Admin 一致，统一通过事件跳转，由 BrowserRouterProvider 订阅执行
 */
export const routerEvents = defineEvents({
  NAVIGATE: "ROUTER:NAVIGATE",
  NAVIGATE_REPLACE: "ROUTER:NAVIGATE_REPLACE",
  NAVIGATE_BACK: "ROUTER:NAVIGATE_BACK",
});

type RouterEvent = EventNamesOf<typeof routerEvents>;

interface NavigatePayload {
  to: string;
  replace?: boolean;
  state?: unknown;
}

class RouterEventEmitter extends EventEmitter<RouterEvent> {
  constructor() {
    super(routerEvents);
  }

  navigate(payload: NavigatePayload) {
    this.emit(routerEvents.NAVIGATE, payload);
  }

  navigateReplace(to: string, state?: unknown) {
    this.emit(routerEvents.NAVIGATE_REPLACE, { to, state });
  }

  navigateBack() {
    this.emit(routerEvents.NAVIGATE_BACK);
  }
}

/** 单例导出 */
export const routerEventEmitter = new (singleton(RouterEventEmitter))();

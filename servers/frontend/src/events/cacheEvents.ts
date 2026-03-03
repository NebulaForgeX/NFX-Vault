import { EventEmitter, defineEvents, type EventNamesOf } from "nfx-ui/events";
import { singleton } from "nfx-ui/utils";

/**
 * 缓存事件（与 Sjgz-Admin 一致：使用 nfx-ui/events + singleton）
 */
export const cacheEvents = defineEvents({
  REFRESH_CERTIFICATES: "CACHE:REFRESH_CERTIFICATES",
});

type CacheEvent = EventNamesOf<typeof cacheEvents>;

class CacheEventEmitter extends EventEmitter<CacheEvent> {
  constructor() {
    super(cacheEvents);
  }
}

/** 单例导出 */
export const cacheEventEmitter = new (singleton(CacheEventEmitter))();

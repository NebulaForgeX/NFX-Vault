/**
 * Cache Events
 * 
 * 事件系统用于触发 React Query 缓存刷新
 */

export const cacheEvents = {
  REFRESH_CERTIFICATES: "CACHE:REFRESH_CERTIFICATES",
} as const;

type CacheEvent = (typeof cacheEvents)[keyof typeof cacheEvents];

class CacheEventEmitter {
  private listeners: Record<CacheEvent, Set<Function>> = {
    [cacheEvents.REFRESH_CERTIFICATES]: new Set<Function>(),
  };

  on(event: CacheEvent, callback: Function) {
    this.listeners[event].add(callback);
  }

  off(event: CacheEvent, callback: Function) {
    this.listeners[event].delete(callback);
  }

  emit(event: CacheEvent, ...args: unknown[]) {
    this.listeners[event].forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in cache event listener for ${event}:`, error);
      }
    });
  }
}

export const cacheEventEmitter = new CacheEventEmitter();


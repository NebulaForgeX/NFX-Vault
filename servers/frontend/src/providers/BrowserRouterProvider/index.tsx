import type { ReactNode } from "react";

import { BrowserRouter } from "react-router-dom";

import { useRouterEvents } from "./hooks/useRouterEvents";

interface BrowserRouterProviderProps {
  children: ReactNode;
}

function RouterEventsHandler({ children }: { children: ReactNode }) {
  useRouterEvents();
  return <>{children}</>;
}

/**
 * 统一处理路由导航事件（与 Sjgz-Admin 一致）
 * 跳转通过 routerEventEmitter.navigate，由本 Provider 订阅执行
 */
export function BrowserRouterProvider({ children }: BrowserRouterProviderProps) {
  return (
    <BrowserRouter>
      <RouterEventsHandler>{children}</RouterEventsHandler>
    </BrowserRouter>
  );
}

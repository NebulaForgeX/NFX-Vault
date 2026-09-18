import type { ReactNode } from "react";

import { DataProvider as NfxDataProvider } from "nfx-ui/providers";

export interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  return <NfxDataProvider>{children}</NfxDataProvider>;
}

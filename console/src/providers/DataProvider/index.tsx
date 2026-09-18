import type { ReactNode } from "react";

import { DataProvider as NfxDataProvider } from "nfx-ui/providers";

import { VaultRepositoriesContext, vaultRepositories } from "@/apis/repositories";

export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <NfxDataProvider>
      <VaultRepositoriesContext.Provider value={vaultRepositories}>{children}</VaultRepositoriesContext.Provider>
    </NfxDataProvider>
  );
}

import type { ReactNode } from "react";

import { vaultRepositories, VaultRepositoriesContext } from "@/apis/repositories";

export interface DataProviderProps {
  children: ReactNode;
}

export function VaultDataProvider({ children }: DataProviderProps) {
  return <VaultRepositoriesContext.Provider value={vaultRepositories}>{children}</VaultRepositoriesContext.Provider>;
}

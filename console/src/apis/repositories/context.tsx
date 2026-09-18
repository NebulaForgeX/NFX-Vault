import type { VaultRepositories } from "./types";

import { createContext, useContext } from "react";

export const VaultRepositoriesContext = createContext<VaultRepositories | null>(null);

export function useVaultRepositories(): VaultRepositories {
  const ctx = useContext(VaultRepositoriesContext);
  if (!ctx) throw new Error("useVaultRepositories must be used inside product DataProvider");
  return ctx;
}

export function useTlsRepository() {
  return useVaultRepositories().tls;
}

export function useFileRepository() {
  return useVaultRepositories().file;
}

export function useAnalysisRepository() {
  return useVaultRepositories().analysis;
}

export function useSystemRepository() {
  return useVaultRepositories().system;
}

export function useDnsRepository() {
  return useVaultRepositories().dns;
}

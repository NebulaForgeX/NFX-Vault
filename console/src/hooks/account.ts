import { useQuery } from "@tanstack/react-query";
import { useAuthRepository } from "nfx-ui/apis";
import { useAuthStore } from "nfx-ui/stores";

export function vaultAccountQueryKey(kind: string | null | undefined) {
  return ["vault-account-me", kind] as const;
}

export function useVaultAccount() {
  const auth = useAuthRepository();
  const kind = useAuthStore((s) => s.currentProfileKind);
  return useQuery({
    queryKey: vaultAccountQueryKey(kind),
    queryFn: () => auth.GetCurrentFullAccountInformationWithProfile(kind),
    enabled: Boolean(kind),
  });
}

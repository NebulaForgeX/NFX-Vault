import type { Profile } from "nfx-ui/types";

export type VaultAccountInfo =
  | Profile.Response.FullAccountInformationWithForgerProfile
  | Profile.Response.FullAccountInformationWithAuthorityProfile;

export function identityProfileOf(data: VaultAccountInfo | null | undefined) {
  if (!data) return undefined;
  if ("forgerProfile" in data) return data.forgerProfile;
  if ("authorityProfile" in data) return data.authorityProfile;
  return undefined;
}

export function activeAvatarOf(profile: ReturnType<typeof identityProfileOf>) {
  return profile?.avatars?.find((row: Profile.Response.ProfileAvatar) => row.isActive) ?? profile?.avatars?.[0];
}

export function primaryEmailOf(data: VaultAccountInfo | null | undefined): string {
  const emails = data?.emails ?? [];
  return emails.find((row) => row.isPrimary)?.email ?? emails[0]?.email ?? "—";
}

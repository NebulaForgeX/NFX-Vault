import type { Nullable } from "nfx-ui/types";

/** 与后端 `VaultUser.to_public_dict` + axios-case-converter 对齐 */

export interface VaultUser {
  id: string;
  email: string;
  displayName: string;
  avatarImageId: Nullable<string>;
  createdAt: string;
}

export interface LoginResponsePayload {
  token: string;
  refreshToken: string;
  user: VaultUser;
}

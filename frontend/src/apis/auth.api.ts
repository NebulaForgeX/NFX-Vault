import type { DataResponse } from "nfx-ui/types";
import { safeOr } from "nfx-ui/utils";
import type { LoginResponsePayload, VaultUser } from "@/types/auth.types";

import { protectedClient, publicClient } from "@/apis/clients";
import { URL_PATHS } from "@/apis/ip";

export async function SendSignupVerificationCode(params: { email: string }): Promise<void> {
  await publicClient.post<DataResponse<null>>(URL_PATHS.AUTH.signupSendCode, params);
}

export async function Signup(params: {
  email: string;
  password: string;
  verificationCode: string;
  displayName?: string;
}): Promise<LoginResponsePayload> {
  const { data } = await publicClient.post<DataResponse<LoginResponsePayload>>(URL_PATHS.AUTH.signup, params);
  return data.data!;
}

export async function LoginByEmail(params: { email: string; password: string }): Promise<LoginResponsePayload> {
  const { data } = await publicClient.post<DataResponse<LoginResponsePayload>>(URL_PATHS.AUTH.loginEmail, params);
  return data.data!;
}

export async function RefreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const { data } = await publicClient.post<DataResponse<{ token: string; refreshToken: string }>>(URL_PATHS.AUTH.refresh, {
    refreshToken,
  });
  const d = data.data!;
  return { accessToken: d.token, refreshToken: safeOr(d.refreshToken, "") };
}

export async function GetMe(): Promise<VaultUser> {
  const { data } = await protectedClient.get<DataResponse<VaultUser>>(URL_PATHS.AUTH.me);
  return data.data!;
}

export type UpdateMeParams = {
  displayName?: string;
  /** 上传接口返回的 id；`null` 表示清除头像（删库删文件） */
  avatarImageId?: string | null;
};

export async function UpdateMe(params: UpdateMeParams): Promise<VaultUser> {
  const { data } = await protectedClient.put<DataResponse<VaultUser>>(URL_PATHS.AUTH.me, params);
  return data.data!;
}

export async function UploadAvatarTmp(file: File): Promise<{ imageId: string }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await protectedClient.post<DataResponse<{ imageId: string }>>(URL_PATHS.AUTH.avatarUpload, form);
  return { imageId: data.data!.imageId };
}

export async function UpdateMyPassword(params: { oldPassword: string; newPassword: string }): Promise<void> {
  await protectedClient.put<DataResponse<null>>(URL_PATHS.AUTH.mePassword, params);
}

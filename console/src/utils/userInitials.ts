import { safeOr, safeStringable } from "nfx-ui/utils";

/** 展示名 + 邮箱 → 两字母缩写（与 Account 页一致） */
export function initialsFrom(displayName: string, email: string): string {
  const n = safeStringable(displayName).trim();
  if (n.length >= 2) return n.slice(0, 2).toUpperCase();
  if (n.length === 1) return `${n.toUpperCase()}${(email[0] ?? "?").toUpperCase()}`;
  const local: string = safeOr(email.split("@")[0], "");
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  if (local.length === 1) return `${local.toUpperCase()}?`;
  return "?";
}

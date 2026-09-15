/**
 * Vault 通用信息类型 — 与 Pqttec-Admin `types/info` 类似，保留轻量工具类型。
 */
import type { ValueOf } from "nfx-ui/types";

export type UUID = string;
export type Timestamp = string;

export const SearchTypeEnum = {
  Suggestion: "suggestion",
  History: "history",
  Frequent: "frequent",
} as const;

export type SearchTypeEnumType = ValueOf<typeof SearchTypeEnum>;

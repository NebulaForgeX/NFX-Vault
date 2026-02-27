import type { ValueOf } from "@/utils/types";

export type UUID = string;
export type Timestamp = string;

// Vault 通用信息类型（与 NFX-Identity/console types/info 结构对齐）
export const SearchTypeEnum = {
  Suggestion: "suggestion",
  History: "history",
  Frequent: "frequent",
} as const;

export type SearchTypeEnumType = ValueOf<typeof SearchTypeEnum>;

/**
 * File delete item type — request field `itemType` (axios-case-converter).
 */
import { safeEnum } from "nfx-ui/utils";

export enum FileItemTypeEnum {
  FILE = "file",
  FOLDER = "folder",
}

export const DEFAULT_FILE_ITEM_TYPE = FileItemTypeEnum.FILE;
export const FILE_ITEM_TYPE_VALUES = Object.values(FileItemTypeEnum);
export const FileItemType = (value: string | null | undefined) =>
  safeEnum(value, FILE_ITEM_TYPE_VALUES, DEFAULT_FILE_ITEM_TYPE);

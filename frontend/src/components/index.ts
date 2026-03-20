/**
 * 公共组件：从 nfx-ui 再导出；本地含 IconButton / BackButton / PrimaryButton / SecondaryButton（与 Pqttec-Admin 一致）。
 */
export type {
  ButtonProps,
  DropdownOption,
  DropdownProps,
  IconName,
  IconProps,
  InputProps,
  SearchInputProps,
  ShowFilterProps,
  ShowFilterValue,
  SuspenseProps,
  VirtualListProps,
  VirtualWindowListProps,
} from "nfx-ui/components";

export {
  Button,
  Dropdown,
  Icon,
  Input,
  SearchInput,
  ShowFilter,
  SlideDownSwitcher,
  Suspense,
  VirtualList,
  VirtualWindowList,
} from "nfx-ui/components";

export { BounceLoading, ECGLoading, TruckLoading } from "nfx-ui/animations";

export { default as IconButton } from "./IconButton";
export type { IconButtonProps } from "./IconButton";
export { default as BackButton } from "./BackButton";
export type { BackButtonProps } from "./BackButton";
export { default as PrimaryButton } from "./PrimaryButton";
export type { PrimaryButtonProps } from "./PrimaryButton";
export { default as SecondaryButton } from "./SecondaryButton";
export type { SecondaryButtonProps } from "./SecondaryButton";

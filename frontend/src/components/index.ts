/**
 * 公共组件：与 Pqttec-Admin 一致——从 nfx-ui 再导出；本地仅 IconButton / BackButton。
 */
export { default as IconButton } from "./IconButton";
export type { IconButtonProps } from "./IconButton";
export { default as BackButton } from "./BackButton";
export type { BackButtonProps } from "./BackButton";

export type {
  ButtonProps,
  DropdownOption,
  DropdownProps,
  IconName,
  IconProps,
  InputProps,
  KeyValueEditorProps,
  KeyValuePair,
  SearchInputProps,
  ShowFilterProps,
  ShowFilterValue,
  SlideDownSwitcherProps,
  SliderProps,
  SuspenseProps,
  TextareaProps,
  VirtualListProps,
  VirtualWindowListProps,
} from "nfx-ui/components";

export {
  Button,
  Dropdown,
  Icon,
  Input,
  KeyValueEditor,
  SearchInput,
  ShowFilter,
  SlideDownSwitcher,
  Slider,
  Suspense,
  Textarea,
  VirtualList,
  VirtualWindowList,
} from "nfx-ui/components";

export { BounceLoading, ECGLoading, TruckLoading } from "nfx-ui/animations";

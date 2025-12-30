import { createStore, useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type ModalType = "success" | "error" | "info" | "confirm" | "search" | "loading" | "file";

interface BaseModalProps {
  isOpen: boolean;
  message?: string;
  title?: string;
  confirmText?: string;
  onClick?: () => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  message?: string;
  title?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  title?: string;
}

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  title?: string;
}

interface FileModalProps {
  isOpen: boolean;
  store?: "apis" | "websites";
  folderPath?: string;
  folderName?: string;
  filePath?: string; // 文件路径（如果设置，则显示文件内容）
  fileName?: string; // 文件名
}

interface ModalState {
  modalType: ModalType;
  baseModal: BaseModalProps;
  confirmModal: ConfirmModalProps;
  searchModal: SearchModalProps;
  loadingModal: LoadingModalProps;
  fileModal: FileModalProps;
}

interface ModalActions {
  showModal: (
    modalType: ModalType,
    props:
      | BaseModalProps
      | ConfirmModalProps
      | SearchModalProps
      | LoadingModalProps
      | FileModalProps
  ) => void;
  hideModal: (modalType?: ModalType) => void; // undefined 表示关闭所有模态框
  showFileModal: (props: FileModalProps) => void;
}

const defaultBaseModalProps: BaseModalProps = {
  isOpen: false,
  message: "No message",
  title: "No title",
  confirmText: "Confirm",
  onClick: undefined,
};
const defaultConfirmModalProps: ConfirmModalProps = {
  isOpen: false,
  message: "",
  title: undefined,
  onConfirm: undefined,
  onCancel: undefined,
  confirmText: "Confirm",
  cancelText: "Cancel",
};
const defaultSearchModalProps: SearchModalProps = {
  isOpen: false,
  title: "Search",
};
const defaultLoadingModalProps: LoadingModalProps = {
  isOpen: false,
  message: undefined,
  title: undefined,
};

const defaultFileModalProps: FileModalProps = {
  isOpen: false,
  store: undefined,
  folderPath: undefined,
  folderName: undefined,
  filePath: undefined,
  fileName: undefined,
};

export const ModalStore = createStore<ModalState & ModalActions>()(
  subscribeWithSelector((set) => ({
    modalType: "info",
    baseModal: defaultBaseModalProps,
    confirmModal: defaultConfirmModalProps,
    searchModal: defaultSearchModalProps,
    loadingModal: defaultLoadingModalProps,
    fileModal: defaultFileModalProps,

    showModal: (modalType, props) => {
      // 根据 modalType 设置对应的模态框状态
      if (modalType === "success" || modalType === "error" || modalType === "info") {
        const { isOpen, ...restProps } = props as BaseModalProps;
        set({
          modalType,
          baseModal: {
            isOpen: true,
            ...restProps,
          },
        });
      } else if (modalType === "confirm") {
        const { isOpen, ...restProps } = props as ConfirmModalProps;
        set({
          modalType,
          confirmModal: {
            isOpen: true,
            ...restProps,
          },
        });
      } else if (modalType === "search") {
        const { isOpen, ...restProps } = props as SearchModalProps;
        set({
          modalType,
          searchModal: {
            isOpen: true,
            ...restProps,
          },
        });
      } else if (modalType === "loading") {
        const { isOpen, ...restProps } = props as LoadingModalProps;
        set({
          modalType,
          loadingModal: {
            isOpen: true,
            ...restProps,
          },
        });
      } else if (modalType === "file") {
        const { isOpen, ...restProps } = props as FileModalProps;
        set({
          modalType,
          fileModal: {
            isOpen: true,
            ...restProps,
          },
        });
      }
    },

    showFileModal: (props) => {
      const { isOpen, ...restProps } = props;
      set({
        modalType: "file",
        fileModal: {
          isOpen: true,
          ...restProps,
        },
      });
    },

    hideModal: (modalType) => {
      // 如果 modalType 为 undefined，关闭所有模态框
      if (modalType === undefined) {
        set({
          modalType: undefined,
          baseModal: defaultBaseModalProps,
          confirmModal: defaultConfirmModalProps,
          searchModal: defaultSearchModalProps,
          loadingModal: defaultLoadingModalProps,
          fileModal: defaultFileModalProps,
        });
        return;
      }
      // 根据 modalType 只关闭对应的模态框
      if (modalType === "success" || modalType === "error" || modalType === "info") {
        set({
          modalType: undefined,
          baseModal: defaultBaseModalProps,
        });
      } else if (modalType === "confirm") {
        set({
          modalType: undefined,
          confirmModal: defaultConfirmModalProps,
        });
      } else if (modalType === "search") {
        set({
          modalType: undefined,
          searchModal: defaultSearchModalProps,
        });
      } else if (modalType === "loading") {
        set({
          modalType: undefined,
          loadingModal: defaultLoadingModalProps,
        });
      } else if (modalType === "file") {
        set({
          modalType: undefined,
          fileModal: defaultFileModalProps,
        });
      }
    },
  })),
);

export default ModalStore;
export const useModalStore = <T>(selector: (state: ModalState) => T) => useStore(ModalStore, selector);

export const showInfo = (message: string, title?: string) => {
  ModalStore.getState().showModal("info", {
    isOpen: true,
    message,
    title,
  });
};

export interface ShowSuccessProps {
  message: string;
  title?: string;
  onClick?: () => void;
}

export const showSuccess = (props: ShowSuccessProps | string) => {
  // 兼容旧的字符串参数形式
  if (typeof props === "string") {
    ModalStore.getState().showModal("success", {
      isOpen: true,
      message: props,
    });
    return;
  }

  ModalStore.getState().showModal("success", {
    isOpen: true,
    message: props.message,
    title: props.title,
    onClick: props.onClick,
  });
};

export const showError = (message: string, title?: string) => {
  ModalStore.getState().showModal("error", {
    isOpen: true,
    message,
    title,
  });
};

export interface ShowConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export const showConfirm = (props: ShowConfirmProps) => {
  ModalStore.getState().showModal("confirm", {
    isOpen: true,
    message: props.message,
    title: props.title,
    onConfirm: props.onConfirm,
    onCancel: props.onCancel,
    confirmText: props.confirmText,
    cancelText: props.cancelText,
  });
};

export const showSearch = () => {
  ModalStore.getState().showModal("search", {
    isOpen: true,
  });
};

export interface ShowLoadingProps {
  message?: string;
  title?: string;
}

export const showLoading = (props?: ShowLoadingProps) => {
  ModalStore.getState().showModal("loading", {
    isOpen: true,
    message: props?.message,
    title: props?.title,
  });
};

export const hideLoading = () => {
  ModalStore.getState().hideModal("loading");
};
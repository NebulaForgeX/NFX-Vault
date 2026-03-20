// 环境变量类型定义
declare global {
  interface ImportMetaEnv {
    readonly VITE_BUILD_ENV: "dev" | "prod";
    readonly VITE_APP_ID: string;
    readonly VITE_API_URL: string;
    readonly VITE_WS_URL: string;
    readonly VITE_IMAGE_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};

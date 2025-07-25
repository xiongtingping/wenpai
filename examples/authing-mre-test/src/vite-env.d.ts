/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_AUTHING_APP_ID: string;
  readonly VITE_AUTHING_USERPOOL_ID: string;
  readonly VITE_AUTHING_HOST: string;
  readonly VITE_AUTHING_REDIRECT_URI: string;
  [key: string]: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
} 
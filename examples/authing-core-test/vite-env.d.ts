/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTHING_APP_ID: string
  readonly VITE_AUTHING_HOST: string
  readonly VITE_AUTHING_REDIRECT_URI: string
  readonly VITE_AUTHING_USER_POOL_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 
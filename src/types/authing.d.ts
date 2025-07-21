// 扩展 Authing SDK/Guard 的类型定义，支持 oidcOrigin

declare module '@authing/web' {
  interface AuthingOptions {
    oidcOrigin?: string;
  }
}
declare module '@authing/guard-react' {
  interface GuardOptions {
    oidcOrigin?: string;
  }
} 
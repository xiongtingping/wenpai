/**
 * Authing Guard 类型定义
 */

declare module '@authing/guard-react' {
  export interface GuardConfig {
    appId: string;
    mode?: 'modal' | 'normal';
    host?: string;
    requestHostname?: string;
    redirectUri?: string;
    defaultScene?: string;
    lang?: string;
  }

  export interface LoginByPasswordParams {
    username?: string;
    email?: string;
    password: string;
  }

  export interface LoginByPhoneCodeParams {
    phone: string;
    code: string;
  }

  export interface RegisterByEmailCodeParams {
    email: string;
    code: string;
    password?: string;
    nickname?: string;
  }

  export interface RegisterByPhoneCodeParams {
    phone: string;
    code: string;
    password?: string;
    nickname?: string;
  }

  export interface UpdateProfileParams {
    nickname?: string;
    photo?: string;
    avatar?: string;
  }

  export interface SendEmailCodeParams {
    email: string;
    scene?: string;
  }

  export interface SendSmsCodeParams {
    phone: string;
    scene?: string;
  }

  export class Guard {
    constructor(config: GuardConfig);
    
    show(): void;
    hide(): void;
    
    loginByPassword(params: LoginByPasswordParams): Promise<any>;
    loginByPhoneCode(params: LoginByPhoneCodeParams): Promise<any>;
    
    registerByEmailCode(params: RegisterByEmailCodeParams): Promise<any>;
    registerByPhoneCode(params: RegisterByPhoneCodeParams): Promise<any>;
    
    updateProfile(params: UpdateProfileParams): Promise<any>;
    
    sendEmailCode(params: SendEmailCodeParams): Promise<void>;
    sendSmsCode(params: SendSmsCodeParams): Promise<void>;
    
    refreshToken(): Promise<void>;
    logout(): Promise<void>;
    
    checkLoginStatus(): Promise<boolean>;
    trackSession(): Promise<any>;
    
    handleRedirectCallback(): Promise<void>;
    startWithRedirect(): Promise<void>;
    
    unmount(): void;
    
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback?: (data: any) => void): void;
  }

  export default Guard;
} 
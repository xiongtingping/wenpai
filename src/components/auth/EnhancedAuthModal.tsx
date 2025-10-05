import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { AuthenticationClient } from 'authing-js-sdk';
import { ThemeAwareLogo } from '@/components/ui/ThemeAwareLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  name?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AppInput = (props: InputProps) => {
  const { label, placeholder, icon, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full auth-input-container relative">
      {label && 
        <label className='block mb-2 text-sm font-medium text-foreground'>
          {label}
        </label>
      }
      <div className="relative w-full">
        <input
          className="peer relative z-10 border-2 border-border h-12 w-full rounded-md bg-background px-4 font-normal outline-none transition-all duration-200 ease-in-out focus:border-primary focus:bg-background placeholder:text-muted-foreground text-foreground"
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 auth-border-top z-20 rounded-t-md overflow-hidden"
              style={{
                background: `radial-gradient(var(--auth-gradient-size) circle at ${mousePosition.x}px 0, hsl(var(--primary)) 0%, transparent 70%)`,
              } as React.CSSProperties}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 auth-border-bottom z-20 rounded-b-md overflow-hidden"
              style={{
                background: `radial-gradient(var(--auth-gradient-size) circle at ${mousePosition.x}px var(--auth-border-height), hsl(var(--primary)) 0%, transparent 70%)`,
              } as React.CSSProperties}
            />
          </>
        )}
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
};

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const EnhancedAuthModal: React.FC<EnhancedAuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login'
}) => {
  const { t } = useTranslation();
  const { handleAuthingLogin } = useUnifiedAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [error, setError] = useState<string | null>(null);
  const [loginContact, setLoginContact] = useState('');
  const [registerContact, setRegisterContact] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password');
  const [registerMethod, setRegisterMethod] = useState<'password' | 'code'>('password');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // ✅ SECURITY FIX: 2025-08-30 使用环境变量配置
  const authClient = new AuthenticationClient({
    appId: import.meta.env.VITE_AUTHING_APP_ID || (globalThis as any).__ENV__?.VITE_AUTHING_APP_ID,
    appHost: import.meta.env.VITE_AUTHING_HOST || (globalThis as any).__ENV__?.VITE_AUTHING_HOST,
  });

  const detectContactType = (contact: string) => {
    if (contact.includes('@')) return 'email';
    if (/^1[3-9]\d{9}$/.test(contact)) return 'phone';
    return 'username';
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const identifier = formData.get('identifier') as string;
      const rememberMe = formData.get('rememberMe') === 'on';

      console.log('🔐 starts增强loginformlogin...', { rememberMe });

      let result;
      if (loginMethod === 'password') {
        const password = formData.get('password') as string;
        const contactType = detectContactType(identifier);
        
        if (contactType === 'email') {
          result = await authClient.loginByEmail(identifier, password);
        } else if (contactType === 'phone') {
          result = await authClient.loginByPhonePassword(identifier, password);
        } else {
          result = await authClient.loginByUsername(identifier, password);
        }
      } else {
        const code = formData.get('code') as string;
        const contactType = detectContactType(identifier);
        
        if (contactType === 'email') {
          result = await authClient.loginByEmailCode(identifier, code);
        } else if (contactType === 'phone') {
          result = await authClient.loginByPhoneCode(identifier, code);
        } else {
          throw new Error(t('components.errors.验证码登录仅支持邮箱或手机号'));
        }
      }

      if (result) {
        console.log(t('components.status.登录成功_hd3'), result);
        
        // 处理记住登录状态
        if (rememberMe) {
          // 设置较长的token过期时间（30天）
          localStorage.setItem('wenpai-remember-login', 'true');
          localStorage.setItem('wenpai-login-timestamp', Date.now().toString());
        } else {
          localStorage.removeItem('wenpai-remember-login');
          localStorage.removeItem('wenpai-login-timestamp');
        }
        
        handleAuthingLogin(result);
        onClose();
      }
    } catch (error: any) {
      console.error(t('components.error.登录失败_6dn'), error);
      const errorMessage = error.message || error.code || t('components.error.未知错误');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const contact = formData.get('contact') as string;
      
      console.log('📝 starts增强registerformregister...');

      let result;
      const contactType = detectContactType(contact);
      
      if (registerMethod === 'password') {
        const password = formData.get('password') as string;
        
        if (contactType === 'email') {
          result = await authClient.registerByEmail(contact, password);
        } else if (contactType === 'phone') {
          result = await authClient.registerByPhoneCode(contact, password);
        } else {
          throw new Error(t('components.errors.注册请使用邮箱或手机号'));
        }
      } else {
        const code = formData.get('code') as string;
        const password = formData.get('password') as string;

        // 清理验证码（去除空格和特殊字符）
        const cleanCode = code.trim().replace(/\s+/g, '');
        console.log('🔍 EnhancedAuthModalvalidating码info:', {
          原始验证码: code,
          清理后验证码: cleanCode,
          验证码长度: cleanCode.length,
          联系方式: contact
        });

        if (contactType === 'email' || contactType === 'phone') {
          result = await authClient.registerByPhoneCode(contact, cleanCode, password);
        } else {
          throw new Error(t('components.errors.验证码注册请使用邮箱或手机号'));
        }
      }

      if (result) {
        console.log('✅ registersuccess:', result);
        handleAuthingLogin(result);
        onClose();
      }
    } catch (error: any) {
      console.error(t('components.error.注册失败_aj2'), error);
      console.error(t('components.error.Enhanc_c0s'), {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        response: error?.response?.data,
        stack: error?.stack?.split('\n')[0] // 只显示第一行堆栈
      });
      const errorMessage = error.message || error.code || t('components.error.未知错误');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (contact: string, type: 'login' | 'register' | 'reset') => {
    try {
      setError(null);
      console.log('📧 sendingvalidating码...');
      
      if (contact.includes('@')) {
        // 邮箱验证码 - 使用统一的验证码服务
        const { verificationCodeService } = await import('@/services/verificationCodeService');
        // 🔧 FIX: 注册时使用LOGIN场景发送验证码，因为registerByEmailCode可能期望LOGIN类型的验证码
        const scene = type === 'register' ? 'LOGIN' : type.toUpperCase();
        const result = await verificationCodeService.sendEmailCode(contact, scene);
        if (!result.success) {
          throw new Error(result.message);
        }
      } else {
        // 手机验证码 - 使用统一的验证码服务
        const { verificationCodeService } = await import('@/services/verificationCodeService');
        const result = await verificationCodeService.sendSmsCode(contact, type.toUpperCase());
        if (!result.success) {
          throw new Error(result.message);
        }
      }
      
      console.log(t('components.status.验证码发送成_sgt'));
    } catch (error: any) {
      console.error(t('components.error.验证码发送失_ybt'), error);
      setError(error.message || t('components.error.未知错误'));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const contact = formData.get('contact') as string;
      const code = formData.get('code') as string;
      const newPassword = formData.get('newPassword') as string;

      console.log('🔐 startsresettingpassword...');

      let result;
      if (contact.includes('@')) {
        // 使用邮箱重置密码
        // 🔧 FIXED: 使用正确的API方法名
        result = await authClient.resetPasswordByEmailCode(contact, code, newPassword);
      } else {
        // 使用手机号重置密码
        // 🔧 FIXED: 使用正确的API方法名
        result = await authClient.resetPasswordByPhoneCode(contact, code, newPassword);
      }

      if (result) {
        console.log(t('components.status.密码重置成功_rnd'));
        setShowForgotPassword(false);
        setActiveTab('login');
      }
    } catch (error: any) {
      console.error(t('components.error.密码重置失败_j4a'), error);
      setError(error.message || t('components.error.未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>文派 认证</DialogTitle>
          <DialogDescription>
            登录或注册您的文派账户
          </DialogDescription>
        </DialogHeader>
        <div className="flex auth-modal-container">
          {/* 左侧表单区域 */}
          <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {activeTab === 'login' ? '欢迎回来' : '加入文派'}
                </h1>
                <p className="text-muted-foreground">
                  {activeTab === 'login' ? '登录您的账户继续使用' : '创建账户开始您的AI创作之旅'}
                </p>
              </div>

              {error && (
                <div className="text-destructive text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                  {error}
                </div>
              )}

              {!showForgotPassword ? (
                <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
                  <TabsList className="unified-tabs-list grid w-full grid-cols-2">
                    <TabsTrigger value="login" className="unified-tab-trigger">登录</TabsTrigger>
                    <TabsTrigger value="register" className="unified-tab-trigger">注册</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center border border-border rounded-lg p-1">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${
                            loginMethod === 'password'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => setLoginMethod('password')}
                        >
                          密码登录
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${
                            loginMethod === 'code'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => setLoginMethod('code')}
                        >
                          验证码登录
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <AppInput
                        name="identifier"
                        type="text"
                        placeholder="手机号"
                        label="手机号"
        autoComplete="username"
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginContact(e.target.value)}
                      />
                      
                      {loginMethod === 'password' ? (
                        <AppInput
                          name="password"
                          type="password"
                          placeholder="请输入密码"
                          label={t('components.labels.密码')}
                          autoComplete="current-password"
                          required
                        />
                      ) : (
                        <div className="space-y-2">
                          <Label>验证码</Label>
                          <div className="flex space-x-2">
                            <AppInput
                              name="code"
                              type="text"
                              placeholder="请输入验证码"
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={async () => {
                                if (loginContact) {
                                  await sendVerificationCode(loginContact, 'login');
                                }
                              }}
                            >
                              发送验证码
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="rememberMe"
                            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm text-muted-foreground">记住登录状态</span>
                        </label>
                        <button 
                          type="button"
                          className="text-sm text-primary hover:underline"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          忘记密码？
                        </button>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-medium" 
                        disabled={loading}
                      >
                        {loading ? '登录中...' : '登录'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center border border-border rounded-lg p-1">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${
                            registerMethod === 'password'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => setRegisterMethod('password')}
                        >
                          密码注册
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${
                            registerMethod === 'code'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => setRegisterMethod('code')}
                        >
                          验证码注册
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                      <AppInput
                        name="contact"
                        type="text"
                        placeholder="手机号"
                        label="手机号"
                        autoComplete="tel"
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterContact(e.target.value)}
                      />
                      
                      {registerMethod === 'password' ? (
                        <AppInput
                          name="password"
                          type="password"
                          placeholder="请输入密码"
                          label={t('components.labels.密码')}
        autoComplete="new-password"
                          required
                        />
                      ) : (
                        <div className="space-y-2">
                          <Label>验证码</Label>
                          <div className="flex space-x-2">
                            <AppInput
                              name="code"
                              type="text"
                              placeholder="请输入验证码"
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={async () => {
                                if (registerContact) {
                                  await sendVerificationCode(registerContact, 'register');
                                }
                              }}
                            >
                              发送验证码
                            </Button>
                          </div>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-medium" 
                        disabled={loading}
                      >
                        {loading ? '注册中...' : '注册'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              ) : (
                /* 忘记密码表单 */
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">重置密码</h2>
                    <p className="text-muted-foreground">输入邮箱或手机号，我们将发送验证码</p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <AppInput
                      name="contact"
                      type="text"
                      placeholder="手机号"
                      label="手机号"
        required
                    />
                    
                    <div className="space-y-2">
                      <Label>验证码</Label>
                      <div className="flex space-x-2">
                        <AppInput
                          name="code"
                          type="text"
                          placeholder="请输入验证码"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const contact = (document.querySelector('[name="contact"]') as HTMLInputElement)?.value;
                            if (contact) {
                              await sendVerificationCode(contact, 'reset');
                            }
                          }}
                        >
                          发送验证码
                        </Button>
                      </div>
                    </div>

                    <AppInput
                      name="newPassword"
                      type="password"
                      placeholder="请输入新密码"
                      label={t('components.labels.新密码')}
        autoComplete="new-password"
                      required
                    />

                    <div className="flex space-x-2">
                      <Button 
                        type="button"
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        返回登录
                      </Button>
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-medium" 
                        disabled={loading}
                      >
                        {loading ? '重置中...' : '重置密码'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* 右侧装饰区域 */}
          <div className="hidden lg:block w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"></div>
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex items-center justify-center">
                  <ThemeAwareLogo size="xl" className="w-24 h-24" />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  AI驱动的新媒体内容多平台适配<br/>
                  让您的创作更加高效
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
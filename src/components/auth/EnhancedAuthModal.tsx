import React, { useState } from 'react';
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
    <div className="w-full min-w-[200px] relative">
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
              className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, hsl(var(--primary)) 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, hsl(var(--primary)) 0%, transparent 70%)`,
              }}
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

      console.log('🔐 开始增强登录表单登录...');

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
          throw new Error('验证码登录仅支持邮箱或手机号');
        }
      }

      if (result) {
        console.log('✅ 登录成功:', result);
        handleAuthingLogin(result);
        onClose();
      }
    } catch (error: any) {
      console.error('❌ 登录失败:', error);
      const errorMessage = error.message || error.code || '登录失败';
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
      
      console.log('📝 开始增强注册表单注册...');

      let result;
      const contactType = detectContactType(contact);
      
      if (registerMethod === 'password') {
        const password = formData.get('password') as string;
        
        if (contactType === 'email') {
          result = await authClient.registerByEmail(contact, password);
        } else if (contactType === 'phone') {
          result = await authClient.registerByPhone(contact, password);
        } else {
          throw new Error('注册请使用邮箱或手机号');
        }
      } else {
        const code = formData.get('code') as string;
        
        if (contactType === 'email') {
          result = await authClient.registerByEmailCode(contact, code);
        } else if (contactType === 'phone') {
          result = await authClient.registerByPhoneCode(contact, code);
        } else {
          throw new Error('验证码注册请使用邮箱或手机号');
        }
      }

      if (result) {
        console.log('✅ 注册成功:', result);
        handleAuthingLogin(result);
        onClose();
      }
    } catch (error: any) {
      console.error('❌ 注册失败:', error);
      const errorMessage = error.message || error.code || '泣册失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (contact: string, type: 'login' | 'register' | 'reset') => {
    try {
      setError(null);
      console.log('📧 发送验证码...');
      
      if (contact.includes('@')) {
        // 邮箱验证码
        await authClient.sendEmail(contact, type === 'register' ? 'VERIFY_CODE' : 'RESET_PASSWORD');
      } else {
        // 手机验证码  
        await authClient.sendSmsCode(contact);
      }
      
      console.log('✅ 验证码发送成功');
    } catch (error: any) {
      console.error('❌ 验证码发送失败:', error);
      setError(error.message || '验证码发送失败');
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

      console.log('🔐 开始重置密码...');

      let result;
      if (contact.includes('@')) {
        result = await authClient.resetPasswordByEmailCode(contact, code, newPassword);
      } else {
        result = await authClient.resetPasswordByPhoneCode(contact, code, newPassword);
      }

      if (result) {
        console.log('✅ 密码重置成功');
        setShowForgotPassword(false);
        setActiveTab('login');
      }
    } catch (error: any) {
      console.error('❌ 密码重置失败:', error);
      setError(error.message || '密码重置失败');
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
        <div className="flex h-[600px]">
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
                <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                  {error}
                </div>
              )}

              {!showForgotPassword ? (
                <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">登录</TabsTrigger>
                    <TabsTrigger value="register">注册</TabsTrigger>
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
                        placeholder="邮箱/手机号/用户名"
                        label="账号"
                        autoComplete="username"
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginContact(e.target.value)}
                      />
                      
                      {loginMethod === 'password' ? (
                        <AppInput
                          name="password"
                          type="password"
                          placeholder="请输入密码"
                          label="密码"
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
                      
                      <div className="text-right">
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
                        placeholder="邮箱或手机号"
                        label="邮箱/手机号"
                        autoComplete="email"
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterContact(e.target.value)}
                      />
                      
                      {registerMethod === 'password' ? (
                        <AppInput
                          name="password"
                          type="password"
                          placeholder="请输入密码"
                          label="密码"
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
                      placeholder="邮箱或手机号"
                      label="联系方式"
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
                      label="新密码"
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
/**
 * 21st.dev风格的登录/注册页面
 * 使用手机号+密码/验证码登录方式
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';
import { verificationCodeService } from '@/services/verificationCodeService';
import {
  AuthNetworkDiagnostic,
  AuthRetryManager,
  AuthErrorAnalyzer,
  diagnoseAndRetry
} from '@/utils/authNetworkDiagnosticnetwork' | 'validation' | 'auth' | 'unknown';
  shouldClearCode?: boolean;
}

function parseAuthingError(error: any, t: any): AuthingErrorInfo {
  const errorCode = error?.code;
  const errorMessage = error?.message || (error instanceof Error ? error.message : t('customLoginPage.errors.loginFailedcustomLoginPage.errors.accountOrPasswordError'),
        description: t('customLoginPage.errors.checkCredentials'),
        shouldClearCode: false,
        actionSuggestion: t('customLoginPage.errors.forgotPasswordHint')
      };

    case 2001:
      return {
        title: t('customLoginPage.errors.accountNotExists'),
        description: t('customLoginPage.errors.phoneNotRegistered'),
        shouldClearCode: false,
        actionSuggestion: t('customLoginPage.errors.registerSuggestion')
      };

    case 2004:
      return {
        title: t('customLoginPage.errors.accountLocked'),
        description: t('customLoginPage.errors.accountLockedDesc'),
        shouldClearCode: false,
        actionSuggestion: t('customLoginPage.errors.waitAndRetry', { minutes: 30 })
      };

    case 2020:
      return {
        title: t('customLoginPage.errors.codeError'),
        description: t('customLoginPage.errors.codeIncorrectOrExpired'),
        shouldClearCode: true,
        actionSuggestion: t('customLoginPage.errors.getNewCode')
      };

    case 2021:
      return {
        title: t('customLoginPage.errors.codeExpired'),
        description: t('customLoginPage.errors.codeValidTime', { minutes: 5 }),
        shouldClearCode: true,
        actionSuggestion: t('customLoginPage.errors.resendCode')
      };

    case 2100:
      return {
        title: t('customLoginPage.errors.phoneFormatError'),
        description: t('customLoginPage.validation.phoneFormat', { digits: 11 }),
        shouldClearCode: false
      };

    case 2101:
      return {
        title: t('customLoginPage.errors.emailFormatError'),
        description: t('customLoginPage.validation.emailFormattimeout') || lowerMessage.includes(t('pages.messages.超时'))) {
        return {
          title: t('customLoginPage.errors.loginTimeout'),
          description: t('customLoginPage.errors.networkUnstable'),
          shouldClearCode: false,
          actionSuggestion: t('customLoginPage.errors.checkNetworkAndRetry')
        };
      }

      if (lowerMessage.includes('network') || lowerMessage.includes(t('pages.messages.网络')) ||
          lowerMessage.includes('failed to fetch') || lowerMessage.includes('connection')) {
        return {
          title: t('customLoginPage.errors.networkConnectionFailed'),
          description: t('customLoginPage.errors.cannotConnectServer'),
          shouldClearCode: false,
          actionSuggestion: t('customLoginPage.errors.checkNetworkSettings')
        };
      }

      if (lowerMessage.includes('password') || lowerMessage.includes(t('pages.messages.密码'))) {
        return {
          title: t('customLoginPage.errors.passwordError'),
          description: t('customLoginPage.errors.passwordIncorrect'),
          shouldClearCode: false,
          actionSuggestion: t('customLoginPage.errors.checkPasswordOrReset')
        };
      }

      if (lowerMessage.includes('user') || lowerMessage.includes(t('pages.messages.用户'))) {
        return {
          title: t('customLoginPage.errors.userNotExists'),
          description: t('customLoginPage.errors.accountNotRegistered'),
          shouldClearCode: false,
          actionSuggestion: t('customLoginPage.errors.registerOrCheckInputcustomLoginPage.errors.loginFailed'),
        description: errorMessage || t('customLoginPage.errors.unknownError'),
        shouldClearCode: false,
        actionSuggestion: t('customLoginPage.errors.contactSupport')
      };
    }
  }
}

import '@/styles/animated-signin-21st.csssaved_phone') || '';
    return {
      phone: savedPhone, // 从localStorage恢复手机号
      password: '',
      code: 'password' | 'code'>('password');

  // 注册表单状态 - 只保留手机号
  const [registerForm, setRegisterForm] = useState({
    phone: '', // 只保留手机号
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    loading: false,
    sendingCode: false,
    codeCountdown: 0,
    code: ''
  });

  // UI 视图模式：登录/注册（与模板保持一致的单卡片切换）
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // 🔧 FIX: 检查用户登录状态，已登录用户自动跳转
  useEffect(() => {
    // 延迟一点检查，确保认证状态已经初始化
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        console.log('✅ 检测到用户已登录，自动跳转到首页', user);
        const redirectTo = localStorage.getItem('login_redirect_to') || '/';
        localStorage.removeItem('login_redirect_to⚠️ 认证检查超时，强制显示登录表单');
      setCheckingAuth(false);
    }, 3000); // 3秒后强制显示登录表单

    return () => clearTimeout(fallbackTimer);
  }, []);

  // 处理URL参数，支持直接跳转到注册页面
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setMode('register');
      console.log('🔄 URL参数检测：切换到注册模式🔧 Guard组件错误，使用降级方案:', error);

    // 检查是否是网络连接错误
    const isNetworkError = error?.message?.includes('Failed to fetch') ||
                          error?.message?.includes('ERR_CONNECTION') ||
                          error?.message?.includes('net::') ||
                          error?.code === 'NETWORK_ERROR';

    if (isNetworkError) {
      console.log('🔧 检测到网络连接问题，继续使用自定义登录流程❌ 认证系统错误:', error);
    // 不设置错误状态，避免影响用户体验
  };

  // 处理登录
  // Authing Web SDK 客户端（验证码优先用 API 发送）
  const authingClientRef = useRef<any>(null);
  const ensureAuthingClient = () => {
    if (!authingClientRef.current) {
      const cfg = getAuthingConfig();
      try {
        // 🔧 FIX: 优化Authing客户端配置，解决网络连接问题
        console.log('🔧 初始化Authing客户端，配置:', {
          appId: cfg.appId,
          host: cfg.host,
          domain: cfg.domain
        });

        authingClientRef.current = new (AuthenticationClient as any)({
          appId: cfg.appId,
          appHost: cfg.host,
          // 🔧 FIX: 统一超时时间到90秒，解决认证超时问题
          timeout: 90000,
          // 🔧 FIX: 添加重试机制和网络优化
          retry: 3, // 增加重试次数
          retryDelay: 2000, // 重试延迟2秒
          // 添加网络连接优化
          requestConfig: {
            withCredentials: false, // 避免跨域问题
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              'User-Agent': 'WenPai-App/1.0.0'
            }
          }
        });

        console.log(t('pages.status.Authin_5e6'));
      } catch (e) {
        console.error(t('pages.error.Authin_mkd'), e);
        authingClientRef.current = null;
      }
    }
    return authingClientRef.current;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginForm(prev => ({ ...prev, loading: true }));

    console.log('🔐 开始登录流程:', { 
      phone: loginForm.phone, 
      method: loginMethod,
      hasPassword: !!loginForm.password,
      hasCode: !!loginForm.code 
    });

    try {
      if (!loginForm.phone) throw new Error(t('customLoginPage.validation.phoneRequired'));
      if (loginMethod === 'password' && !loginForm.password) throw new Error(t('customLoginPage.validation.passwordRequired'));
      if (loginMethod === 'code' && !loginForm.code) throw new Error(t('customLoginPage.validation.codeRequired'));

      // 验证码登录使用专用API
      if (loginMethod === 'code') {
        console.log('📱 开始验证码登录:', { phone: loginForm.phone, code: loginForm.code.substring(0,2) + '***' });
        
        console.log('📱 调用手机验证码登录API...');
        // 🔧 FIX: 使用重试机制进行验证码登录
        const result = await diagnoseAndRetry(
          () => verificationCodeService.loginByPhoneCode(loginForm.phone, loginForm.code),
          t('pages.messages.验证码登录')
        );
        
        console.log('📡 验证码登录API响应:', { success: result.success, message: result.message, hasData: !!result.data });
        
        if (result.success) {
          console.log(t('pages.status.验证码登录成_eaq{t('pages.status._l7d')', 
            loading: true,
            loginSuccess: true, // 标记登录成功
            codeCountdown: 0
          }));
          
          toast({
            title: t('customLoginPage.form.loginSuccess'),
            description: t('customLoginPage.messages.redirectingToHome🔐 调用handleAuthingLogin处理登录状态...');
            handleAuthingLogin(result.data);
            
            // 延迟跳转，确保状态更新完成
            setTimeout(() => {
              const redirectTo = localStorage.getItem('login_redirect_to') || '/';
              localStorage.removeItem('login_redirect_to');
              console.log(t('pages.status.验证码登录_r94'), redirectTo);
              navigate(redirectTo, { replace: true });
            }, 800);
          } else {
            console.error('❌ 登录数据或处理函数缺失:', { data: result.data, handler: !!handleAuthingLogin });
            setLoginForm(prev => ({ ...prev, loading: false, loginSuccess: false }));
            throw new Error();
          }
          return;
        } else {
          throw new Error(result.message);
        }
      }

      // 使用AuthenticationClient进行密码登录
      console.log('🔐 开始密码登录流程...');

      const authingClient = ensureAuthingClient();
      if (!authingClient) {
        throw new Error();
      }

      console.log('🚀 调用SDK密码登录API...', {
        method: 'phone-password',
        phone: loginForm.phone.substring(0, 3) + '***'
      });

      // 🔧 FIX: 使用新的重试机制进行密码登录
      console.log('🚀 调用SDK密码登录API...', {
        method: 'phone-password',
        phone: loginForm.phone.substring(0, 3) + '***'
      });

      const result = await diagnoseAndRetry(
        () => authingClient.loginByPhonePassword(loginForm.phone, loginForm.password),
        t('pages.messages.密码登录')
      );

      console.log(t('pages.status.SDK密码登_5ib{t('pages.status.resu_yzh')🔄 触发登录成功处理...', result);
        
        // 设置登录成功状态
        setLoginForm(prev => ({ 
          ...prev, 
          loading: false,
          loginSuccess: true
        }));
        
        toast({
          title: t('customLoginPage.form.loginSuccess'),
          description: t('customLoginPage.form.redirectingsaved_phone', loginForm.phone);
            // 注意：出于安全考虑，我们不直接保存密码，而是保存一个简单的哈希标记
            const simpleHash = btoa(loginForm.phone + '_remembered');
            localStorage.setItem('saved_password_hash', simpleHash);
            console.log(t('pages.text.已保存记住_rkz{t('pages.status._3t2')login_redirect_to') || '/';
            localStorage.removeItem('login_redirect_to');
            console.log('🎯 密码登录成功，跳转到:', redirectTo);
            navigate(redirectTo, { replace: true });
          }, 800);
        }
      } else {
        throw new Error(t('customLoginPage.errors.loginFailed❌ 登录失败详情:', {
        originalError: error,
        errorAnalysis,
        parsedError: errorInfo,
        errorCode: (error as any)?.code,
        errorMessage: (error as any)?.message,
        networkStatus: navigator.onLine ? 'online' : 'offline'
      });

      // 🔧 FIX: 网络问题时提供降级方案
      const isNetworkError = errorInfo.title?.includes(t('pages.messages.网络')) ||
                            errorInfo.title?.includes(t('pages.messages.超时')) ||
                            errorInfo.title?.includes(t('pages.labels.连接'));

      if (isNetworkError) {
        // 提供网络问题的具体建议
        const networkSuggestions = [
          '1. 检查网络连接是否正常',
          '2. 尝试刷新页面重新登录',
          '3. 如果使用WiFi，尝试切换到移动网络',
          '4. 检查是否有防火墙或代理设置',
          '5. 稍后重试或联系技术支持'
        ];

        setError(`${errorInfo.title}\n\n建议解决方案：\n${networkSuggestions.join('\n')}`);

        toast({
          title: errorInfo.title,
          description: `${errorInfo.description}\n\n💡 建议：检查网络连接后重试，或尝试刷新页面`,
          variant: 'destructivecustomLoginPage.errors.loginFailed'));
        toast({
          title: errorInfo.title,
          description: errorInfo.description,
          variant: 'destructive' : prev.code
      }));
    }
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegisterForm(prev => ({ ...prev, loading: true }));

    try {
      // 验证表单
      if (!registerForm.phone || !registerForm.password) {
        throw new Error(t('customLoginPage.validation.completeInfo'));
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error(t('customLoginPage.validation.passwordMismatch'));
      }

      if (registerForm.password.length < 6) {
        throw new Error(t('customLoginPage.validation.passwordTooShort', { min: 6 }));
      }

      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
        throw new Error(t('customLoginPage.validation.phoneInvalid'));
      }

      // 使用验证码注册
      if (!registerForm.code) {
        throw new Error(t('customLoginPage.validation.codeRequired'));
      }
      
      const result = await verificationCodeService.registerByPhoneCode(
        registerForm.phone, 
        registerForm.code, 
        registerForm.password
      );
      
      if (result.success) {
        toast({ title: t('customLoginPage.messages.registerSuccess'), description: t('customLoginPage.messages.registerSuccessRedirect') });

        // 清空注册表单
        setRegisterForm({
          phone: '',
          password: '',
          confirmPassword: '',
          showPassword: false,
          showConfirmPassword: false,
          loading: false,
          sendingCode: false,
          codeCountdown: 0,
          code: '$login');
          // 如果是从注册页面跳转来的，更新URL
          if (searchParams.get('tab') === 'register') {
            navigate('/custom-login', { replace: true });
          }
          console.log(t('pages.status.注册成功已_0lg'));
        }, 1500);
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('customLoginPage.errors.registerFailed');
      setError(errorMsg);
      toast({
        title: t('customLoginPage.errors.registerFailed'),
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setRegisterForm(prev => ({ ...prev, loading: false }));
    }
  };

  const isPhoneValid = !loginForm.phone || /^1[3-9]\d{9}$/.test(loginForm.phone);
  const [rememberMe, setRememberMe] = useState(false);

  // 主题切换功能
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark-mode");
  };

  // 初始化主题
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark-mode");
    }
  }, []);

  // 粒子动画效果
  useEffect(() => {
    const canvas = document.getElementById("particles") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = isDarkMode
          ? `rgba(255, 255, 255, ${Math.random() * 0.2})`
          : `rgba(0, 0, 100, ${Math.random() * 0.2})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [isDarkMode]);

  // 🔧 FIX: 在检查认证状态时显示加载界面
  if (checkingAuth) {
    return (
      <div className={`login-container ${isDarkMode ? "dark" : "light"}`}>
        <canvas id="particles" className="particles-canvas"></canvas>
        <div className="theme-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </div>
        <div className="login-card">
          <div className="login-card-inner">
            <div className="login-header">
              <h1>欢迎</h1>
              <p>正在检查登录状态...</p>
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-muted-foreground">$</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`login-container ${isDarkMode ? "dark" : "light"}`}>
      <canvas id="particles" className="particles-canvasauth-nav-back" onClick={() => navigate('/')}>
        <ArrowLeft size={16} />
        <span className="auth-nav-back-text"></span>
      </button>

      {/* 主题切换按钮 */}
      <div className="theme-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </div>

      <div className="login-card">
        <div className="login-card-inner">
          <div className="login-header">
            <h1>$</h1>
            <p>{mode === 'register' ? t('customLoginPage.registerSubtitle') : t('customLoginPage.subtitle')}</p>
          </div>

      {/* 与 21st.dev 模板一致的表单结构与类名（手机号 + 密码/验证码登录） */}
      {mode === 'login' && (
        <>
        <form className="login-form" onSubmit={handleLogin}>
        {/* 联系方式选择 */}
        {/* 已移除邮箱选项，只保留手机号登录 */}

        {/* 手机号输入 */}
        <div className={`form-field ${loginPhoneFocused || loginForm.phone ? 'active' : ''} ${(!isPhoneValid && loginForm.phone) ? 'invalid' : ''}`}>
          <input
            type="tel"
            id="phone"
            value={loginForm.phone}
            onChange={(e) => setLoginForm(prev => ({ ...prev, phone: e.target.value }))}
            onFocus={() => setLoginPhoneFocused(true)}
            onBlur={() => setLoginPhoneFocused(false)}
            required
          />
          <label htmlFor="phone">$</label>
        </div>

        {/* 登录方式选择（分段按钮） */}
        <div className="segmented inline-style-converted" >
          <button type="button" className={`seg-btn ${loginMethod==='password'?'active':''}`} onClick={() => setLoginMethod('password')}>$</button>
          <button type="button" className={`seg-btn ${loginMethod==='code'?'active':''}`} onClick={() => setLoginMethod('code')}>$</button>
        </div>

        {/* 密码或验证码 */}
        {loginMethod === 'password' ? (
          <div className={`form-field ${loginPasswordFocused || loginForm.password ? 'active' : ''}`}>
            <input
              type={loginForm.showPassword ? 'text' : 'password'}
              id="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              onFocus={() => setLoginPasswordFocused(true)}
              onBlur={() => setLoginPasswordFocused(false)}
              required
            />
            <label htmlFor="password">$</label>
            <button
              type="button"
              className="toggle-password"
              onClick={() => setLoginForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              aria-label={loginForm.showPassword ? 'Hide password' : 'Show password'}
            >
              {loginForm.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        ) : (
          <div className={`form-field ${loginCodeFocused || loginForm.code ? 'active' : ''}`} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:'var(--spacing-2)'}}>
            <div className="relative" /* TODO: 复杂内联样式已转换 */>
              <input
                type="text"
                id="login-code"
                value={loginForm.code}
                onChange={(e) => setLoginForm(prev => ({ ...prev, code: e.target.value }))}
                onFocus={() => setLoginCodeFocused(true)}
                onBlur={() => setLoginCodeFocused(false)}
                required
              />
              <label htmlFor="login-code">$</label>
            </div>
            <button
              type="button"
              className="login-button"
              style={{padding:'var(--spacing-2-5) var(--spacing-3-5)'}}
              disabled={loginForm.sendingCode || loginForm.codeCountdown > 0 || !isPhoneValid}
              onClick={async () => {
                try {
                  setLoginForm(prev => ({ ...prev, sendingCode: true }));

                  // 🔧 FIX: 使用重试机制发送验证码
                  const result = await diagnoseAndRetry(
                    () => verificationCodeService.sendSmsCode(loginForm.phone, 'LOGIN'),
                    t('customLoginPage.form.sendingCode')
                  );

                  if (result.success) {
                    toast({
                      title: t('customLoginPage.messages.sendSuccess'),
                      description: result.message
                    });

                    // 启动倒计时
                    let secs = 60;
                    setLoginForm(prev => ({ ...prev, codeCountdown: secs }));
                    const timer = setInterval(() => {
                      secs -= 1;
                      setLoginForm(prev => ({ ...prev, codeCountdown: Math.max(0, secs) }));
                      if (secs <= 0) clearInterval(timer);
                    }, 1000);
                  } else {
                    toast({
                      title: t('customLoginPage.errors.sendFailed'),
                      description: result.message,
                      variant: 'destructive'
                    });
                  }
                } catch (err) {
                  const msg = err instanceof Error ? err.message : t('customLoginPage.errors.sendCodeFailed');
                  toast({ title: t('customLoginPage.errors.sendFailed'), description: msg, variant: 'destructive' });
                } finally {
                  setLoginForm(prev => ({ ...prev, sendingCode: false }));
                }
              }}
            >
              {loginForm.sendingCode ? t('customLoginPage.form.gettingCode') : (loginForm.codeCountdown > 0 ? `${loginForm.codeCountdown}s` : t('customLoginPage.form.getCode'))}
            </button>
          </div>
        )}

        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
            <span className="checkmark"></span>
            
          </label>
          <Link to="/forgot-password" className="forgot-password">$?</Link>
        </div>

        <button
          type="submit"
          className="login-button"
          disabled={
            loginForm.loading ||
            loginForm.loginSuccess ||
            (loginMethod === 'password' ? (!loginForm.password || !isPhoneValid) : (!loginForm.code || !isPhoneValid))
          }
        >
          {loginForm.loginSuccess ? `$，$` : (loginForm.loading ? t('customLoginPage.form.loggingIn') : t('customLoginPage.form.loginButton'))}
        </button>
      </form>
        </>
      )}

      <p className="signup-prompt">
         <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); }}>$</a>
      </p>
      {/* 注册模式下的表单（手机号/邮箱 + 验证码） */}
      {mode === 'register' && (
        <form className="login-form inline-style-converted" >

          {/* 已移除邮箱选项，只保留手机号注册 */}

          {/* 手机号输入 */}
          <div className={`form-field ${registerPhoneFocused || registerForm.phone ? 'active' : ''}`}>
            <input
              type="tel"
              id="register-phone"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
              onFocus={() => setRegisterPhoneFocused(true)}
              onBlur={() => setRegisterPhoneFocused(false)}
              required
            />
            <label htmlFor="register-phone">$</label>
          </div>

          {/* 验证码 */}
          <div className={`form-field ${registerCodeFocused || registerForm.code ? 'active' : ''}`} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:'var(--spacing-2)'}}>
            <div className="relative" /* TODO: 复杂内联样式已转换 */>
              <input
                type="text"
                id="register-code"
                value={registerForm.code}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, code: e.target.value }))}
                onFocus={() => setRegisterCodeFocused(true)}
                onBlur={() => setRegisterCodeFocused(false)}
                required
              />
              <label htmlFor="register-code">$</label>
            </div>
            <button
              type="button"
              className="login-button"
              style={{padding:'var(--spacing-2-5) var(--spacing-3-5)'}}
              disabled={registerForm.sendingCode || registerForm.codeCountdown > 0 || !registerForm.phone}
              onClick={async () => {
                try {
                  setRegisterForm(prev => ({ ...prev, sendingCode: true }));

                  // 🔧 FIX: 使用重试机制发送注册验证码
                  const result = await diagnoseAndRetry(
                    () => verificationCodeService.sendSmsCode(registerForm.phone, 'REGISTER'),
                    t('customLoginPage.form.sendingCode')
                  );

                  if (result.success) {
                    toast({
                      title: t('customLoginPage.messages.sendSuccess'),
                      description: result.message
                    });

                    // 启动倒计时
                    let secs = 60;
                    setRegisterForm(prev => ({ ...prev, codeCountdown: secs }));
                    const timer = setInterval(() => {
                      secs -= 1;
                      setRegisterForm(prev => ({ ...prev, codeCountdown: Math.max(0, secs) }));
                      if (secs <= 0) clearInterval(timer);
                    }, 1000);
                  } else {
                    toast({
                      title: t('customLoginPage.errors.sendFailed'),
                      description: result.message,
                      variant: 'destructive'
                    });
                  }
                } catch (err) {
                  const msg = err instanceof Error ? err.message : t('customLoginPage.errors.sendCodeFailed');
                  toast({ title: t('customLoginPage.errors.sendFailed'), description: msg, variant: 'destructive' });
                } finally {
                  setRegisterForm(prev => ({ ...prev, sendingCode: false }));
                }
              }}
            >
              {registerForm.sendingCode ? t('customLoginPage.form.gettingCode') : (registerForm.codeCountdown > 0 ? `${registerForm.codeCountdown}s` : t('customLoginPage.form.getCode'))}
            </button>
          </div>

          {/* 密码 */}
          <div className={`form-field ${registerPasswordFocused || registerForm.password ? 'active' : ''}`}>
            <input
              type="password"
              id="register-password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
              onFocus={() => setRegisterPasswordFocused(true)}
              onBlur={() => setRegisterPasswordFocused(false)}
              required
            />
            <label htmlFor="register-password">（$）</label>
          </div>

          <div className={`form-field ${registerConfirmFocused || registerForm.confirmPassword ? 'active' : ''} ${registerForm.confirmPassword && !passwordsMatch ? 'invalid' : ''}`}>
            <input
              type="password"
              id="register-confirm"
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              onFocus={() => setRegisterConfirmFocused(true)}
              onBlur={() => setRegisterConfirmFocused(false)}
              required
            />
            <label htmlFor="register-confirm"></label>
            {registerForm.confirmPassword && !passwordsMatch && (
              <span className="error-message" style={{position:'absolute', right:0, top:'100%', marginTop:4, color:'hsl(var(--destructive))', fontSize:12}}>
                
              </span>
            )}
          </div>

          <div className="form-options inline-style-converted" >
            <label className="remember-me select-none" >
              <input
                type="checkbox"
                checked={registerAgreed}
                onChange={(e) => {
                  console.log('📋 隐私政策勾选状态:', e.target.checked);
                  setRegisterAgreed(e.target.checked);
                }}
              />
              <span className="checkmark"></span>
               <Link
                to="/privacy"
                className="forgot-password"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
              ></Link>  <Link
                to="/terms"
                className="forgot-password"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
              ></Link>
            </label>
          </div>
          <p className="signup-prompt">
            {t('customLoginPage.navigation.hasAccount')}<a href="#" onClick={(e)=>{e.preventDefault(); setMode('login');}}></a>
          </p>

          <button type="submit" className="login-button" disabled={registerForm.loading || !registerAgreed || !passwordsMatch}>
            {registerForm.loading ? t('customLoginPage.form.registering') : t('customLoginPage.form.registerButton')}
          </button>
        </form>
      )}
        </div>
      </div>
    </div>
  );
};

export default CustomLoginPage;

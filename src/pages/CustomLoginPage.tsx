/**
 * 自定义登录/注册页面
 * 提供原生的登录注册表单，不依赖第三方服务
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedAuthShell } from '@/components/ui/AnimatedAuthShell';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';
import { verificationCodeService } from '@/services/verificationCodeService';

// 🔧 FIX: Authing错误码解析器 - 提供友好的错误提示
interface AuthingErrorInfo {
  title: string;
  description: string;
  shouldClearCode: boolean;
  actionSuggestion?: string;
}

function parseAuthingError(error: any): AuthingErrorInfo {
  const errorCode = error?.code;
  const errorMessage = error?.message || (error instanceof Error ? error.message : '登录失败');

  // 根据Authing错误码提供精确的错误提示
  switch (errorCode) {
    case 2333:
      return {
        title: '账号或密码错误',
        description: '请检查您输入的手机号/邮箱和密码是否正确',
        shouldClearCode: false,
        actionSuggestion: '忘记密码？点击下方链接重置'
      };

    case 2001:
      return {
        title: '账号不存在',
        description: '该手机号/邮箱尚未注册，请先注册账号',
        shouldClearCode: false,
        actionSuggestion: '点击下方"注册"按钮创建新账号'
      };

    case 2004:
      return {
        title: '账号已被锁定',
        description: '您的账号因多次登录失败被暂时锁定，请稍后重试或联系客服',
        shouldClearCode: false,
        actionSuggestion: '请等待30分钟后重试，或联系客服解锁'
      };

    case 2020:
      return {
        title: '验证码错误',
        description: '您输入的验证码不正确或已过期',
        shouldClearCode: true,
        actionSuggestion: '请重新获取验证码'
      };

    case 2021:
      return {
        title: '验证码已过期',
        description: '验证码有效期为5分钟，请重新获取',
        shouldClearCode: true,
        actionSuggestion: '点击"重新发送"获取新验证码'
      };

    case 2100:
      return {
        title: '手机号格式错误',
        description: '请输入正确的11位手机号码',
        shouldClearCode: false
      };

    case 2101:
      return {
        title: '邮箱格式错误',
        description: '请输入正确的邮箱地址格式',
        shouldClearCode: false
      };

    default:
      // 根据错误消息内容进行模糊匹配
      const lowerMessage = errorMessage.toLowerCase();

      if (lowerMessage.includes('timeout') || lowerMessage.includes('超时')) {
        return {
          title: '登录超时',
          description: '网络连接不稳定，请检查网络后重试',
          shouldClearCode: false,
          actionSuggestion: '请检查网络连接后重新尝试'
        };
      }

      if (lowerMessage.includes('network') || lowerMessage.includes('网络') ||
          lowerMessage.includes('failed to fetch') || lowerMessage.includes('connection')) {
        return {
          title: '网络连接失败',
          description: '无法连接到服务器，请检查网络连接',
          shouldClearCode: false,
          actionSuggestion: '请检查网络设置后重试'
        };
      }

      if (lowerMessage.includes('password') || lowerMessage.includes('密码')) {
        return {
          title: '密码错误',
          description: '您输入的密码不正确',
          shouldClearCode: false,
          actionSuggestion: '请检查密码是否正确，或点击"忘记密码"'
        };
      }

      if (lowerMessage.includes('user') || lowerMessage.includes('用户')) {
        return {
          title: '用户不存在',
          description: '该账号尚未注册',
          shouldClearCode: false,
          actionSuggestion: '请先注册账号或检查输入是否正确'
        };
      }

      // 默认错误
      return {
        title: '登录失败',
        description: errorMessage || '登录过程中发生未知错误，请重试',
        shouldClearCode: false,
        actionSuggestion: '如问题持续，请联系客服'
      };
  }
}

import '@/styles/animated-signin-21st.css';
export const CustomLoginPage: React.FC = () => {
  const { toast } = useToast();
  const { guard, handleAuthingLogin, user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 登录表单状态 - 只保留手机号
  const [loginForm, setLoginForm] = useState({
    phone: '', // 只保留手机号
    password: '',
    code: '', // 验证码
    showPassword: false,
    loading: false,
    sendingCode: false,
    codeCountdown: 0,
    loginSuccess: false // 添加登录成功状态
  });

  // 登录方式状态 - 移除邮箱选项
  const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password');

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
        localStorage.removeItem('login_redirect_to');
        navigate(redirectTo, { replace: true });
        return;
      }
      setCheckingAuth(false); // 检查完成，显示登录表单
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  // 处理URL参数，支持直接跳转到注册页面
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setMode('register');
      console.log('🔄 URL参数检测：切换到注册模式');
    }
  }, [searchParams]);
  // 浮动标签交互状态（仅用于视觉触发，逻辑仍用原有字段）
  const [loginPhoneFocused, setLoginPhoneFocused] = useState(false);
  const [loginPasswordFocused, setLoginPasswordFocused] = useState(false);
  const [loginCodeFocused, setLoginCodeFocused] = useState(false);
  const [registerPhoneFocused, setRegisterPhoneFocused] = useState(false);
  const [registerPasswordFocused, setRegisterPasswordFocused] = useState(false);
  const [registerConfirmFocused, setRegisterConfirmFocused] = useState(false);
  const [registerCodeFocused, setRegisterCodeFocused] = useState(false);

  const [registerAgreed, setRegisterAgreed] = useState(false);

  const passwordsMatch = registerForm.password && registerForm.confirmPassword && registerForm.password === registerForm.confirmPassword;

  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true); // 🔧 FIX: 添加认证检查状态

  // 🔧 FIX: 添加Guard组件错误处理和降级方案
  const handleGuardError = (error: any) => {
    console.warn('🔧 Guard组件错误，使用降级方案:', error);

    // 检查是否是网络连接错误
    const isNetworkError = error?.message?.includes('Failed to fetch') ||
                          error?.message?.includes('ERR_CONNECTION') ||
                          error?.message?.includes('net::') ||
                          error?.code === 'NETWORK_ERROR';

    if (isNetworkError) {
      console.log('🔧 检测到网络连接问题，继续使用自定义登录流程');
      // 不显示错误，继续使用自定义登录流程
      return;
    }

    // 其他错误才显示给用户
    console.error('❌ 认证系统错误:', error);
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
          // 🔧 FIX: 增加网络连接优化配置
          timeout: 45000, // 45秒超时，平衡用户体验和网络稳定性
          retry: 2, // 减少重试次数，避免过长等待
          retryDelay: 1500, // 减少重试延迟
          // 添加网络连接优化
          requestConfig: {
            withCredentials: false, // 避免跨域问题
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        });

        console.log('✅ Authing客户端初始化成功');
      } catch (e) {
        console.error('❌ Authing AuthenticationClient初始化失败:', e);
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
      if (!loginForm.phone) throw new Error('请填写手机号');
      if (loginMethod === 'password' && !loginForm.password) throw new Error('请输入密码');
      if (loginMethod === 'code' && !loginForm.code) throw new Error('请输入验证码');

      // 验证码登录使用专用API
      if (loginMethod === 'code') {
        console.log('📱 开始验证码登录:', { phone: loginForm.phone, code: loginForm.code.substring(0,2) + '***' });
        
        console.log('📱 调用手机验证码登录API...');
        const result = await verificationCodeService.loginByPhoneCode(loginForm.phone, loginForm.code);
        
        console.log('📡 验证码登录API响应:', { success: result.success, message: result.message, hasData: !!result.data });
        
        if (result.success) {
          console.log('✅ 验证码登录成功，开始处理登录状态...');
          
          // 立即设置成功状态，防止重复提交
          setLoginForm(prev => ({ 
            ...prev, 
            code: '', 
            loading: true,
            loginSuccess: true, // 标记登录成功
            codeCountdown: 0
          }));
          
          toast({ 
            title: '登录成功', 
            description: '正在跳转，请勿重复操作...',
            duration: 3000 
          });
          
          // 使用UnifiedAuthContext的handleAuthingLogin处理登录成功
          if (result.data && handleAuthingLogin) {
            console.log('🔐 调用handleAuthingLogin处理登录状态...');
            handleAuthingLogin(result.data);
            
            // 延迟跳转，确保状态更新完成
            setTimeout(() => {
              const redirectTo = localStorage.getItem('login_redirect_to') || '/';
              localStorage.removeItem('login_redirect_to');
              console.log('🎯 验证码登录成功，跳转到:', redirectTo);
              navigate(redirectTo, { replace: true });
            }, 800);
          } else {
            console.error('❌ 登录数据或处理函数缺失:', { data: result.data, handler: !!handleAuthingLogin });
            setLoginForm(prev => ({ ...prev, loading: false, loginSuccess: false }));
            throw new Error('登录处理失败，请重试');
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
        throw new Error('Authing客户端初始化失败');
      }

      console.log('🚀 调用SDK密码登录API...', {
        method: 'phone-password',
        phone: loginForm.phone.substring(0, 3) + '***'
      });

      // 🔧 FIX: 优化登录重试机制，减少等待时间
      let result;
      let lastError;
      const maxRetries = 2; // 减少重试次数

      // 检查网络连接状态
      const isOnline = navigator.onLine;
      if (!isOnline) {
        throw new Error('网络连接已断开，请检查网络设置');
      }

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 登录尝试 ${attempt}/${maxRetries}...`);

          // 设置较短的超时时间，快速失败
          const loginPromise = authingClient.loginByPhonePassword(loginForm.phone, loginForm.password);

          // 🔧 FIX: 减少超时时间，快速失败并重试
          result = await Promise.race([
            loginPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('登录请求超时，请检查网络连接')), 20000) // 20秒超时
            )
          ]);

          // 如果成功，跳出重试循环
          if (result && result.id) {
            console.log(`✅ 第 ${attempt} 次尝试登录成功:`, result);
            break;
          }
        } catch (error) {
          lastError = error;
          console.warn(`❌ 第 ${attempt} 次登录尝试失败:`, error);

          // 🔧 FIX: 检查是否是网络连接问题
          const errorMessage = error instanceof Error ? error.message : '';
          const isNetworkError = errorMessage.includes('ERR_CONNECTION') ||
                                errorMessage.includes('Failed to fetch') ||
                                errorMessage.includes('Network Error') ||
                                errorMessage.includes('超时');

          // 如果不是最后一次尝试，等待后重试
          if (attempt < maxRetries) {
            const delay = isNetworkError ? 1000 : 1500; // 网络错误快速重试
            console.log(`⏳ 等待 ${delay}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // 如果所有重试都失败了
      if (!result || !result.id) {
        throw lastError || new Error('登录失败，请检查网络连接后重试');
      }
      
      console.log('✅ SDK密码登录成功:', result);
      
      // 处理登录成功
      if (result && result.id) {
        console.log('🔄 触发登录成功处理...', result);
        
        // 设置登录成功状态
        setLoginForm(prev => ({ 
          ...prev, 
          loading: false,
          loginSuccess: true
        }));
        
        toast({
          title: '登录成功',
          description: '正在跳转...',
          duration: 2000
        });
        
        // 调用统一认证的登录处理
        if (handleAuthingLogin) {
          handleAuthingLogin(result);
          
          // 延迟跳转，确保状态更新完成
          setTimeout(() => {
            const redirectTo = localStorage.getItem('login_redirect_to') || '/';
            localStorage.removeItem('login_redirect_to');
            console.log('🎯 密码登录成功，跳转到:', redirectTo);
            navigate(redirectTo, { replace: true });
          }, 800);
        }
      } else {
        throw new Error('登录失败，请检查账号密码');
      }
    } catch (error) {
      // 🔧 FIX: 增强错误处理和用户反馈 - 根据Authing错误码提供精确提示
      const errorInfo = parseAuthingError(error);

      console.error('❌ 登录失败详情:', {
        originalError: error,
        parsedError: errorInfo,
        errorCode: (error as any)?.code,
        errorMessage: (error as any)?.message,
        networkStatus: navigator.onLine ? 'online' : 'offline'
      });

      // 🔧 FIX: 网络问题时提供降级方案
      const isNetworkError = errorInfo.title.includes('网络') ||
                            errorInfo.title.includes('超时') ||
                            errorInfo.title.includes('连接');

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
          variant: 'destructive',
          duration: 8000 // 网络错误延长显示时间
        });
      } else {
        setError(errorInfo.title);
        toast({
          title: errorInfo.title,
          description: errorInfo.description,
          variant: 'destructive',
          duration: 6000
        });
      }

      // 重置状态，允许重新尝试
      setLoginForm(prev => ({
        ...prev,
        loading: false,
        loginSuccess: false,
        // 如果是验证码错误，清空验证码让用户重新输入
        code: errorInfo.shouldClearCode ? '' : prev.code
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
        throw new Error('请填写完整的注册信息');
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      if (registerForm.password.length < 6) {
        throw new Error('密码长度至少6位');
      }

      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
        throw new Error('请输入有效的手机号');
      }

      // 使用验证码注册
      if (!registerForm.code) {
        throw new Error('请输入验证码');
      }
      
      const result = await verificationCodeService.registerByPhoneCode(
        registerForm.phone, 
        registerForm.code, 
        registerForm.password
      );
      
      if (result.success) {
        toast({ title: '注册成功', description: '正在跳转到登录...' });

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
          code: ''
        });

        // 延迟切换到登录模式，给用户看到成功提示的时间
        setTimeout(() => {
          setMode('login');
          // 如果是从注册页面跳转来的，更新URL
          if (searchParams.get('tab') === 'register') {
            navigate('/custom-login', { replace: true });
          }
          console.log('✅ 注册成功，已切换到登录模式');
        }, 1500);
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '注册失败';
      setError(errorMsg);
      toast({
        title: '注册失败',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setRegisterForm(prev => ({ ...prev, loading: false }));
    }
  };

  const isPhoneValid = !loginForm.phone || /^1[3-9]\d{9}$/.test(loginForm.phone);
  const [rememberMe, setRememberMe] = useState(false);

  // 🔧 FIX: 在检查认证状态时显示加载界面
  if (checkingAuth) {
    return (
      <AnimatedAuthShell
        title="欢迎"
        subtitle="正在检查登录状态..."
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">检查中...</span>
        </div>
      </AnimatedAuthShell>
    );
  }

  return (
    <AnimatedAuthShell
      title="欢迎"
      subtitle={mode === 'register' ? '创建您的账户' : '请登录以继续'}
    >
      <div>
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
          <label htmlFor="phone">手机号</label>
        </div>

        {/* 登录方式选择（分段按钮） */}
        <div className="segmented" style={{marginTop:8, marginBottom:8}}>
          <button type="button" className={`seg-btn ${loginMethod==='password'?'active':''}`} onClick={() => setLoginMethod('password')}>密码登录</button>
          <button type="button" className={`seg-btn ${loginMethod==='code'?'active':''}`} onClick={() => setLoginMethod('code')}>验证码登录</button>
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
            <label htmlFor="password">密码</label>
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
          <div className={`form-field ${loginCodeFocused || loginForm.code ? 'active' : ''}`} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:'8px'}}>
            <div style={{position:'relative'}}>
              <input
                type="text"
                id="login-code"
                value={loginForm.code}
                onChange={(e) => setLoginForm(prev => ({ ...prev, code: e.target.value }))}
                onFocus={() => setLoginCodeFocused(true)}
                onBlur={() => setLoginCodeFocused(false)}
                required
              />
              <label htmlFor="login-code">验证码</label>
            </div>
            <button
              type="button"
              className="login-button"
              style={{padding:'10px 14px'}}
              disabled={loginForm.sendingCode || loginForm.codeCountdown > 0 || !isPhoneValid}
              onClick={async () => {
                try {
                  setLoginForm(prev => ({ ...prev, sendingCode: true }));
                  
                  const result = await verificationCodeService.sendSmsCode(loginForm.phone, 'LOGIN');
                  
                  if (result.success) {
                    toast({ 
                      title: '发送成功', 
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
                      title: '发送失败', 
                      description: result.message, 
                      variant: 'destructive' 
                    });
                  }
                } catch (err) {
                  const msg = err instanceof Error ? err.message : '发送验证码失败';
                  toast({ title: '发送失败', description: msg, variant: 'destructive' });
                } finally { 
                  setLoginForm(prev => ({ ...prev, sendingCode: false })); 
                }
              }}
            >
              {loginForm.sendingCode ? '获取中...' : (loginForm.codeCountdown > 0 ? `${loginForm.codeCountdown}s` : '获取验证码')}
            </button>
          </div>
        )}

        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
            <span className="checkmark"></span>
            记住我
          </label>
          <Link to="/forgot-password" className="forgot-password">忘记密码?</Link>
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
          {loginForm.loginSuccess ? '登录成功，跳转中...' : (loginForm.loading ? '登录中...' : '登录')}
        </button>
      </form>
        </>
      )}

      <p className="signup-prompt">
        没有账号? <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); }}>{'注册'}</a>
      </p>
      {/* 注册模式下的表单（手机号/邮箱 + 验证码） */}
      {mode === 'register' && (
        <form className="login-form" onSubmit={handleRegister} style={{marginTop: 24}}>

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
            <label htmlFor="register-phone">手机号</label>
          </div>

          {/* 验证码 */}
          <div className={`form-field ${registerCodeFocused || registerForm.code ? 'active' : ''}`} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:'8px'}}>
            <div style={{position:'relative'}}>
              <input
                type="text"
                id="register-code"
                value={registerForm.code}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, code: e.target.value }))}
                onFocus={() => setRegisterCodeFocused(true)}
                onBlur={() => setRegisterCodeFocused(false)}
                required
              />
              <label htmlFor="register-code">验证码</label>
            </div>
            <button
              type="button"
              className="login-button"
              style={{padding:'10px 14px'}}
              disabled={registerForm.sendingCode || registerForm.codeCountdown > 0 || !registerForm.phone}
              onClick={async () => {
                try {
                  setRegisterForm(prev => ({ ...prev, sendingCode: true }));
                  
                  const result = await verificationCodeService.sendSmsCode(registerForm.phone, 'REGISTER');
                  
                  if (result.success) {
                    toast({ 
                      title: '发送成功', 
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
                      title: '发送失败', 
                      description: result.message, 
                      variant: 'destructive' 
                    });
                  }
                } catch (err) {
                  const msg = err instanceof Error ? err.message : '发送验证码失败';
                  toast({ title: '发送失败', description: msg, variant: 'destructive' });
                } finally { 
                  setRegisterForm(prev => ({ ...prev, sendingCode: false })); 
                }
              }}
            >
              {registerForm.sendingCode ? '获取中...' : (registerForm.codeCountdown > 0 ? `${registerForm.codeCountdown}s` : '获取验证码')}
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
            <label htmlFor="register-password">密码（至少6位）</label>
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
            <label htmlFor="register-confirm">确认密码</label>
            {registerForm.confirmPassword && !passwordsMatch && (
              <span className="error-message" style={{position:'absolute', right:0, top:'100%', marginTop:4, color:'#ef4444', fontSize:12}}>
                两次密码不一致
              </span>
            )}
          </div>

          <div className="form-options" style={{marginTop:12}}>
            <label className="remember-me" style={{userSelect:'none'}}>
              <input
                type="checkbox"
                checked={registerAgreed}
                onChange={(e) => {
                  console.log('📋 隐私政策勾选状态:', e.target.checked);
                  setRegisterAgreed(e.target.checked);
                }}
              />
              <span className="checkmark"></span>
              我已阅读并同意 <Link
                to="/privacy"
                className="forgot-password"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
              >隐私政策</Link> 和 <Link
                to="/terms"
                className="forgot-password"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
              >服务条款</Link>
            </label>
          </div>
          <p className="signup-prompt">
            已有账号？<a href="#" onClick={(e)=>{e.preventDefault(); setMode('login');}}>返回登录</a>
          </p>

          <button type="submit" className="login-button" disabled={registerForm.loading || !registerAgreed || !passwordsMatch}>
            {registerForm.loading ? '注册中...' : '立即注册'}
          </button>
        </form>
      )}
    </div>
    </AnimatedAuthShell>
  );
};

export default CustomLoginPage;

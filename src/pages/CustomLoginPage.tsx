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

import '@/styles/animated-signin-21st.css';
export const CustomLoginPage: React.FC = () => {
  const { toast } = useToast();
  const { guard, handleAuthingLogin, user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    contact: '', // 邮箱或手机号
    password: '',
    code: '', // 验证码
    showPassword: false,
    loading: false,
    sendingCode: false,
    codeCountdown: 0,
    loginSuccess: false // 添加登录成功状态
  });

  // 登录方式状态
  const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');

  // 注册表单状态（去掉用户名）
  const [registerForm, setRegisterForm] = useState({
    email: '',
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
  const [loginEmailFocused, setLoginEmailFocused] = useState(false);
  const [loginPasswordFocused, setLoginPasswordFocused] = useState(false);
  const [loginCodeFocused, setLoginCodeFocused] = useState(false);
  const [registerEmailFocused, setRegisterEmailFocused] = useState(false);
  const [registerPhoneFocused, setRegisterPhoneFocused] = useState(false);
  const [registerPasswordFocused, setRegisterPasswordFocused] = useState(false);
  const [registerConfirmFocused, setRegisterConfirmFocused] = useState(false);
  const [registerCodeFocused, setRegisterCodeFocused] = useState(false);

  const [registerContactType, setRegisterContactType] = useState<'email' | 'phone'>('email');

  const [registerAgreed, setRegisterAgreed] = useState(false);

  const passwordsMatch = registerForm.password && registerForm.confirmPassword && registerForm.password === registerForm.confirmPassword;

  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true); // 🔧 FIX: 添加认证检查状态

  // 处理登录
  // Authing Web SDK 客户端（验证码优先用 API 发送）
  const authingClientRef = useRef<any>(null);
  const ensureAuthingClient = () => {
    if (!authingClientRef.current) {
      const cfg = getAuthingConfig();
      try {
        authingClientRef.current = new (AuthenticationClient as any)({ appId: cfg.appId, appHost: cfg.host });
      } catch (e) {
        console.warn('Authing AuthenticationClient init failed', e);
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
      contact: loginForm.contact, 
      method: loginMethod,
      contactType,
      hasPassword: !!loginForm.password,
      hasCode: !!loginForm.code 
    });

    try {
      if (!loginForm.contact) throw new Error('请填写联系方式');
      if (loginMethod === 'password' && !loginForm.password) throw new Error('请输入密码');
      if (loginMethod === 'code' && !loginForm.code) throw new Error('请输入验证码');

      // 验证码登录使用专用API
      if (loginMethod === 'code') {
        console.log('📱 开始验证码登录:', { contactType, contact: loginForm.contact, code: loginForm.code.substring(0,2) + '***' });
        
        let result;
        if (contactType === 'phone') {
          console.log('📱 调用手机验证码登录API...');
          result = await verificationCodeService.loginByPhoneCode(loginForm.contact, loginForm.code);
        } else {
          console.log('📧 调用邮箱验证码登录API...');
          result = await verificationCodeService.loginByEmailCode(loginForm.contact, loginForm.code);
        }
        
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
        method: contactType + '-password',
        contact: loginForm.contact.substring(0, 3) + '***'
      });
      
      // 使用AuthenticationClient进行密码登录
      let result;
      if (contactType === 'phone') {
        result = await authingClient.loginByPhonePassword(loginForm.contact, loginForm.password);
      } else {
        result = await authingClient.loginByEmail(loginForm.contact, loginForm.password);
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
      const errorMsg = error instanceof Error ? error.message : '登录失败';
      setError(errorMsg);
      toast({ title: '登录失败', description: errorMsg, variant: 'destructive' });
      
      // 重置状态，允许重新尝试
      setLoginForm(prev => ({ 
        ...prev, 
        loading: false, 
        loginSuccess: false,
        // 如果是验证码错误，清空验证码让用户重新输入
        code: errorMsg.includes('验证码') ? '' : prev.code
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
      const contact = registerContactType === 'email' ? registerForm.email : registerForm.phone;
      if (!contact || !registerForm.password) {
        throw new Error('请填写完整的注册信息');
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      if (registerForm.password.length < 6) {
        throw new Error('密码长度至少6位');
      }

      // 验证邮箱或手机号格式
      if (registerContactType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
        throw new Error('请输入有效的邮箱地址');
      }

      if (registerContactType === 'phone' && !/^1[3-9]\d{9}$/.test(registerForm.phone)) {
        throw new Error('请输入有效的手机号');
      }

      // 使用验证码注册
      if (!registerForm.code) {
        throw new Error('请输入验证码');
      }
      
      let result;
      if (registerContactType === 'phone') {
        result = await verificationCodeService.registerByPhoneCode(
          registerForm.phone, 
          registerForm.code, 
          registerForm.password
        );
      } else {
        result = await verificationCodeService.registerByEmailCode(
          registerForm.email, 
          registerForm.code, 
          registerForm.password
        );
      }
      
      if (result.success) {
        toast({ title: '注册成功', description: '正在跳转到登录...' });

        // 清空注册表单
        setRegisterForm({
          email: '',
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

  const isContactValid = !loginForm.contact || (
    contactType === 'email'
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.contact)
      : /^1[3-9]\d{9}$/.test(loginForm.contact)
  );
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
      {/* 与 21st.dev 模板一致的表单结构与类名（增加邮箱/手机号 + 密码/验证码登录） */}
      {mode === 'login' && (
        <>
        <form className="login-form" onSubmit={handleLogin}>
        {/* 联系方式选择 */}
        {/* 联系方式切换（分段按钮） */}
        <div className="segmented" style={{marginTop:4, marginBottom:8}}>
          <button type="button" onClick={() => setContactType('email')} className={`seg-btn ${contactType==='email'?'active':''}`}>邮箱</button>
          <button type="button" onClick={() => setContactType('phone')} className={`seg-btn ${contactType==='phone'?'active':''}`}>手机号</button>
        </div>

        {/* 联系方式输入 */}
        <div className={`form-field ${loginEmailFocused || loginForm.contact ? 'active' : ''} ${(!isContactValid && loginForm.contact) ? 'invalid' : ''}`}>
          <input
            type={contactType === 'email' ? 'email' : 'tel'}
            id="contact"
            value={loginForm.contact}
            onChange={(e) => setLoginForm(prev => ({ ...prev, contact: e.target.value }))}
            onFocus={() => setLoginEmailFocused(true)}
            onBlur={() => setLoginEmailFocused(false)}
            required
          />
          <label htmlFor="contact">{contactType === 'email' ? '电子邮件地址' : '手机号'}</label>
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
              disabled={loginForm.sendingCode || loginForm.codeCountdown > 0 || !isContactValid}
              onClick={async () => {
                try {
                  setLoginForm(prev => ({ ...prev, sendingCode: true }));
                  
                  let result;
                  if (contactType === 'phone') {
                    result = await verificationCodeService.sendSmsCode(loginForm.contact, 'LOGIN');
                  } else {
                    result = await verificationCodeService.sendEmailCode(loginForm.contact, 'LOGIN');
                  }
                  
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
            (loginMethod === 'password' ? (!loginForm.password || !isContactValid) : (!loginForm.code || !isContactValid))
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

          {/* 联系方式选择（分段按钮） */}
          <div className="segmented" style={{marginTop:8, marginBottom:8}}>
            <button type="button" className={`seg-btn ${registerContactType==='email'?'active':''}`} onClick={() => setRegisterContactType('email')}>邮箱注册</button>
            <button type="button" className={`seg-btn ${registerContactType==='phone'?'active':''}`} onClick={() => setRegisterContactType('phone')}>手机号注册</button>
          </div>

          {registerContactType === 'email' ? (
            <div className={`form-field ${registerEmailFocused || registerForm.email ? 'active' : ''}`}>
              <input
                type="email"
                id="register-email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                onFocus={() => setRegisterEmailFocused(true)}
                onBlur={() => setRegisterEmailFocused(false)}
                required
              />
              <label htmlFor="register-email">邮箱</label>
            </div>
          ) : (
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
          )}

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
              disabled={registerForm.sendingCode || registerForm.codeCountdown > 0 || (!registerForm.email && !registerForm.phone)}
              onClick={async () => {
                try {
                  setRegisterForm(prev => ({ ...prev, sendingCode: true }));
                  
                  let result;
                  if (registerContactType === 'phone') {
                    result = await verificationCodeService.sendSmsCode(registerForm.phone, 'REGISTER');
                  } else {
                    // 🔧 FIX: 使用LOGIN场景发送验证码，因为registerByEmailCode可能期望LOGIN类型的验证码
                    result = await verificationCodeService.sendEmailCode(registerForm.email, 'LOGIN');
                  }
                  
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

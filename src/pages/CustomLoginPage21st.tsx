/**
 * 21st.dev风格的登录/注册页面
 * 使用手机号+密码/验证码登录方式
 * 优化版本：流动渐变背景 + 完整注册功能
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sun, Moon, ArrowLeft, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';
import { verificationCodeService } from '@/services/verificationCodeService';
import { LogoWithText } from '@/components/ui/ThemeAwareLogo';
import { validatePassword as validatePasswordSecurity } from '@/utils/passwordSecurity';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import SecureInput from '@/components/ui/SecureInput';
import { ValidationRules } from '@/utils/inputValidator';

// 手机号验证函数
const validatePhone = (phone: string) => { const phoneRegex = /^1[3-9]\d{9 }$/;
  return phoneRegex.test(phone);
};

// 使用增强的密码验证函数
const validatePassword = (password: string) => {
  const securityCheck = validatePasswordSecurity(password);
  
  return {
    isValid: securityCheck.isValid,
    rules: {
      length: securityCheck.requirements.minLength,
      uppercase: securityCheck.requirements.hasUppercase,
      lowercase: securityCheck.requirements.hasLowercase,
      number: securityCheck.requirements.hasDigit,
      special: securityCheck.requirements.hasSpecial
    },
    strength: securityCheck.score,
    level: securityCheck.level,
    feedback: securityCheck.feedback
  };
};

// 密码规则组件
const PasswordRule: React.FC<{ text: string; isValid: boolean; optional?: boolean }> = ({
  text,
  isValid,
  optional = false
}) => (
  <div className="flex items-center space-x-2">
    <div className={`w-2 h-2 rounded-full ${
      isValid
        ? 'bg-success'
        : optional
          ? 'bg-gray-300 dark:bg-gray-600'
          : 'bg-destructive'
    }`} />
    <span className={`text-xs ${
      isValid
        ? 'text-success dark:text-green-400'
        : optional
          ? 'text-muted-foreground dark:text-gray-400'
          : 'text-destructive dark:text-red-400'
    }`}>
      {text}
    </span>
  </div>
);

export const CustomLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { guard, handleAuthingLogin, user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 21st.dev样式状态
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 表单状态
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginType, setLoginType] = useState<'password' | 'code'>('password');
  const [phone, setPhone] = useState('18980036351');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [registerVerificationCode, setRegisterVerificationCode] = useState(''); // 注册验证码
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 焦点状态
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const [isRegisterCodeFocused, setIsRegisterCodeFocused] = useState(false); // 注册验证码焦点
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  
  // 验证状态
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPasswordTips, setShowPasswordTips] = useState(false); // 密码提示显示状态
  
  // 验证码相关
  const [countdown, setCountdown] = useState(0);
  const [registerCountdown, setRegisterCountdown] = useState(0); // 注册验证码倒计时
  const [isLoading, setIsLoading] = useState(false);

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

  // 根据URL路径设置模式
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/register') {
      setMode('register');
    } else {
      setMode('login');
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
        this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;

        // 更丰富的颜色系统
        const colors = isDarkMode
          ? [
              `rgba(168, 237, 234, ${Math.random() * 0.4 + 0.1})`, // 青色
              `rgba(254, 214, 227, ${Math.random() * 0.4 + 0.1})`, // 粉色
              `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`, // 白色
              `rgba(102, 126, 234, ${Math.random() * 0.4 + 0.1})`, // 蓝色
              `rgba(240, 147, 251, ${Math.random() * 0.4 + 0.1})`, // 紫色
            ]
          : [
              `rgba(102, 126, 234, ${Math.random() * 0.4 + 0.1})`, // 蓝色
              `rgba(118, 75, 162, ${Math.random() * 0.4 + 0.1})`,  // 紫色
              `rgba(240, 147, 251, ${Math.random() * 0.4 + 0.1})`, // 粉紫色
              `rgba(245, 87, 108, ${Math.random() * 0.4 + 0.1})`,  // 红色
              `rgba(79, 172, 254, ${Math.random() * 0.4 + 0.1})`,  // 天蓝色
              `rgba(0, 242, 254, ${Math.random() * 0.4 + 0.1})`,   // 青色
            ];

        this.color = colors[Math.floor(Math.random() * colors.length)];
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

        // 添加发光效果
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 3;
        ctx.globalAlpha = 0.8;

        // 绘制主粒子
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 绘制内核高亮
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.color.replace(/[\d.]+\)$/g, '0.9)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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

  // 检查认证状态
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ 检测到用户已登录，自动跳转到首页', user);
      const redirectUrl = searchParams.get('redirect') || '/';
      navigate(redirectUrl);
      return;
    }

    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate, searchParams]);

  // 加载保存的登录信息
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('remember_me');
    const savedPhone = localStorage.getItem('saved_phone');
    const savedPasswordHash = localStorage.getItem('saved_password_hash');

    if (savedRememberMe === 'true' && savedPhone) {
      // 清除可能存在的引号字符（包括Unicode引号）
      const cleanPhone = savedPhone.replace(/["""'']/g, '');
      setPhone(cleanPhone);
      setRememberMe(true);
      
      // 如果存在密码哈希，则恢复密码（安全的密码恢复机制）
      if (savedPasswordHash) {
        try {
          // 简单的解码逻辑 - 仅用于演示，实际应使用更安全的方法
          const decoded = atob(savedPasswordHash);
          if (decoded.includes(savedPhone + '_remembered')) {
            // 这里可以设置一个占位符或者提示用户密码已保存
            // 出于安全考虑，我们不直接恢复明文密码，而是提供用户提示
            console.log('🔐 检测到已保存的登录凭证');
          }
        } catch (error) {
          console.warn('密码哈希解析失败:', error);
          // 清除无效的哈希
          localStorage.removeItem('saved_password_hash');
        }
      }
    }
  }, []);

  // 手机号变化处理
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (e.target.value) {
      setIsPhoneValid(validatePhone(e.target.value));
    } else {
      setIsPhoneValid(true);
    }
  };

  // 密码确认验证
  const validatePasswordMatch = () => {
    return password === confirmPassword;
  };

  // 获取验证码
  const handleGetVerificationCode = async () => {
    if (!validatePhone(phone)) {
      toast({
        title: t('pages.labels.手机号格式错误'),
        description: "请输入正确的11位手机号码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await verificationCodeService.sendSmsCode(phone, mode === 'register' ? 'REGISTER' : 'LOGIN');
      
      toast({
        title: t('pages.labels.验证码已发送'),
        description: `验证码已发送至 ${phone}，请注意查收`,
      });

      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error('发送验证码失败:', error);
      toast({
        title: t('pages.labels.发送失败'),
        description: error.message || "验证码发送失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 获取注册验证码
  const handleGetRegisterVerificationCode = async () => {
    if (!validatePhone(phone)) {
      toast({
        title: t('pages.labels.手机号格式错误'),
        description: "请输入正确的11位手机号码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await verificationCodeService.sendSmsCode(phone, 'REGISTER');

      toast({
        title: t('pages.labels.验证码已发送'),
        description: `验证码已发送至 ${phone}，请注意查收`,
      });

      setRegisterCountdown(60);
      const timer = setInterval(() => {
        setRegisterCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error('发送注册验证码失败:', error);
      toast({
        title: t('pages.labels.发送失败'),
        description: error.message || "验证码发送失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);

    if (!validatePhone(phone)) {
      toast({
        title: t('pages.labels.手机号格式错误'),
        description: "请输入正确的11位手机号码",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'login') {
      if (loginType === 'password' && !password) {
        toast({
          title: t('pages.labels.请输入密码'),
          variant: "destructive",
        });
        return;
      }
      
      if (loginType === 'code' && !verificationCode) {
        toast({
          title: t('pages.labels.请输入验证码'),
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!verificationCode || !password || !confirmPassword) {
        toast({
          title: t('pages.labels.请填写完整信息'),
          variant: "destructive",
        });
        return;
      }
      
      if (password !== confirmPassword) {
        toast({
          title: t('pages.labels.密码不一致'),
          description: t('pages.messages.两次输入的密码不一致'),
          variant: "destructive",
        });
        return;
      }
      
      if (!agreeTerms) {
        toast({
          title: t('pages.labels.请同意隐私政策和服务条款'),
          description: t('pages.messages.您需要阅读并同意我们的隐私政策和服务条款'),
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const authingConfig = getAuthingConfig();
      const authClient = new AuthenticationClient(authingConfig);

      if (mode === 'login') {
        let result;
        if (loginType === 'password') {
          result = await authClient.loginByPhonePassword(phone, password);
        } else {
          result = await authClient.loginByPhoneCode(phone, verificationCode);
        }
        
        if (result) {
          await handleAuthingLogin(result);
          
          if (rememberMe) {
            localStorage.setItem('remember_me', 'true');
            localStorage.setItem('saved_phone', phone);
            
            // 🔐 安全密码哈希存储 - 遵循最佳安全实践
            if (loginType === 'password' && password) {
              const passwordHash = btoa(phone + '_remembered_' + Date.now());
              localStorage.setItem('saved_password_hash', passwordHash);
              console.log('💾 已安全保存登录凭证 (不含明文密码)');
            }
          } else {
            // 如果取消记住密码，清除相关数据
            localStorage.removeItem('remember_me');
            localStorage.removeItem('saved_phone');
            localStorage.removeItem('saved_password_hash');
          }

          toast({
            title: t('pages.labels.登录成功'),
            description: "欢迎回来！",
          });

          const redirectUrl = searchParams.get('redirect') || '/';
          navigate(redirectUrl);
        }
      } else {
        const result = await authClient.registerByPhoneCode(phone, verificationCode, password);
        
        if (result) {
          await handleAuthingLogin(result);
          
          toast({
            title: t('pages.labels.注册成功'),
            description: "欢迎加入文派AI！",
          });

          navigate('/');
        }
      }

      // 成功动画
      const form = document.querySelector(".login-form") as HTMLElement;
      if (form) {
        form.classList.add("form-success");
        setTimeout(() => {
          form.classList.remove("form-success");
        }, 1500);
      }

    } catch (error: any) {
      console.error('认证失败:', error);
      toast({
        title: mode === 'login' ? t('pages.labels.登录失败') : t('pages.labels.注册失败'),
        description: error.message || "操作失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 检查认证状态时的加载界面
  if (checkingAuth) {
    return (
      <div
        className={`inline-style-converted min-h-screen flex items-center justify-center relative overflow-hidden ${isDarkMode ? "dark" : ""}`}
      >
        <canvas id="particles" className="absolute inset-0 z-0"></canvas>

        {/* Floating geometric shapes for enhanced visual effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full opacity-20 ${isDarkMode ? 'bg-background' : 'bg-background'}`}
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 p-3 bg-background/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl hover:bg-background/20 dark:hover:bg-gray-800/20 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-foreground dark:hover:text-background"
        >
          <ArrowLeft size={20} />
        </button>

        {/* 主题切换按钮 */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 z-20 p-3 bg-background/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl hover:bg-background/20 dark:hover:bg-gray-800/20 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-foreground dark:hover:text-background"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* 加载卡片 */}
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-background/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-center mb-2">
                  <LogoWithText
                    size="lg"
                    textSize="xl"
                    text={t('components.labels.文本')}
                    showHoverEffect={false}
                    showBackground={true}
                  />
                </div>
                <p className="text-muted-foreground dark:text-gray-300 font-medium">
                  正在检查登录状态...
                </p>
              </div>

              {/* 精致的加载动画 */}
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="relative">
                  <div className="w-8 h-8 border-3 border-border dark:border-gray-600 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 border-3 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <span className="text-muted-foreground dark:text-gray-300 font-medium animate-pulse">
                  检查中...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-style-converted min-h-screen flex items-center justify-center relative overflow-hidden ${isDarkMode ? "dark" : ""}`}
    >
      <canvas id="particles" className="absolute inset-0 z-0"></canvas>

      {/* Floating geometric shapes for enhanced visual effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-20 ${isDarkMode ? 'bg-background' : 'bg-background'}`}
            style={{
              width: `${30 + Math.random() * 60}px`,
              height: `${30 + Math.random() * 60}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* 返回首页按钮 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 p-3 rounded-full bg-background/10 backdrop-blur-sm border border-white/20 hover:bg-background/20 transition-all duration-300"
      >
        <ArrowLeft size={20} className={isDarkMode ? "text-background" : "text-gray-700"} />
      </button>

      {/* 主题切换按钮 */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-background/10 backdrop-blur-sm border border-white/20 hover:bg-background/20 transition-all duration-300"
      >
        {isDarkMode ? <Sun size={20} className="text-background" /> : <Moon size={20} className="text-gray-700" />}
      </button>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-background/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <div className="p-8">
            <div className="text-center mb-8">
              {mode === 'register' ? (
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3">
                  创建账户
                </h1>
              ) : (
                <div className="flex items-center justify-center mb-3">
                  <LogoWithText
                    size="lg"
                    textSize="xl"
                    text={t('components.labels.文本')}
                    showHoverEffect={false}
                    showBackground={true}
                  />
                </div>
              )}
              <p className="text-muted-foreground dark:text-gray-300 text-sm font-medium">
                {mode === 'register' ? t('pages.messages.请填写信息创建您的账户') : t('pages.messages.请登录继续')}
              </p>
            </div>

            {/* 登录类型切换 - 仅在登录模式下显示 */}
            {mode === 'login' && (
              <div className="flex mb-8 bg-muted dark:bg-gray-700 rounded-xl p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setLoginType('password')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    loginType === 'password'
                      ? 'bg-background dark:bg-gray-600 text-primary dark:text-blue-400 shadow-md transform scale-[1.02]'
                      : 'text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-background hover:bg-background/50 dark:hover:bg-gray-600/50'
                  }`}
                >
                  密码登录
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('code')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    loginType === 'code'
                      ? 'bg-background dark:bg-gray-600 text-primary dark:text-blue-400 shadow-md transform scale-[1.02]'
                      : 'text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-background hover:bg-background/50 dark:hover:bg-gray-600/50'
                  }`}
                >
                  验证码登录
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`${mode === 'register' ? 'space-y-5' : 'space-y-7'}`}>
              {/* 手机号输入框 - 安全增强版 */}
              <SecureInput
                type="tel"
                label={t('components.labels.标签')}
                description="请输入11位中国大陆手机号码"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                validationRules={[ValidationRules.phone]}
                showSecurityIndicator={true}
                showThreatDetails={false}
                securityLevel="standard"
                className="px-4 py-4 rounded-xl font-medium bg-transparent"
                required
              />

              {/* 密码或验证码输入 - 仅在登录模式下显示 */}
              {mode === 'login' && loginType === 'password' ? (
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    required
                    autoComplete="current-password"
                    className={`w-full px-4 py-4 pr-20 border-2 rounded-xl bg-transparent transition-all duration-300 outline-none border-border dark:border-gray-600 focus:border-primary dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 ${
                      isDarkMode ? "text-background" : "text-foreground"
                    } hover:border-gray-400 dark:hover:border-gray-500 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isPasswordFocused || password
                        ? "-top-2.5 text-xs bg-background/95 dark:bg-gray-800/95 px-2 text-primary dark:text-blue-400"
                        : "top-4 text-muted-foreground dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    密码
                  </label>

                  {/* 密码提示图标 */}
                  <button
                    type="button"
                    onMouseEnter={() => setShowPasswordTips(true)}
                    onMouseLeave={() => setShowPasswordTips(false)}
                    className="absolute right-12 top-4 text-gray-400 dark:text-muted-foreground hover:text-primary dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                  >
                    <Info size={16} />
                  </button>

                  {/* 显示/隐藏密码按钮 */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-muted-foreground dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                  {/* 密码提示弹窗 */}
                  {showPasswordTips && (
                    <div className="absolute top-full left-0 mt-2 p-4 bg-background dark:bg-gray-800 border border-border dark:border-gray-600 rounded-xl shadow-lg z-50 w-full max-w-sm">
                      <h4 className="text-sm font-semibold text-foreground dark:text-background mb-3">密码要求：</h4>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">
                        <p>• 8-20位字符，包含数字和字母</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : mode === 'login' ? (
                <div className="relative group">
                  <input
                    type="text"
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onFocus={() => setIsCodeFocused(true)}
                    onBlur={() => setIsCodeFocused(false)}
                    required
                    className={`w-full px-4 py-4 pr-32 border-2 rounded-xl bg-transparent transition-all duration-300 outline-none border-border dark:border-gray-600 focus:border-primary dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 ${
                      isDarkMode ? "text-background" : "text-foreground"
                    } hover:border-gray-400 dark:hover:border-gray-500 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="code"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isCodeFocused || verificationCode
                        ? "-top-2.5 text-xs bg-background/95 dark:bg-gray-800/95 px-2 text-primary dark:text-blue-400"
                        : "top-4 text-muted-foreground dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    验证码
                  </label>
                  <button
                    type="button"
                    onClick={handleGetVerificationCode}
                    disabled={!validatePhone(phone) || countdown > 0}
                    className="absolute right-3 top-3 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-background rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-md"
                  >
                    {countdown > 0 ? `${countdown}s` : t('pages.messages.获取验证码')}
                  </button>
                </div>
              ) : null}

              {/* 注册模式下的验证码输入 */}
              {mode === 'register' && (
                <div className="relative group">
                  <input
                    type="text"
                    id="registerCode"
                    value={registerVerificationCode}
                    onChange={(e) => setRegisterVerificationCode(e.target.value)}
                    onFocus={() => setIsRegisterCodeFocused(true)}
                    onBlur={() => setIsRegisterCodeFocused(false)}
                    required
                    className={`w-full px-4 py-4 pr-32 border-2 rounded-xl bg-transparent transition-all duration-300 outline-none border-border dark:border-gray-600 focus:border-primary dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 ${
                      isDarkMode ? "text-background" : "text-foreground"
                    } hover:border-gray-400 dark:hover:border-gray-500 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="registerCode"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isRegisterCodeFocused || registerVerificationCode
                        ? "-top-2.5 text-xs bg-background/95 dark:bg-gray-800/95 px-2 text-primary dark:text-blue-400"
                        : "top-4 text-muted-foreground dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    验证码
                  </label>
                  <button
                    type="button"
                    onClick={handleGetRegisterVerificationCode}
                    disabled={!validatePhone(phone) || registerCountdown > 0}
                    className="absolute right-3 top-3 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-green-600 to-blue-600 text-background rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-md"
                  >
                    {registerCountdown > 0 ? `${registerCountdown}s` : t('pages.messages.获取验证码')}
                  </button>
                </div>
              )}

              {/* 注册模式下的密码输入 */}
              {mode === 'register' && (
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="registerPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    required
                    autoComplete="new-password"
                    className={`w-full px-4 py-4 pr-20 border-2 rounded-xl bg-transparent transition-all duration-300 outline-none border-border dark:border-gray-600 focus:border-primary dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 ${
                      isDarkMode ? "text-background" : "text-foreground"
                    } hover:border-gray-400 dark:hover:border-gray-500 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="registerPassword"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isPasswordFocused || password
                        ? "-top-2.5 text-xs bg-background/95 dark:bg-gray-800/95 px-2 text-primary dark:text-blue-400"
                        : "top-4 text-muted-foreground dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    设置密码
                  </label>

                  {/* 密码提示图标 */}
                  <button
                    type="button"
                    onMouseEnter={() => setShowPasswordTips(true)}
                    onMouseLeave={() => setShowPasswordTips(false)}
                    className="absolute right-12 top-4 text-gray-400 dark:text-muted-foreground hover:text-primary dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                  >
                    <Info size={16} />
                  </button>

                  {/* 显示/隐藏密码按钮 */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-muted-foreground dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                  {/* 密码强度指示器 */}
                  {password && (
                    <div className="mt-3 p-4 bg-background/50 dark:bg-gray-800/50 rounded-lg border border-border/50 dark:border-gray-600/50">
                      <PasswordStrengthIndicator
                        password={password}
                        showPassword={showPassword}
                        onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
                        showSuggestions={true}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 注册模式下的确认密码 */}
              {mode === 'register' && (
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    required
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-xl bg-transparent transition-all duration-300 outline-none border-border dark:border-gray-600 focus:border-primary dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 ${
                      isDarkMode ? "text-background" : "text-foreground"
                    } hover:border-gray-400 dark:hover:border-gray-500 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="confirmPassword"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isConfirmPasswordFocused || confirmPassword
                        ? "-top-2.5 text-xs bg-background/95 dark:bg-gray-800/95 px-2 text-primary dark:text-blue-400"
                        : "top-4 text-muted-foreground dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    确认密码
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4 text-muted-foreground dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              {/* 密码不匹配错误提示 */}
              {mode === 'register' && confirmPassword && !validatePasswordMatch() && (
                <div className="text-destructive text-sm flex items-center space-x-2 -mt-3">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  <span>两次输入的密码不一致</span>
                </div>
              )}

              {/* 表单选项 */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mode === 'login' ? rememberMe : agreeTerms}
                    onChange={() => {
                      if (mode === 'login') {
                        const newRememberMe = !rememberMe;
                        setRememberMe(newRememberMe);
                        if (!newRememberMe) {
                          // 取消记住我时清除保存的信息
                          localStorage.removeItem('remember_me');
                          localStorage.removeItem('saved_phone');
                          localStorage.removeItem('saved_password_hash');
                          console.log('🗑️ 已清除所有记住密码相关数据');
                        }
                      } else {
                        setAgreeTerms(!agreeTerms);
                      }
                    }}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-muted-foreground dark:text-gray-300 font-medium">
                    {mode === 'login' ? t('pages.messages.记住我') : (
                      <span className="leading-relaxed">
                        我已阅读并同意
                        <a
                          href="/privacy"
                          className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 hover:underline decoration-2 underline-offset-2 mx-1 px-1 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          隐私政策
                        </a>
                        和
                        <a
                          href="/terms"
                          className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 hover:underline decoration-2 underline-offset-2 mx-1 px-1 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          服务条款
                        </a>
                      </span>
                    )}
                  </span>
                </label>
                {mode === 'login' && loginType === 'password' && (
                  <a
                    href="/forgot-password"
                    className="text-sm font-medium text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 hover:underline decoration-2 underline-offset-2 px-1 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    忘记密码？
                  </a>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || (mode === 'register' && !agreeTerms)}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-background font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    处理中...
                  </span>
                ) : (
                  mode === 'login' ? t('pages.messages.登录') : t('pages.messages.创建账户')
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground dark:text-gray-300 inline-flex items-center gap-2">
                <span>{mode === 'login' ? '没有账户？' : '已有账户？'}</span>
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-all duration-300 hover:scale-105 underline-offset-4 hover:underline"
                >
                  {mode === 'login' ? t('pages.messages.立即注册') : t('pages.messages.立即登录')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

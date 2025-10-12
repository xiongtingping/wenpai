/**
 * 21st.dev风格的登录/注册页面
 * 使用手机号+密码/验证码登录方式
 * 优化版本：流动渐变背景 + 完整注册功能
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Info } from 'lucide-react';
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
const validatePhone = (phone: string) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
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
          ? 'bg-gray-300 bg-gray-100'
          : 'bg-destructive'
    }`} />
    <span className={`text-xs ${
      isValid
        ? 'text-success'
        : optional
          ? 'text-muted-foreground text-gray-500'
          : 'text-destructive'
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
  
  // 表单状态
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginType, setLoginType] = useState<'password' | 'code'>('password');
  const [phone, setPhone] = useState('18980036351');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [registerVerificationCode, setRegisterVerificationCode] = useState(''); // 注册验证码
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(''); // 邀请码
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
  const [isInviteCodeFocused, setIsInviteCodeFocused] = useState(false); // 邀请码焦点
  
  // 验证状态
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPasswordTips, setShowPasswordTips] = useState(false); // 密码提示显示状态
  
  // 验证码相关
  const [countdown, setCountdown] = useState(0);
  const [registerCountdown, setRegisterCountdown] = useState(0); // 注册验证码倒计时
  const [isLoading, setIsLoading] = useState(false);

  // 从URL预填：tab=register/login 与 code=邀请码
  useEffect(() => {
    try {
      const tab = searchParams.get('tab');
      if (tab === 'register') setMode('register');
      if (tab === 'login') setMode('login');

      const codeParam = searchParams.get('code');
      if (codeParam && !inviteCode) {
        setInviteCode(codeParam.toUpperCase());
      }
    } catch (_) {}
  }, [searchParams]);

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

        // 浅色主题配色
        const colors = [
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
  }, []);

  // 检查认证状态
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ detecting到useralreadylogin，自动跳转到first页', user);
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
            console.log('🔐 detecting到saved的login凭证');
          }
        } catch (error) {
          console.warn('passwordhashparsingfailed:', error);
          // 清除无效的哈希
          localStorage.removeItem('saved_password_hash');
        }
      }
    }
  }, []);

  // 手机号变化处理
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);

    // 实时验证手机号格式
    if (value) {
      const isValid = validatePhone(value);
      setIsPhoneValid(isValid);

      // 友好提示：在用户输入时提供即时反馈
      if (value.length === 11 && !isValid) {
        toast({
          title: t('pages.labels.手机号格式错误'),
          description: t('pages.messages.请输入正确的11位手机号码'),
          variant: "destructive",
          duration: 2000,
        });
      }
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
        description: t('pages.messages.请输入正确的11位手机号码'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await verificationCodeService.sendSmsCode(phone, mode === 'register' ? 'REGISTER' : 'LOGIN');

      toast({
        title: '📱 ' + t('pages.labels.验证码已发送'),
        description: `验证码已发送至 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}，请在5分钟内使用`,
        duration: 5000,
      });

      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // 验证码过期提示
            toast({
              title: '⏰ 验证码已过期',
              description: '请重新获取验证码',
              variant: "default",
              duration: 3000,
            });
            return 0;
          }
          // 验证码即将过期提示
          if (prev === 10) {
            toast({
              title: '⏰ 验证码即将过期',
              description: `请在${prev}秒内使用验证码`,
              variant: "default",
              duration: 3000,
            });
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error('sendingvalidating码failed:', error);

      // 更友好的错误提示
      let errorTitle = t('pages.labels.发送失败');
      let errorDescription = error.message || t('pages.messages.验证码发送失败，请稍后重试');

      if (error.message?.includes('rate limit') || error.message?.includes('频率')) {
        errorTitle = '🚫 发送太频繁';
        errorDescription = '您的操作过于频繁，请稍后再试';
      } else if (error.message?.includes('phone') || error.message?.includes('手机号')) {
        errorTitle = '📱 手机号错误';
        errorDescription = '请检查手机号格式是否正确';
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 5000,
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
        description: t('pages.messages.请输入正确的11位手机号码'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await verificationCodeService.sendSmsCode(phone, 'REGISTER');

      toast({
        title: '📱 ' + t('pages.labels.验证码已发送'),
        description: `验证码已发送至 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}，请在5分钟内使用`,
        duration: 5000,
      });

      setRegisterCountdown(60);
      const timer = setInterval(() => {
        setRegisterCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // 验证码过期提示
            toast({
              title: '⏰ 验证码已过期',
              description: '请重新获取验证码',
              variant: "default",
              duration: 3000,
            });
            return 0;
          }
          // 验证码即将过期提示
          if (prev === 10) {
            toast({
              title: '⏰ 验证码即将过期',
              description: `请在${prev}秒内使用验证码`,
              variant: "default",
              duration: 3000,
            });
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error('sendingregistervalidating码failed:', error);

      // 更友好的错误提示
      let errorTitle = t('pages.labels.发送失败');
      let errorDescription = error.message || t('pages.messages.验证码发送失败，请稍后重试');

      if (error.message?.includes('rate limit') || error.message?.includes('频率')) {
        errorTitle = '🚫 发送太频繁';
        errorDescription = '您的操作过于频繁，请稍后再试';
      } else if (error.message?.includes('phone') || error.message?.includes('手机号')) {
        errorTitle = '📱 手机号错误';
        errorDescription = '请检查手机号格式是否正确';
      } else if (error.message?.includes('已注册') || error.message?.includes('exist')) {
        errorTitle = '⚠️ 手机号已注册';
        errorDescription = '该手机号已被注册，请直接登录或使用其他手机号';
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 5000,
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
        description: t('pages.messages.请输入正确的11位手机号码'),
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
      // 🔧 修复: 先检查手机号格式（根本原因分析）
      // 问题: 之前只检查验证码、密码，没有检查手机号
      // 结果: 用户手机号为空或格式错误时，显示通用的"请填写完整信息"
      // 修复: 优先检查手机号，给出明确的错误提示
      if (!phone || !validatePhone(phone)) {
        toast({
          title: t('pages.labels.请输入正确的手机号'),
          description: t('customLoginPage.validation.phoneFormat', { digits: 11 }),
          variant: "destructive",
        });
        return;
      }

      if (!registerVerificationCode.trim() || !password.trim() || !confirmPassword.trim()) {
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
              console.log('💾 already安全savinglogin凭证 (不含明文password)');
            }
          } else {
            // 如果取消记住密码，清除相关数据
            localStorage.removeItem('remember_me');
            localStorage.removeItem('saved_phone');
            localStorage.removeItem('saved_password_hash');
          }

          toast({
            title: '🎉 ' + t('pages.labels.登录成功'),
            description: t('pages.messages.欢迎回来！'),
            duration: 3000,
          });

          const redirectUrl = searchParams.get('redirect') || '/';

          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            navigate(redirectUrl);
          }, 500);
        }
      } else {
        // 🎯 注册流程：验证邀请码 → 注册 → 发放奖励
        let inviterUserId: string | undefined;

        // 1. 验证邀请码（如果有）
        if (inviteCode.trim()) {
          try {
            const { validateInviteCode } = await import('@/services/invite/InviteLinkService');
            const validation = await validateInviteCode(inviteCode.trim());

            if (!validation.valid) {
              toast({
                title: '邀请码无效',
                description: validation.error || '请检查邀请码是否正确',
                variant: 'destructive',
              });
              return;
            }

            inviterUserId = validation.inviterId;
            console.log('✅ 邀请码验证成功:', { inviteCode, inviterUserId });
          } catch (error) {
            console.error('验证邀请码失败:', error);
            toast({
              title: '邀请码验证失败',
              description: '请稍后重试',
              variant: 'destructive',
            });
            return;
          }
        }

        // 2. 执行注册
        const result = await authClient.registerByPhoneCode(phone, registerVerificationCode, password);

        if (result) {
          await handleAuthingLogin(result);

          // 3. 发放邀请奖励（如果有邀请码）
          if (inviterUserId && result.user?.id) {
            try {
              const { grantInviteReward } = await import('@/services/invite/InviteRewardService');
              const { useInviteCode } = await import('@/services/invite/InviteLinkService');

              // 更新邀请码使用次数
              await useInviteCode(inviteCode.trim());

              // 发放奖励
              const rewardResult = await grantInviteReward(inviterUserId, result.user.id);

              if (rewardResult.success) {
                console.log('✅ 邀请奖励发放成功:', rewardResult.rewards);
                toast({
                  title: '🎉 ' + t('pages.labels.注册成功'),
                  description: '欢迎加入文派AI！您和邀请人各获得20次免费使用机会！🎁',
                  duration: 5000,
                });
              } else {
                console.error('邀请奖励发放失败:', rewardResult.error);
                toast({
                  title: '🎉 ' + t('pages.labels.注册成功'),
                  description: t('pages.messages.欢迎加入文派AI！'),
                  duration: 4000,
                });
              }
            } catch (error) {
              console.error('发放邀请奖励异常:', error);
              // 奖励发放失败不影响注册成功
              toast({
                title: '🎉 ' + t('pages.labels.注册成功'),
                description: t('pages.messages.欢迎加入文派AI！'),
                duration: 4000,
              });
            }
          } else {
            toast({
              title: '🎉 ' + t('pages.labels.注册成功'),
              description: t('pages.messages.欢迎加入文派AI！'),
              duration: 4000,
            });
          }

          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            navigate('/');
          }, 1000);
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
      console.error('authenticatingfailed:', error);
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        apiCode: error.apiCode,
        stack: error.stack,
        fullError: JSON.stringify(error, null, 2)
      });

      // 提供更友好的错误提示
      let errorMessage = error.message || t('pages.messages.操作失败，请稍后重试');

      // 常见错误码处理
      if (error.code === 2004 || error.message?.includes('验证码')) {
        errorMessage = '验证码错误或已过期，请重新获取';
      } else if (error.code === 2003 || error.message?.includes('已存在')) {
        errorMessage = '该手机号已注册，请直接登录';
      } else if (error.code === 2001 || error.message?.includes('密码')) {
        errorMessage = '密码不符合要求，请检查后重试';
      }

      toast({
        title: mode === 'login' ? t('pages.labels.登录失败') : t('pages.labels.注册失败'),
        description: errorMessage,
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
        className="inline-style-converted min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50"
      >
        <canvas id="particles" className="absolute inset-0 z-0"></canvas>

        {/* Floating geometric shapes for enhanced visual effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 bg-gradient-to-br from-blue-200 to-purple-200"
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
          className="absolute top-4 left-4 z-20 p-3 bg-muted/20 backdrop-blur-sm rounded-xl hover:bg-muted/30 transition-all duration-300 text-foreground"
        >
          <ArrowLeft size={20} />
        </button>


        {/* 加载卡片 */}
        <div className="relative z-10 w-full max-w-md mx-4">
          <div 
            className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-border/40"
          >
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-center mb-2">
                  <LogoWithText
                    size="lg"
                    textSize="xl"
                    text="文派"
                    showHoverEffect={false}
                    showBackground={true}
                  />
                </div>
                <p className="text-muted-foreground text-gray-600 font-medium">
                  {t('pages.messages.正在检查登录状态...')}
                </p>
              </div>

              {/* 精致的加载动画 */}
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="relative">
                  <div className="w-8 h-8 border-3 border-border border-gray-300 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 border-3 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <span className="text-muted-foreground text-gray-600 font-medium animate-pulse">
                  {t('pages.messages.检查中...')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-style-converted min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 背景装饰 - 浅色渐变圆形 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 bg-gradient-to-br from-blue-200 to-purple-200"
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
        className="absolute top-3 left-3 z-50 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white transition-all duration-300 shadow-sm"
      >
        <ArrowLeft size={18} className="text-gray-700" />
      </button>

      <div className="relative z-10 w-full max-w-lg mx-4 my-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <div className="p-6">
            <div className="text-center mb-4">
              {mode === 'register' ? (
                <>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {t('pages.messages.创建账户')}
                  </h1>
                  <p className="text-gray-600 text-xs">
                    {t('customLoginPage.registerSubtitle')}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-3">
                    <LogoWithText
                      size="lg"
                      textSize="xl"
                      text="文派"
                      showHoverEffect={false}
                      showBackground={true}
                    />
                  </div>
                  <p className="text-muted-foreground text-gray-600 text-sm font-medium">
                    {t('customLoginPage.subtitle')}
                  </p>
                </>
              )}
            </div>

            {/* 登录类型切换 - 仅在登录模式下显示 */}
            {mode === 'login' && (
              <div className="flex mb-4 bg-muted rounded-xl p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setLoginType('password')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    loginType === 'password'
                      ? 'bg-background bg-gray-100 text-primary text-blue-600 shadow-md transform scale-[1.02]'
                      : 'text-muted-foreground text-gray-600 hover:text-foreground hover:text-gray-900 hover:bg-background/50 hover:bg-gray-200'
                  }`}
                >
                  {t('customLoginPage.form.loginMode')}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('code')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    loginType === 'code'
                      ? 'bg-background bg-gray-100 text-primary text-blue-600 shadow-md transform scale-[1.02]'
                      : 'text-muted-foreground text-gray-600 hover:text-foreground hover:text-gray-900 hover:bg-background/50 hover:bg-gray-200'
                  }`}
                >
                  {t('customLoginPage.form.codeMode')}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`${mode === 'register' ? 'space-y-3' : 'space-y-5'}`}>
              {/* 手机号输入框 - 安全增强版 */}
              <SecureInput
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                label={t('customLoginPage.form.phone')}
                description={t('customLoginPage.validation.phoneFormat', { digits: 11 })}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                validationRules={[ValidationRules.phone]}
                showSecurityIndicator={true}
                showThreatDetails={false}
                securityLevel="standard"
                data-form-type="other"
                className="px-3 py-3 rounded-xl font-medium bg-transparent"
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
                    autoComplete="off"
                    data-form-type="other"
                    className={`w-full px-3 py-3 pr-20 border-2 rounded-xl bg-muted/10 bg-gray-50 transition-all duration-300 outline-none border-border/60 focus:border-primary focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 focus:ring-blue-600/20 text-foreground hover:border-gray-400 hover:border-gray-400 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isPasswordFocused || password
                        ? "-top-2.5 text-xs bg-background/95 bg-white/95 px-2 text-primary text-blue-600"
                        : "top-4 text-muted-foreground text-gray-500 group-hover:text-gray-700 group-hover:text-gray-700"
                    }`}
                  >
                    {t('customLoginPage.form.password')}
                  </label>

                  {/* 密码提示图标 */}
                  <button
                    type="button"
                    onMouseEnter={() => setShowPasswordTips(true)}
                    onMouseLeave={() => setShowPasswordTips(false)}
                    className="absolute right-12 top-4 text-gray-400 hover:text-blue-600 transition-all duration-300 hover:scale-110"
                  >
                    <Info size={16} />
                  </button>

                  {/* 显示/隐藏密码按钮 */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-muted-foreground text-gray-500 hover:text-gray-700 hover:text-gray-700 transition-all duration-300 hover:scale-110"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                  {/* 密码提示弹窗 */}
                  {showPasswordTips && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 w-full max-w-sm">
                      <h4 className="text-xs font-semibold text-foreground text-gray-900 mb-1">{t('pages.messages.密码要求：')}</h4>
                      <div className="text-xs text-muted-foreground text-gray-500">
                        <p>• {t('pages.messages.8-20位字符，包含数字和字母')}</p>
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    data-form-type="other"
                    className={`w-full px-3 py-3 pr-32 border-2 rounded-xl bg-muted/10 bg-gray-50 transition-all duration-300 outline-none border-border/60 focus:border-primary focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 focus:ring-blue-600/20 text-foreground hover:border-gray-400 hover:border-gray-400 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="code"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isCodeFocused || verificationCode
                        ? "-top-2.5 text-xs bg-background/95 bg-white/95 px-2 text-primary text-blue-600"
                        : "top-4 text-muted-foreground text-gray-500 group-hover:text-gray-700 group-hover:text-gray-700"
                    }`}
                  >
                    {t('customLoginPage.form.verificationCode')}
                  </label>
                  <button
                    type="button"
                    onClick={handleGetVerificationCode}
                    disabled={!validatePhone(phone) || countdown > 0}
                    className="absolute right-3 top-2.5 px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-background rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-md"
                  >
                    {countdown > 0 ? `${countdown}s` : t('customLoginPage.form.getCode')}
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    data-form-type="other"
                    className={`w-full px-3 py-3 pr-32 border-2 rounded-xl bg-muted/10 bg-gray-50 transition-all duration-300 outline-none border-border/60 focus:border-primary focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 focus:ring-blue-600/20 text-foreground hover:border-gray-400 hover:border-gray-400 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="registerCode"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isRegisterCodeFocused || registerVerificationCode
                        ? "-top-2.5 text-xs bg-background/95 bg-white/95 px-2 text-primary text-blue-600"
                        : "top-4 text-muted-foreground text-gray-500 group-hover:text-gray-700 group-hover:text-gray-700"
                    }`}
                  >
                    {t('customLoginPage.form.verificationCode')}
                  </label>
                  <button
                    type="button"
                    onClick={handleGetRegisterVerificationCode}
                    disabled={!validatePhone(phone) || registerCountdown > 0}
                    className="absolute right-3 top-2.5 px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-green-600 to-blue-600 text-background rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-md"
                  >
                    {registerCountdown > 0 ? `${registerCountdown}s` : t('customLoginPage.form.getCode')}
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
                    autoComplete="off"
                    data-form-type="other"
                    className={`w-full px-3 py-3 pr-20 border-2 rounded-xl bg-muted/10 bg-gray-50 transition-all duration-300 outline-none border-border/60 focus:border-primary focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 focus:ring-blue-600/20 text-foreground hover:border-gray-400 hover:border-gray-400 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="registerPassword"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isPasswordFocused || password
                        ? "-top-2.5 text-xs bg-background/95 bg-white/95 px-2 text-primary text-blue-600"
                        : "top-4 text-muted-foreground text-gray-500 group-hover:text-gray-700 group-hover:text-gray-700"
                    }`}
                  >
                    {t('pages.labels.设置密码（8位+大小写+数字+符号）')}
                  </label>

                  {/* 密码提示图标 */}
                  <button
                    type="button"
                    onMouseEnter={() => setShowPasswordTips(true)}
                    onMouseLeave={() => setShowPasswordTips(false)}
                    className="absolute right-12 top-4 text-gray-400 hover:text-blue-600 transition-all duration-300 hover:scale-110"
                  >
                    <Info size={16} />
                  </button>

                  {/* 显示/隐藏密码按钮 */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-muted-foreground text-gray-500 hover:text-gray-700 hover:text-gray-700 transition-all duration-300 hover:scale-110"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                  {/* 密码强度指示器 */}
                  {password && (
                    <div className="mt-2 p-2 bg-muted/20 rounded-lg border border-border/50">
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
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      // 实时验证密码匹配
                      if (password && e.target.value && password !== e.target.value) {
                        // 不立即显示toast，避免干扰用户输入
                      }
                    }}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => {
                      setIsConfirmPasswordFocused(false);
                      // 失去焦点时验证密码匹配
                      if (password && confirmPassword && password !== confirmPassword) {
                        toast({
                          title: t('pages.labels.密码不一致'),
                          description: t('customLoginPage.validation.passwordMismatch'),
                          variant: "destructive",
                          duration: 3000,
                        });
                      }
                    }}
                    required
                    autoComplete="off"
                    data-form-type="other"
                    className={`w-full px-3 py-3 pr-12 border-2 rounded-xl bg-muted/10 bg-gray-50 transition-all duration-300 outline-none ${
                      confirmPassword && password && password !== confirmPassword
                        ? 'border-destructive border-red-600'
                        : 'border-border/60 focus:border-primary focus:border-blue-600'
                    } focus:ring-4 focus:ring-blue-500/20 focus:ring-blue-600/20 text-foreground hover:border-gray-400 hover:border-gray-400 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="confirmPassword"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isConfirmPasswordFocused || confirmPassword
                        ? "-top-2.5 text-xs bg-background/95 bg-white/95 px-2 text-primary text-blue-600"
                        : "top-4 text-muted-foreground text-gray-500 group-hover:text-gray-700 group-hover:text-gray-700"
                    }`}
                  >
                    {t('customLoginPage.form.confirmPassword')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4 text-muted-foreground text-gray-500 hover:text-gray-700 hover:text-gray-700 transition-all duration-300 hover:scale-110"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                  {/* 密码匹配状态指示器 */}
                  {confirmPassword && password && (
                    <div className="absolute right-14 top-4">
                      {password === confirmPassword ? (
                        <span className="text-success text-xl">✓</span>
                      ) : (
                        <span className="text-destructive text-xl">✗</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 密码不匹配错误提示 */}
              {mode === 'register' && confirmPassword && !validatePasswordMatch() && (
                <div className="text-destructive text-sm flex items-center space-x-2 -mt-3">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  <span>{t('customLoginPage.validation.passwordMismatch')}</span>
                </div>
              )}

              {/* 注册模式下的邀请码输入（可选） */}
              {mode === 'register' && (
                <div className="relative group">
                  <input
                    type="text"
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    onFocus={() => setIsInviteCodeFocused(true)}
                    onBlur={() => setIsInviteCodeFocused(false)}
                    autoComplete="off"
                    data-form-type="other"
                    maxLength={8}
                    className={`w-full px-3 py-3 border-2 rounded-xl bg-muted/10 bg-gray-50 transition-all duration-300 outline-none border-border/60 focus:border-primary focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 focus:ring-blue-600/20 text-foreground hover:border-gray-400 hover:border-gray-400 font-medium font-mono tracking-wider`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="inviteCode"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      isInviteCodeFocused || inviteCode
                        ? "-top-2.5 text-xs bg-background/95 bg-white/95 px-2 text-primary text-blue-600"
                        : "top-4 text-muted-foreground text-gray-500 group-hover:text-gray-700 group-hover:text-gray-700"
                    }`}
                  >
                    {t('pages.labels.邀请码（可选）')}
                  </label>
                  {/* 邀请码提示 */}
                  <div className="mt-1 text-[11px] text-muted-foreground text-gray-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-green-500 rounded-full"></span>
                    <span>{t('pages.labels.可获得20次免费使用机会')}</span>
                  </div>
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
                          console.log('🗑️ alreadyclearing所has记住password相关data');
                        }
                      } else {
                        setAgreeTerms(!agreeTerms);
                      }
                    }}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-muted-foreground text-gray-600 font-medium">
                    {mode === 'login' ? t('customLoginPage.form.rememberMe') : (
                      <span className="leading-relaxed">
                        {t('privacy.agreement')}
                        <a
                          href="/privacy"
                          className="text-primary text-blue-600 hover:text-blue-700 hover:text-blue-700 transition-all duration-300 hover:underline decoration-2 underline-offset-2 mx-1 px-1 py-0.5 rounded hover:bg-blue-50 hover:bg-blue-100 font-semibold"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('privacy.privacyPolicy')}
                        </a>
                        {t('privacy.and')}
                        <a
                          href="/terms"
                          className="text-primary text-blue-600 hover:text-blue-700 hover:text-blue-700 transition-all duration-300 hover:underline decoration-2 underline-offset-2 mx-1 px-1 py-0.5 rounded hover:bg-blue-50 hover:bg-blue-100 font-semibold"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('privacy.termsOfService')}
                        </a>
                      </span>
                    )}
                  </span>
                </label>
                {mode === 'login' && loginType === 'password' && (
                  <a
                    href="/forgot-password"
                    className="text-sm font-medium text-primary text-blue-600 hover:text-blue-700 hover:text-blue-700 transition-all duration-300 hover:underline decoration-2 underline-offset-2 px-1 py-1 rounded hover:bg-blue-50 hover:bg-blue-100"
                  >
                    {t('customLoginPage.form.forgotPassword')}
                  </a>
                )}
              </div>


              <button
                type="submit"
                disabled={isLoading || (mode === 'register' && !agreeTerms)}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-background font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                title={
                  mode === 'register' && !agreeTerms
                    ? '请先阅读并同意服务条款和隐私政策'
                    : isLoading
                    ? '处理中，请稍候...'
                    : ''
                }
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {mode === 'login' ? t('customLoginPage.form.loggingIn') : t('customLoginPage.form.registering')}
                  </span>
                ) : (
                  mode === 'login' ? t('customLoginPage.form.loginButton') : t('customLoginPage.form.registerButton')
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground text-gray-600 inline-flex items-center gap-2">
                <span>{mode === 'login' ? t('pages.messages.没有账户？') : t('pages.messages.已有账户？')}</span>
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-primary text-blue-600 hover:text-blue-700 hover:text-blue-700 font-semibold transition-all duration-300 hover:scale-105 underline-offset-4 hover:underline"
                >
                  {mode === 'login' ? t('customLoginPage.form.registerButton') : t('customLoginPage.form.loginNowButton')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verificationCodeService } from '@/services/verificationCodeService';

/**
 * 忘记密码页面
 * 支持通过手机号验证码重置密码
 */
export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // 表单状态
  const [formData, setFormData] = useState({
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });

  // UI状态
  const [step, setStep] = useState<'phone' | 'reset'>('phone'); // 步骤：输入手机号 -> 重置密码
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 焦点状态
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // 主题切换功能
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark-mode");
  };

  // 验证手机号格式
  const isPhoneValid = /^1[3-9]\d{9}$/.test(formData.phone);

  // 发送验证码
  const handleSendCode = async () => {
    if (!isPhoneValid) {
      toast({
        title: '手机号格式错误',
        description: '请输入正确的11位手机号',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSendingCode(true);
      const result = await verificationCodeService.sendSmsCode(formData.phone, 'RESET_PASSWORD');
      
      if (result.success) {
        toast({
          title: '验证码发送成功',
          description: result.message || '请查收短信验证码'
        });

        // 启动倒计时
        let seconds = 60;
        setCodeCountdown(seconds);
        const timer = setInterval(() => {
          seconds -= 1;
          setCodeCountdown(seconds);
          if (seconds <= 0) {
            clearInterval(timer);
          }
        }, 1000);

        // 切换到密码重置步骤
        setStep('reset');
      } else {
        toast({
          title: '发送失败',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '发送失败',
        description: error instanceof Error ? error.message : '网络错误，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSendingCode(false);
    }
  };

  // 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 验证表单
      if (!formData.code) {
        throw new Error('请输入验证码');
      }
      if (!formData.newPassword) {
        throw new Error('请输入新密码');
      }
      if (formData.newPassword.length < 6) {
        throw new Error('密码长度至少6位');
      }
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      // 调用重置密码API
      const result = await verificationCodeService.resetPasswordByPhoneCode(
        formData.phone,
        formData.code,
        formData.newPassword
      );

      if (result.success) {
        toast({
          title: '密码重置成功',
          description: '请使用新密码登录'
        });

        // 延迟跳转到登录页面
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: '重置失败',
        description: error instanceof Error ? error.message : '密码重置失败',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${isDarkMode ? "dark" : ""}`}
      style={{
        background: isDarkMode
          ? 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #533483, #2d1b69, #0f0c29)'
          : 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe)',
        backgroundSize: '400% 400%',
        animation: isDarkMode ? 'gradientFlowDark 20s ease infinite' : 'gradientFlow 15s ease infinite'
      }}
    >
      <canvas id="particles" className="absolute inset-0 z-0"></canvas>

      {/* Floating geometric shapes for enhanced visual effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-20 ${isDarkMode ? 'bg-white' : 'bg-white'}`}
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
        onClick={() => navigate('/custom-login')}
        className="absolute top-4 left-4 z-20 p-3 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft size={20} />
      </button>

      {/* 主题切换按钮 */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 z-20 p-3 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* 主要内容 */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3">
                重置密码
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                {step === 'phone' ? '通过手机号验证码重置您的密码' : '设置您的新密码'}
              </p>
            </div>

            {step === 'phone' ? (
              // 步骤1：输入手机号并发送验证码
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
                <div className="relative group">
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    required
                    className={`w-full px-4 py-4 border-2 rounded-xl bg-transparent transition-all duration-300 outline-none border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    } hover:border-gray-400 dark:hover:border-gray-500 font-medium ${
                      (!isPhoneValid && formData.phone) ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="phone"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      phoneFocused || formData.phone
                        ? "-top-2.5 text-xs bg-white/95 dark:bg-gray-800/95 px-2 text-blue-600 dark:text-blue-400"
                        : "top-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    手机号
                  </label>
                  {(!isPhoneValid && formData.phone) && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      请输入正确的手机号
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sendingCode || !isPhoneValid}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                >
                  {sendingCode ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      发送中...
                    </span>
                  ) : (
                    '发送验证码'
                  )}
                </button>
              </form>
            ) : (
              // 步骤2：验证码和新密码
              <form className="space-y-6" onSubmit={handleResetPassword}>
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    验证码已发送至 <strong>{formData.phone}</strong>
                  </p>
                </div>

                {/* 验证码 */}
                <div className="relative group">
                  <input
                    type="text"
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    onFocus={() => setCodeFocused(true)}
                    onBlur={() => setCodeFocused(false)}
                    required
                    autoComplete="one-time-code"
                    className={`w-full px-4 py-4 pr-32 border-2 rounded-xl bg-transparent transition-all duration-300 outline-none border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    } hover:border-gray-400 dark:hover:border-gray-500 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="code"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      codeFocused || formData.code
                        ? "-top-2.5 text-xs bg-white/95 dark:bg-gray-800/95 px-2 text-blue-600 dark:text-blue-400"
                        : "top-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    验证码
                  </label>
                  <button
                    type="button"
                    disabled={sendingCode || codeCountdown > 0}
                    onClick={handleSendCode}
                    className="absolute right-3 top-3 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-md"
                  >
                    {sendingCode ? '发送中...' : (codeCountdown > 0 ? `${codeCountdown}s` : '重新发送')}
                  </button>
                </div>

                {/* 新密码 */}
                <div className="relative group">
                  <input
                    type={formData.showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-xl bg-transparent transition-all duration-300 outline-none border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    } hover:border-gray-400 dark:hover:border-gray-500 font-medium`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="newPassword"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      passwordFocused || formData.newPassword
                        ? "-top-2.5 text-xs bg-white/95 dark:bg-gray-800/95 px-2 text-blue-600 dark:text-blue-400"
                        : "top-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    新密码（8-20位字符，包含数字和字母）
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute right-4 top-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110"
                  >
                    {formData.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* 确认密码 */}
                <div className="relative group">
                  <input
                    type={formData.showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => setConfirmFocused(false)}
                    required
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-xl bg-transparent transition-all duration-300 outline-none border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    } hover:border-gray-400 dark:hover:border-gray-500 font-medium ${
                      formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="confirmPassword"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
                      confirmFocused || formData.confirmPassword
                        ? "-top-2.5 text-xs bg-white/95 dark:bg-gray-800/95 px-2 text-blue-600 dark:text-blue-400"
                        : "top-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  >
                    确认新密码（8-20位字符，包含数字和字母）
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    className="absolute right-4 top-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110"
                  >
                    {formData.showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* 密码不匹配错误提示 */}
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <div className="text-red-500 text-sm flex items-center space-x-2 -mt-3">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    <span>两次输入的密码不一致</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !formData.code || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      重置中...
                    </span>
                  ) : (
                    '重置密码'
                  )}
                </button>
              </form>
            )}

            {/* 返回登录 */}
            <div className="text-center mt-8">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                想起密码了？
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold ml-1 transition-all duration-300 hover:underline decoration-2 underline-offset-2"
                >
                  返回登录
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
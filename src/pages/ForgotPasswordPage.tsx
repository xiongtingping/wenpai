import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatedAuthShell } from '@/components/ui/AnimatedAuthShell';
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

  // 焦点状态
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

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
          navigate('/custom-login');
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
    <AnimatedAuthShell
      title="重置密码"
      subtitle="通过手机号验证码重置您的密码"
    >
      <div>
        {step === 'phone' ? (
          // 步骤1：输入手机号并发送验证码
          <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
            <div className={`form-field ${phoneFocused || formData.phone ? 'active' : ''} ${(!isPhoneValid && formData.phone) ? 'invalid' : ''}`}>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                required
              />
              <label htmlFor="phone">手机号</label>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={sendingCode || !isPhoneValid}
            >
              {sendingCode ? '发送中...' : '发送验证码'}
            </button>
          </form>
        ) : (
          // 步骤2：验证码和新密码
          <form className="login-form" onSubmit={handleResetPassword}>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                验证码已发送至 <strong>{formData.phone}</strong>
              </p>
            </div>

            {/* 验证码 */}
            <div className={`form-field ${codeFocused || formData.code ? 'active' : ''} login-code-field`}>
              <div className="login-code-input-container">
                <input
                  type="text"
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  onFocus={() => setCodeFocused(true)}
                  onBlur={() => setCodeFocused(false)}
                  required
                />
                <label htmlFor="code">验证码</label>
              </div>
              <button
                type="button"
                className="login-button login-code-button"
                disabled={sendingCode || codeCountdown > 0}
                onClick={handleSendCode}
              >
                {sendingCode ? '发送中...' : (codeCountdown > 0 ? `${codeCountdown}s` : '重新发送')}
              </button>
            </div>

            {/* 新密码 */}
            <div className={`form-field ${passwordFocused || formData.newPassword ? 'active' : ''}`}>
              <input
                type={formData.showPassword ? 'text' : 'password'}
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
              />
              <label htmlFor="newPassword">新密码（至少6位）</label>
              <button
                type="button"
                className="toggle-password"
                onClick={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                aria-label={formData.showPassword ? 'Hide password' : 'Show password'}
              >
                {formData.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* 确认密码 */}
            <div className={`form-field ${confirmFocused || formData.confirmPassword ? 'active' : ''} ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'invalid' : ''}`}>
              <input
                type={formData.showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                required
              />
              <label htmlFor="confirmPassword">确认新密码</label>
              <button
                type="button"
                className="toggle-password"
                onClick={() => setFormData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                aria-label={formData.showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {formData.showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <span className="error-message login-error-message">
                  两次密码不一致
                </span>
              )}
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading || !formData.code || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
            >
              {loading ? '重置中...' : '重置密码'}
            </button>
          </form>
        )}

        {/* 返回登录 */}
        <p className="signup-prompt">
          想起密码了？ <Link to="/custom-login">返回登录</Link>
        </p>
      </div>
    </AnimatedAuthShell>
  );
}
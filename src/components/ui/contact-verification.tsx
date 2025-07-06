import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 联系方式验证组件属性
 */
interface ContactVerificationProps {
  /** 当前手机号 */
  currentPhone?: string;
  /** 当前邮箱 */
  currentEmail?: string;
  /** 手机号变化回调 */
  onPhoneChange?: (phone: string) => void;
  /** 邮箱变化回调 */
  onEmailChange?: (email: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 联系方式验证组件
 */
export function ContactVerification({
  currentPhone = '',
  currentEmail = '',
  onPhoneChange,
  onEmailChange,
  disabled = false
}: ContactVerificationProps) {
  const [phone, setPhone] = useState(currentPhone);
  const [email, setEmail] = useState(currentEmail);
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(!!currentPhone);
  const [emailVerified, setEmailVerified] = useState(!!currentEmail);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [isSendingPhoneCode, setIsSendingPhoneCode] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const { toast } = useToast();

  /**
   * 倒计时处理
   */
  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setTimeout(() => setPhoneCountdown(phoneCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCountdown]);

  /**
   * 验证手机号格式
   */
  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  /**
   * 验证邮箱格式
   */
  const validateEmail = (emailAddress: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailAddress);
  };

  /**
   * 发送手机验证码
   */
  const sendPhoneCode = async () => {
    if (!validatePhone(phone)) {
      toast({
        title: "手机号格式错误",
        description: "请输入正确的手机号",
        variant: "destructive"
      });
      return;
    }

    setIsSendingPhoneCode(true);
    try {
      // 这里应该调用实际的API发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      
      setPhoneCountdown(60);
      toast({
        title: "验证码已发送",
        description: "请查看您的手机短信",
      });
    } catch (error) {
      console.error('发送手机验证码失败:', error);
      toast({
        title: "发送失败",
        description: "验证码发送失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsSendingPhoneCode(false);
    }
  };

  /**
   * 验证手机验证码
   */
  const verifyPhoneCode = async () => {
    if (!phoneCode.trim()) {
      toast({
        title: "验证码不能为空",
        description: "请输入验证码",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingPhone(true);
    try {
      // 这里应该调用实际的API验证验证码
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      
      // 模拟验证成功（实际应该根据API返回结果判断）
      if (phoneCode === '123456') {
        setPhoneVerified(true);
        onPhoneChange?.(phone);
        toast({
          title: "手机号验证成功",
          description: "您的手机号已验证",
        });
      } else {
        toast({
          title: "验证码错误",
          description: "请输入正确的验证码",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('验证手机验证码失败:', error);
      toast({
        title: "验证失败",
        description: "验证码验证失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  /**
   * 验证邮箱
   */
  const verifyEmail = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "邮箱格式错误",
        description: "请输入正确的邮箱地址",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingEmail(true);
    try {
      // 这里应该调用实际的API验证邮箱
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      
      // 模拟验证成功（实际应该根据API返回结果判断）
      setEmailVerified(true);
      onEmailChange?.(email);
      toast({
        title: "邮箱验证成功",
        description: "您的邮箱已验证",
      });
    } catch (error) {
      console.error('验证邮箱失败:', error);
      toast({
        title: "验证失败",
        description: "邮箱验证失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 手机号验证 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            手机号验证
            {phoneVerified && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                已验证
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                disabled={disabled || phoneVerified}
                maxLength={11}
              />
              {!phoneVerified && (
                <Button
                  onClick={sendPhoneCode}
                  disabled={disabled || isSendingPhoneCode || phoneCountdown > 0 || !validatePhone(phone)}
                  size="sm"
                >
                  {isSendingPhoneCode ? '发送中...' : phoneCountdown > 0 ? `${phoneCountdown}s` : '发送验证码'}
                </Button>
              )}
            </div>
          </div>

          {!phoneVerified && (
            <div className="space-y-2">
              <Label htmlFor="phone-code">验证码</Label>
              <div className="flex gap-2">
                <Input
                  id="phone-code"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  disabled={disabled}
                  maxLength={6}
                />
                <Button
                  onClick={verifyPhoneCode}
                  disabled={disabled || isVerifyingPhone || !phoneCode.trim()}
                  size="sm"
                >
                  {isVerifyingPhone ? '验证中...' : '验证'}
                </Button>
              </div>
            </div>
          )}

          {phoneVerified && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">手机号已验证：{phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 邮箱验证 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            邮箱验证
            {emailVerified && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                已验证
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                disabled={disabled || emailVerified}
              />
              {!emailVerified && (
                <Button
                  onClick={verifyEmail}
                  disabled={disabled || isVerifyingEmail || !validateEmail(email)}
                  size="sm"
                >
                  {isVerifyingEmail ? '验证中...' : '验证'}
                </Button>
              )}
            </div>
          </div>

          {emailVerified && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">邮箱已验证：{email}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 手机验证码有效期为5分钟</p>
        <p>• 测试环境验证码统一为：123456</p>
        <p>• 验证成功后联系方式将自动保存</p>
      </div>
    </div>
  );
} 
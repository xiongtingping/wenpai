/**
 * 支付反馈页面
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { generateFeedbackEmail } from '@/utils/paymentUtils';
import { logger } from '@/utils/logger';

export default function PaymentFeedbackPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderId.trim()) {
      newErrors.orderId = '请输入订单号';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = '请输入支付金额';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = '请输入有效的金额';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = '请描述遇到的问题';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = '问题描述至少需要10个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      const emailUrl = generateFeedbackEmail(
        formData.orderId.trim(),
        amount,
        formData.description.trim()
      );

      // 打开邮件客户端
      window.location.href = emailUrl;
      
      setIsSubmitted(true);
      
      logger.info('支付反馈邮件生成成功:', {
        orderId: formData.orderId,
        amount
      });

    } catch (error) {
      logger.error('生成反馈邮件失败:', error);
      setErrors({ submit: '生成反馈邮件失败，请重试' });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-green-800 dark:text-green-200">反馈已提交</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-green-700 dark:text-green-300">
                  感谢您的反馈！我们已为您生成反馈邮件，请在邮件客户端中发送。
                </p>
                <p className="text-sm text-muted-foreground">
                  我们会在收到邮件后尽快为您处理，通常在24小时内回复。
                </p>
                <Button onClick={handleGoHome} className="w-full">
                  返回首页
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* 返回按钮 */}
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>

          {/* 反馈表单 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                支付问题反馈
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                如果您已完成支付但未收到会员权限，请填写以下信息，我们会尽快为您处理。
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 订单号 */}
                <div className="space-y-2">
                  <Label htmlFor="orderId">订单号 *</Label>
                  <Input
                    id="orderId"
                    placeholder="请输入订单号，如：WP1234567890"
                    value={formData.orderId}
                    onChange={(e) => handleInputChange('orderId', e.target.value)}
                    className={errors.orderId ? 'border-red-500' : ''}
                  />
                  {errors.orderId && (
                    <p className="text-sm text-red-500">{errors.orderId}</p>
                  )}
                </div>

                {/* 支付金额 */}
                <div className="space-y-2">
                  <Label htmlFor="amount">支付金额 *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="请输入支付金额，如：29.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount}</p>
                  )}
                </div>

                {/* 问题描述 */}
                <div className="space-y-2">
                  <Label htmlFor="description">问题描述 *</Label>
                  <Textarea
                    id="description"
                    placeholder="请详细描述遇到的问题，如支付时间、支付方式、错误信息等"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                {/* 提交错误 */}
                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                {/* 提交按钮 */}
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  发送反馈邮件
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 说明信息 */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <h4 className="font-medium text-foreground mb-3">反馈说明</h4>
                <p>• 点击"发送反馈邮件"会自动打开您的邮件客户端</p>
                <p>• 邮件内容已自动填写，您只需发送即可</p>
                <p>• 请保留支付截图等相关凭证，以便我们快速处理</p>
                <p>• 我们通常在24小时内回复并处理您的问题</p>
                <p>• 客服邮箱：support@wenpai.xyz</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

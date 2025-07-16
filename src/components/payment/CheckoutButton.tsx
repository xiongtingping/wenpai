/**
 * 支付按钮组件
 * 支持跳转到Creem支付页面
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { redirectToCheckout } from '@/api/creemClientService';
import { Loader2, CreditCard, ExternalLink } from 'lucide-react';

interface CheckoutButtonProps {
  priceId: string;
  customerEmail?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
}

export default function CheckoutButton({
  priceId,
  customerEmail,
  children = '立即支付',
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  showIcon = true
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!priceId) {
      toast({
        title: "错误",
        description: "产品ID不能为空",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('开始支付流程:', { priceId, customerEmail });
      
      await redirectToCheckout(priceId, customerEmail);
      
      toast({
        title: "正在跳转",
        description: "正在跳转到支付页面...",
      });
    } catch (error: any) {
      console.error('支付跳转失败:', error);
      
      toast({
        title: "支付失败",
        description: error.message || "无法跳转到支付页面，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          处理中...
        </>
      ) : (
        <>
          {showIcon && <CreditCard className="w-4 h-4 mr-2" />}
          {children}
          {showIcon && <ExternalLink className="w-4 h-4 ml-2" />}
        </>
      )}
    </Button>
  );
} 
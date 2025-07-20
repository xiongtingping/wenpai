/**
 * ✅ 简化Authing弹窗组件 - 使用基本弹窗实现
 * 
 * 本组件使用基本的弹窗实现，避免复杂的Guard组件配置问题
 * 通过直接跳转到Authing官方页面实现登录/注册功能
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LogIn, 
  UserPlus, 
  Loader2,
  Shield,
  CheckCircle,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAuthingConfig } from '@/config/authing';

/**
 * 简化Authing弹窗组件属性
 */
interface SimpleAuthingModalProps {
  /** 是否打开弹窗 */
  open: boolean;
  /** 打开/关闭弹窗的回调 */
  onOpenChange: (open: boolean) => void;
  /** 默认激活的场景 */
  defaultScene?: 'login' | 'register';
  /** 登录/注册成功后的回调 */
  onSuccess?: (user: any) => void;
  /** 自定义样式类 */
  className?: string;
}

/**
 * 简化Authing弹窗组件
 * 使用直接跳转方式实现登录/注册功能
 */
export default function SimpleAuthingModal({
  open,
  onOpenChange,
  defaultScene = 'login',
  onSuccess,
  className = ''
}: SimpleAuthingModalProps) {
  const { user, isAuthenticated, loading: authLoading } = useUnifiedAuth();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 处理Authing登录
   */
  const handleAuthingLogin = async () => {
    try {
      setIsRedirecting(true);
      setError(null);
      
      console.log('🔐 开始Authing登录流程...');
      
      const config = getAuthingConfig();
      
      // 构建登录URL
      const loginUrl = new URL(`https://${config.host}/login`);
      loginUrl.searchParams.set('app_id', config.appId);
      loginUrl.searchParams.set('redirect_uri', config.redirectUri);
      loginUrl.searchParams.set('protocol', 'oidc');
      loginUrl.searchParams.set('finish_login_url', '/interaction/oidc/login');
      
      console.log('🔐 跳转到Authing登录:', loginUrl.toString());
      
      // 显示提示信息
      toast({
        title: "正在跳转到登录页面",
        description: "即将跳转到Authing官方登录页面",
      });
      
      // 延迟一下让用户看到提示
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 跳转到Authing登录页面
      window.location.href = loginUrl.toString();
      
    } catch (error) {
      console.error('❌ Authing登录失败:', error);
      setError(error instanceof Error ? error.message : '登录失败');
      setIsRedirecting(false);
      toast({
        title: "登录失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 处理Authing注册
   */
  const handleAuthingRegister = async () => {
    try {
      setIsRedirecting(true);
      setError(null);
      
      console.log('🔐 开始Authing注册流程...');
      
      const config = getAuthingConfig();
      
      // 构建注册URL
      const registerUrl = new URL(`https://${config.host}/register`);
      registerUrl.searchParams.set('app_id', config.appId);
      registerUrl.searchParams.set('redirect_uri', config.redirectUri);
      registerUrl.searchParams.set('protocol', 'oidc');
      registerUrl.searchParams.set('finish_login_url', '/interaction/oidc/register');
      
      console.log('🔐 跳转到Authing注册:', registerUrl.toString());
      
      // 显示提示信息
      toast({
        title: "正在跳转到注册页面",
        description: "即将跳转到Authing官方注册页面",
      });
      
      // 延迟一下让用户看到提示
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 跳转到Authing注册页面
      window.location.href = registerUrl.toString();
      
    } catch (error) {
      console.error('❌ Authing注册失败:', error);
      setError(error instanceof Error ? error.message : '注册失败');
      setIsRedirecting(false);
      toast({
        title: "注册失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 处理关闭弹窗
   */
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${className}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            安全认证
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 认证状态 */}
          {isAuthenticated ? (
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold">已登录</h3>
              <p className="text-sm text-gray-600">
                欢迎回来，{user?.nickname || user?.username || '用户'}
              </p>
              <Badge variant="secondary" className="mx-auto">
                {user?.email || user?.phone || '已认证用户'}
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 错误提示 */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {/* 说明信息 */}
              <div className="text-center text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium mb-1">使用Authing官方认证</p>
                <p>点击按钮将跳转到Authing官方认证页面</p>
                <p className="text-xs mt-1">安全可靠，支持多种登录方式</p>
              </div>

              {/* 登录按钮 */}
              <Button 
                onClick={handleAuthingLogin}
                className="w-full"
                size="lg"
                disabled={authLoading || isRedirecting}
              >
                {authLoading || isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isRedirecting ? '跳转中...' : '加载中...'}
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    使用 Authing 登录
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* 注册按钮 */}
              <Button 
                onClick={handleAuthingRegister}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={authLoading || isRedirecting}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                使用 Authing 注册
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>

              {/* 安全提示 */}
              <div className="text-center text-xs text-gray-400">
                <p>🔒 使用Authing官方认证服务</p>
                <p>支持邮箱、手机号、社交账号等多种登录方式</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
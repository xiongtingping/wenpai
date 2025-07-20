/**
 * ✅ Authing Guard 弹窗组件 - 使用官方Guard组件
 * 
 * 本组件使用Authing官方Guard组件实现真正的弹窗登录/注册功能
 * 支持多种登录方式，包括密码登录、验证码登录、社交登录等
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LogIn, 
  UserPlus, 
  Loader2,
  Shield,
  CheckCircle,
  X,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { getGuardConfig } from '@/config/authing';

/**
 * Authing Guard 弹窗组件属性
 */
interface AuthingGuardModalProps {
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
 * Authing Guard 弹窗组件
 * 使用Authing官方Guard组件实现真正的弹窗认证
 */
export default function AuthingGuardModal({
  open,
  onOpenChange,
  defaultScene = 'login',
  onSuccess,
  className = ''
}: AuthingGuardModalProps) {
  const { user, isAuthenticated, loading: authLoading, handleAuthingLogin } = useUnifiedAuth();
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guardRef = useRef<any>(null);
  const guardContainerRef = useRef<HTMLDivElement>(null);

  /**
   * 初始化 Authing Guard
   */
  const initializeGuard = async () => {
    if (guardRef.current) {
      return guardRef.current;
    }

    try {
      setIsInitializing(true);
      setError(null);
      
      console.log('🔧 初始化 Authing Guard...');
      
      // 动态导入 Authing Guard
      const { Guard } = await import('@authing/guard-react');
      
      // 获取配置
      const config = getGuardConfig();
      
      // 创建Guard实例
      guardRef.current = new Guard({
        ...config,
        defaultScene,
        // 弹窗模式配置
        mode: 'modal'
      });

      // 添加事件监听器
      guardRef.current.on('login', (userInfo: any) => {
        console.log('🔐 登录成功:', userInfo);
        handleLoginSuccess(userInfo);
      });

      guardRef.current.on('login-error', (error: any) => {
        console.error('❌ 登录失败:', error);
        setError(error.message || '登录失败');
        toast({
          title: "登录失败",
          description: error.message || "请稍后重试",
          variant: "destructive"
        });
      });

      guardRef.current.on('register', (userInfo: any) => {
        console.log('🔐 注册成功:', userInfo);
        handleLoginSuccess(userInfo);
      });

      guardRef.current.on('register-error', (error: any) => {
        console.error('❌ 注册失败:', error);
        setError(error.message || '注册失败');
        toast({
          title: "注册失败",
          description: error.message || "请稍后重试",
          variant: "destructive"
        });
      });

      guardRef.current.on('close', () => {
        console.log('🔒 弹窗关闭');
        setIsModalOpen(false);
        onOpenChange(false);
      });

      console.log('✅ Authing Guard 初始化成功');
      return guardRef.current;
      
    } catch (error) {
      console.error('❌ Authing Guard 初始化失败:', error);
      setError(error instanceof Error ? error.message : '认证服务初始化失败');
      toast({
        title: "初始化失败",
        description: "认证服务初始化失败，请刷新页面重试",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * 处理登录/注册成功
   */
  const handleLoginSuccess = (userInfo: any) => {
    if (!userInfo) return;
    
    console.log('🔐 处理用户认证成功:', userInfo);
    
    // 调用UnifiedAuthContext的handleAuthingLogin方法
    // 这是关键：确保用户信息被正确处理和存储
    if (handleAuthingLogin) {
      handleAuthingLogin(userInfo);
    }
    
    // 调用成功回调
    onSuccess?.(userInfo);
    
    // 关闭弹窗
    setIsModalOpen(false);
    onOpenChange(false);
    
    // 显示成功提示
    toast({
      title: "认证成功",
      description: "欢迎使用文派！",
    });
  };

  /**
   * 显示登录弹窗
   */
  const showLoginModal = async () => {
    try {
      const guard = await initializeGuard();
      if (!guard) return;

      console.log('🔐 显示登录弹窗...');
      setIsModalOpen(true);
      
      // 显示登录弹窗
      guard.showLogin();
      
    } catch (error) {
      console.error('❌ 显示登录弹窗失败:', error);
      setError(error instanceof Error ? error.message : '显示登录弹窗失败');
    }
  };

  /**
   * 显示注册弹窗
   */
  const showRegisterModal = async () => {
    try {
      const guard = await initializeGuard();
      if (!guard) return;

      console.log('🔐 显示注册弹窗...');
      setIsModalOpen(true);
      
      // 显示注册弹窗
      guard.showRegister();
      
    } catch (error) {
      console.error('❌ 显示注册弹窗失败:', error);
      setError(error instanceof Error ? error.message : '显示注册弹窗失败');
    }
  };

  /**
   * 处理关闭弹窗
   */
  const handleClose = () => {
    if (guardRef.current && isModalOpen) {
      guardRef.current.hide();
    }
    setIsModalOpen(false);
    onOpenChange(false);
  };

  // 监听弹窗状态变化
  useEffect(() => {
    if (open && !isModalOpen) {
      // 弹窗打开时，显示选择界面
      setIsModalOpen(true);
    } else if (!open && isModalOpen) {
      // 弹窗关闭时，隐藏Guard
      if (guardRef.current) {
        guardRef.current.hide();
      }
      setIsModalOpen(false);
    }
  }, [open, isModalOpen]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${className}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            安全认证
          </DialogTitle>
          <DialogDescription>
            使用Authing官方认证服务，支持邮箱、手机号、社交账号等多种登录方式。
          </DialogDescription>
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
                <p>点击按钮将打开Authing官方认证弹窗</p>
                <p className="text-xs mt-1">安全可靠，支持多种登录方式</p>
              </div>

              {/* 登录按钮 */}
              <Button 
                onClick={showLoginModal}
                className="w-full"
                size="lg"
                disabled={authLoading || isInitializing}
              >
                {authLoading || isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isInitializing ? '初始化中...' : '加载中...'}
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
                onClick={showRegisterModal}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={authLoading || isInitializing}
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

        {/* Guard容器 */}
        <div ref={guardContainerRef} id="authing-guard-container" />
      </DialogContent>
    </Dialog>
  );
} 
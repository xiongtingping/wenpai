import React, { useEffect, useRef, useState } from 'react';
import '@authing/guard/dist/esm/guard.min.css';
import { Guard } from '@authing/guard';
import { getAuthingConfig } from '@/config/authing';
import { useNavigate } from 'react-router-dom';
import { DirectLoginForm } from '@/components/auth/DirectLoginForm';

const LoginPage: React.FC = () => {
  const cfg = getAuthingConfig();
  const guardRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [guardState, setGuardState] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    let mounted = true;
    
    const initGuard = async () => {
      try {
        console.log('🔧 正确实现Authing Guard集成');
        
        // 创建Guard实例 - 完整配置，避开public-config API问题
        const g = new Guard({
          appId: cfg.appId,
          host: cfg.host,
          redirectUri: cfg.redirectUri, // 明确指定，不依赖API
          mode: 'modal',
          lang: 'zh-CN',
          autoRegister: true,
          defaultScene: 'login',
          // 禁用可能导致public-config调用的功能
          isSSO: false,
          config: {
            // 强制配置，避免内部API调用
            redirectUri: cfg.redirectUri
          }
        });
        
        if (!mounted) return;
        
        guardRef.current = g;
        
        console.log('🧭 Guard配置(Modal模式):', { 
          appId: cfg.appId,
          host: cfg.host, 
          mode: 'modal'
        });

        // 监听登录成功
        g.on('login', (userInfo: any) => {
          console.log('✅ Guard登录成功:', userInfo);
          sessionStorage.setItem('user', JSON.stringify(userInfo));
          sessionStorage.setItem('token', userInfo.token);
          navigate('/');
        });

        // 监听登录失败
        g.on('login-error', (error: any) => {
          console.error('❌ Guard登录失败:', error);
        });
        
        if (mounted) {
          setGuardState('ready');
          console.log('✅ Guard初始化完成');
        }
        
      } catch (error) {
        console.error('❌ Guard初始化失败:', error);
        if (mounted) {
          setGuardState('failed');
        }
      }
    };

    initGuard();

    return () => {
      mounted = false;
      if (guardRef.current) {
        try {
          // 只清理事件监听器，不操作DOM
          guardRef.current.off?.('login');
          guardRef.current.off?.('login-error');
        } catch (e) {
          console.warn('Guard清理警告:', e);
        }
      }
    };
  }, [cfg.appId, cfg.host, navigate]);

  const handleGuardLogin = () => {
    if (guardRef.current && guardState === 'ready') {
      try {
        console.log('🚀 启动Guard Modal登录');
        guardRef.current.start();
      } catch (error) {
        console.error('❌ Guard启动失败:', error);
        setGuardState('failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">文派登录</h1>
          <p className="text-muted-foreground">请使用您的账户登录</p>
        </div>
        
        <div className="flex justify-center">
          {guardState === 'ready' ? (
            // Guard Modal触发按钮
            <div className="space-y-4 w-full max-w-md">
              <button
                onClick={handleGuardLogin}
                className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 text-lg font-medium"
              >
                使用Authing登录
              </button>
              <p className="text-center text-xs text-muted-foreground">
                点击后将打开安全的登录弹窗
              </p>
            </div>
          ) : guardState === 'loading' ? (
            // 加载状态
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              正在初始化认证系统...
            </div>
          ) : (
            // Guard失败时使用表单
            <DirectLoginForm 
              onLogin={(userInfo) => {
                console.log('✅ 表单登录成功:', userInfo);
              }}
              onError={(error) => {
                console.error('❌ 表单登录失败:', error);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
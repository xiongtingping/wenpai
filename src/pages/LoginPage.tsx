import React, { useEffect, useRef, useState } from 'react';
import '@authing/guard/dist/esm/guard.min.css';
import { Guard } from '@authing/guard';
import { getAuthingConfig } from '@/config/authing';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const cfg = getAuthingConfig();
  const guardRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [guardState, setGuardState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const initializingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    
    // 防止重复初始化
    if (initializingRef.current) {
      console.log('🔄 Guard正在初始化中，跳过重复调用');
      return;
    }
    
    const initGuard = async () => {
      initializingRef.current = true;
      
      try {
        console.log('🔧 正确实现Authing Guard集成');
        
        // 创建Guard实例 - 完整配置，修复Modal定位和样式
        const g = new Guard({
          appId: cfg.appId,
          host: cfg.host,
          redirectUri: cfg.redirectUri,
          mode: 'modal',
          lang: 'zh-CN',
          autoRegister: true,
          defaultScene: 'login',
          isSSO: false,
          config: {
            redirectUri: cfg.redirectUri,
            // Modal样式配置
            modalStyle: {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: '9999',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
            },
            // 遮罩配置
            maskStyle: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: '9998'
            }
          }
        });
        
        if (!mounted) return;
        
        console.log('🧭 Guard配置(Modal模式):', { 
          appId: cfg.appId,
          host: cfg.host, 
          mode: 'modal'
        });

        guardRef.current = g;
        
        console.log('🔍 Guard实例检查:', {
          hasOn: typeof g.on === 'function',
          hasStart: typeof g.start === 'function',
          constructor: g.constructor.name,
          eventHandlers: g._eventHandlers || 'undefined'
        });

        // Guard事件系统初始化修复：手动初始化事件处理器
        if (!g._eventHandlers) {
          console.log('🔧 修复Guard事件系统：手动初始化事件处理器');
          g._eventHandlers = {};
        }
        
        // 延迟绑定确保Guard完全准备
        setTimeout(() => {
          if (!mounted) return;
          
          try {
            console.log('🔗 开始安全事件绑定...');
            
            // 重新检查事件系统
            if (!g._eventHandlers) {
              g._eventHandlers = {};
            }
            
            // 安全绑定登录事件
            if (typeof g.on === 'function') {
              g.on('login', (userInfo: any) => {
                console.log('✅ Guard登录成功:', userInfo);
                sessionStorage.setItem('user', JSON.stringify(userInfo));
                sessionStorage.setItem('token', userInfo.token);
                navigate('/');
              });

              g.on('login-error', (error: any) => {
                console.error('❌ Guard登录失败:', error);
              });

              g.on('show', () => {
                console.log('🎯 Guard Modal显示');
                document.documentElement.classList.add('authing-guard-open');
                document.body.classList.add('authing-guard-open');
              });

              g.on('hide', () => {
                console.log('🎯 Guard Modal隐藏');
                document.documentElement.classList.remove('authing-guard-open');
                document.body.classList.remove('authing-guard-open');
              });

              console.log('✅ Guard事件绑定成功');
              
              if (mounted) {
                setGuardState('ready');
                console.log('✅ Guard完全初始化完成');
              }
            }
          } catch (eventError) {
            console.error('❌ 延迟事件绑定失败:', eventError);
            if (mounted) {
              setGuardState('failed');
            }
          }
        }, 200);
        
      } catch (error) {
        console.error('❌ Guard初始化失败:', error);
        if (mounted) {
          setGuardState('failed');
        }
      } finally {
        initializingRef.current = false;
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
                立即登录
              </button>
              <p className="text-center text-xs text-muted-foreground">
                安全的企业级身份认证
              </p>
            </div>
          ) : guardState === 'loading' ? (
            // 加载状态
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              正在初始化认证系统...
            </div>
          ) : (
            // Guard初始化失败提示
            <div className="space-y-4 w-full max-w-md text-center">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-sm font-medium text-red-800 mb-1">认证系统初始化失败</h3>
                <p className="text-xs text-red-600">请刷新页面重试，或联系技术支持</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
              >
                刷新页面
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
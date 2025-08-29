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
            // 完整的Modal配置
            modal: {
              // 启用body类名，触发CSS样式
              bodyClassName: 'authing-guard-open',
              // Modal容器样式
              style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                zIndex: '999999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              },
              // 遮罩样式
              maskStyle: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: '999998'
              }
            },
            // 兼容旧配置
            modalStyle: {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: '9999',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
            },
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
          constructor: g.constructor.name
        });

        // 跳过事件监听器，直接标记为ready，使用轮询监控
        console.log('✅ Guard实例创建完成，跳过事件绑定');
        
        if (mounted) {
          setGuardState('ready');
        }
        
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
        
        // 开始轮询监控登录状态
        startAuthPolling();
      } catch (error) {
        console.error('❌ Guard启动失败:', error);
        setGuardState('failed');
      }
    }
  };

  // 轮询监控登录状态
  const startAuthPolling = () => {
    let previousStorageState = '';
    
    const pollInterval = setInterval(() => {
      try {
        // 全面检查所有可能的Authing存储键
        const storageKeys = [
          '_authing_token', 'authing_token', 'authingToken',
          '_authing_user', 'authing_user', 'authingUser',
          '_authing_session', 'authing_session',
          `authing_${cfg.appId}_token`, `authing_${cfg.appId}_user`,
          'guard_token', 'guard_user', 'guard_session'
        ];
        
        let authData = null;
        let foundKey = '';
        
        for (const key of storageKeys) {
          const localData = localStorage.getItem(key);
          const sessionData = sessionStorage.getItem(key);
          
          if (localData || sessionData) {
            authData = localData || sessionData;
            foundKey = key;
            break;
          }
        }
        
        // 检查Guard实例的内部状态
        let guardInternalState = null;
        if (guardRef.current) {
          try {
            guardInternalState = guardRef.current.authClient?.getCurrentUser?.() || 
                               guardRef.current.getUser?.() ||
                               guardRef.current.user;
          } catch (e) {
            // 忽略Guard内部状态检查错误
          }
        }

        // 生成当前存储状态快照
        const currentStorageState = JSON.stringify({
          authData: authData ? '存在' : '空',
          foundKey,
          guardState: guardInternalState ? '有用户' : '无用户'
        });

        // 状态变化检测
        if (currentStorageState !== previousStorageState) {
          console.log('🔍 存储状态变化:', currentStorageState);
          previousStorageState = currentStorageState;
        }

        if (authData || guardInternalState) {
          console.log('✅ 检测到登录成功', { foundKey, hasGuardUser: !!guardInternalState });
          clearInterval(pollInterval);
          navigate('/dashboard');
          return;
        }

        // 检查Guard Modal是否已关闭
        const modalSelectors = [
          '.authing-guard-modal', 
          '.authing-ant-modal',
          '.ant-modal',
          '[class*="authing"]',
          '[class*="guard"]'
        ];
        
        const modalElements = modalSelectors.flatMap(sel => 
          Array.from(document.querySelectorAll(sel))
        );
        
        const isModalVisible = modalElements.some(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' &&
                 style.opacity !== '0' &&
                 !el.hasAttribute('hidden');
        });

        if (!isModalVisible && modalElements.length === 0) {
          console.log('🔄 Modal已关闭，停止轮询');
          clearInterval(pollInterval);
        }

      } catch (error) {
        console.error('轮询检查错误:', error);
      }
    }, 500); // 提高检查频率到500ms

    // 60秒后自动清理轮询
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('🕐 轮询超时，自动清理');
    }, 60000);
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
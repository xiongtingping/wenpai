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
  const [guardFailed, setGuardFailed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        console.log('🔧 使用内嵌模式避开redirect_uri问题');
        
        // 延迟创建Guard直到容器准备好
        let g: any = null;
        
        console.log('🧭 Guard配置(内嵌模式):', { 
          appId: cfg.appId,
          host: cfg.host, 
          mode: 'normal',
          target: '#authing-guard-isolated'
        });

        // 直接启动内嵌登录，不使用redirect
        setTimeout(() => {
          console.log('🎯 启动内嵌登录界面...');
          
          // 使用ref避免DOM冲突
          const container = containerRef.current;
          if (container) {
            console.log('✅ 找到Guard容器，尺寸:', container.getBoundingClientRect());
            
            // 创建独立的Guard容器，避免React管理
            const guardDiv = document.createElement('div');
            guardDiv.id = 'authing-guard-isolated';
            guardDiv.style.cssText = 'width:100%;height:100%;min-height:400px;';
            
            // 清空React管理的容器并添加独立容器
            container.innerHTML = '';
            container.appendChild(guardDiv);
            
            // 现在创建Guard实例，指向独立容器
            g = new Guard({
              appId: cfg.appId,
              host: cfg.host,
              mode: 'normal',
              lang: 'zh-CN',
              autoRegister: true,
              defaultScene: 'login',
              target: '#authing-guard-isolated'
            });
            
            guardRef.current = g;

            // 监听登录成功事件
            g.on('login', (userInfo: any) => {
              console.log('✅ 内嵌登录成功:', userInfo);
              // 存储用户信息
              sessionStorage.setItem('user', JSON.stringify(userInfo));
              sessionStorage.setItem('token', userInfo.token);
              // 跳转回主页
              navigate('/');
            });

            // 监听登录错误
            g.on('login-error', (error: any) => {
              console.error('❌ 内嵌登录失败:', error);
            });
            
            console.log('🎯 尝试启动Guard...');
            
            // 尝试多种启动方式
            try {
              if (typeof g.start === 'function') {
                console.log('📞 调用 g.start()');
                g.start();
              } else if (typeof g.show === 'function') {
                console.log('📞 调用 g.show()');
                g.show();
              } else if (typeof g.render === 'function') {
                console.log('📞 调用 g.render()');
                g.render('#authing-guard-container');
              } else {
                console.error('❌ Guard没有可用的启动方法');
                console.log('🔍 Guard方法列表:', Object.getOwnPropertyNames(g));
              }
              
              // 检查Guard是否渲染了内容
              setTimeout(() => {
                const hasContent = guardDiv.children.length > 0 || guardDiv.innerHTML.includes('authing');
                console.log(`🔍 Guard渲染检查: ${hasContent ? '成功' : '失败'}`);
                if (!hasContent) {
                  console.log('🔄 Guard加载失败，启用备用登录方案');
                  setGuardFailed(true);
                }
              }, 3000);
              
            } catch (err) {
              console.error('❌ Guard启动失败:', err);
              guardDiv.innerHTML = '<div style="color:red;text-align:center;padding:20px;">认证组件启动失败: ' + err.message + '</div>';
            }
          } else {
            console.error('❌ 未找到Guard容器');
          }
        }, 1500);
        
      } catch (e) {
        console.error('Authing Guard init failed:', e);
      }
    })();

    // 清理函数：防止DOM冲突
    return () => {
      if (guardRef.current) {
        try {
          console.log('🧹 清理Guard实例');
          
          // 先移除事件监听器
          guardRef.current.off('login');
          guardRef.current.off('login-error');
          
          // 清理Guard实例，但不让它直接操作React管理的DOM
          if (typeof guardRef.current.destroy === 'function') {
            guardRef.current.destroy();
          }
        } catch (e) {
          console.warn('⚠️ Guard清理失败(忽略):', e);
        }
        guardRef.current = null;
      }
      
      // 手动清理容器内容，防止Guard残留
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [cfg.appId, cfg.host, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">文派登录</h1>
          <p className="text-muted-foreground">请使用您的账户登录</p>
        </div>
        
        {guardFailed ? (
          /* 备用登录表单 */
          <div className="flex justify-center">
            <DirectLoginForm 
              onLogin={(userInfo) => {
                console.log('✅ 备用登录成功:', userInfo);
              }}
              onError={(error) => {
                console.error('❌ 备用登录失败:', error);
              }}
            />
          </div>
        ) : (
          /* Guard容器 - 使用ref避免React DOM管理冲突 */
          <div 
            ref={containerRef}
            className="w-full min-h-[400px] flex items-center justify-center"
            style={{ 
              maxWidth: '500px', 
              margin: '0 auto',
              background: '#fff',
              borderRadius: '8px',
              padding: '20px'
            }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;


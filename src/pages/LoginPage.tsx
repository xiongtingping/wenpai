import React, { useEffect, useRef } from 'react';
import '@authing/guard/dist/esm/guard.min.css';
import { Guard } from '@authing/guard';
import { getAuthingConfig } from '@/config/authing';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const cfg = getAuthingConfig();
  const guardRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        console.log('🔧 使用内嵌模式避开redirect_uri问题');
        
        const g = new Guard({
          appId: cfg.appId,
          host: cfg.host,
          mode: 'normal',
          lang: 'zh-CN',
          autoRegister: true,
          defaultScene: 'login',
          target: '#authing-guard-container'
        });
        
        console.log('🧭 Guard配置(内嵌模式):', { 
          appId: cfg.appId,
          host: cfg.host, 
          mode: 'normal',
          target: '#authing-guard-container'
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

        // 直接启动内嵌登录，不使用redirect
        console.log('🎯 启动内嵌登录界面...');
        g.start();
        
      } catch (e) {
        console.error('Authing Guard init failed:', e);
      }
    })();
  }, [cfg.appId, cfg.host, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">文派登录</h1>
          <p className="text-muted-foreground">请使用您的账户登录</p>
        </div>
        
        {/* Guard容器 */}
        <div 
          id="authing-guard-container" 
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
      </div>
    </div>
  );
};

export default LoginPage;


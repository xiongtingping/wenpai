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
          mode: 'modal',
          lang: 'zh-CN',
          autoRegister: true,
          defaultScene: 'login'
        });
        
        console.log('🧭 Guard配置(内嵌模式):', { 
          appId: cfg.appId,
          host: cfg.host, 
          mode: 'modal'
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

        // 显示登录界面
        g.show();
        
      } catch (e) {
        console.error('Authing Guard init failed:', e);
      }
    })();
  }, [cfg.appId, cfg.host, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">正在跳转到认证页面…</p>
      </div>
    </div>
  );
};

export default LoginPage;


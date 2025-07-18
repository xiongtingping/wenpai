import React, { useEffect, useRef } from 'react';
import { Guard } from '@authing/react18-ui-components';
import { getAuthingConfig } from '@/config/authing';

/**
 * Authing Guard包装组件
 * 确保弹窗正确显示和定位
 */
interface AuthingGuardWrapperProps {
  onLogin: (user: any) => void;
  onClose: () => void;
  onLoginError?: (error: any) => void;
}

const AuthingGuardWrapper: React.FC<AuthingGuardWrapperProps> = ({
  onLogin,
  onClose,
  onLoginError
}) => {
  const guardRef = useRef<any>(null);

  useEffect(() => {
    // 确保组件挂载后立即显示弹窗
    if (guardRef.current) {
      // 延迟一帧确保DOM完全渲染
      requestAnimationFrame(() => {
        try {
          guardRef.current?.show();
        } catch (error) {
          console.error('显示Authing Guard弹窗失败:', error);
        }
      });
    }
  }, []);

  return (
    <div className="authing-guard-wrapper">
      <Guard
        ref={guardRef}
        appId={getAuthingConfig().appId}
        host={getAuthingConfig().host}
        redirectUri={getAuthingConfig().redirectUri}
        mode="modal"
        defaultScene="login"
        lang="zh-CN"
        // 弹窗模式专用配置
        autoRegister={false}
        skipComplateFileds={false}
        skipComplateFiledsPlace="modal"
        closeable={true}
        clickCloseableMask={true}
        // 登录配置
        loginMethodList={['password', 'phone-code', 'email-code']}
        // 注册配置
        registerMethodList={['phone', 'email']}
        // 界面配置
        logo="https://cdn.authing.co/authing-console/logo.png"
        title="文派"
        onLogin={onLogin}
        onClose={onClose}
        onLoginError={onLoginError}
      />
    </div>
  );
};

export default AuthingGuardWrapper; 
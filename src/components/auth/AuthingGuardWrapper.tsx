import React, { useEffect, useState } from 'react';
import { Guard } from '@authing/react18-ui-components';
import { getGuardConfig } from '@/config/authing';

/**
 * Authing Guard包装组件
 * 确保弹窗正确显示和定位，防止页面滚动
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 防止页面滚动 - 关键修复
    const preventScroll = () => {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('authing-guard-open');
      document.documentElement.classList.add('authing-guard-open');
    };

    // 恢复页面滚动
    const restoreScroll = () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('authing-guard-open');
      document.documentElement.classList.remove('authing-guard-open');
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };

    // 确保组件挂载后立即显示弹窗
    const timer = setTimeout(() => {
      setIsVisible(true);
      // 防止页面滚动
      preventScroll();
    }, 100);

    // 清理函数
    return () => {
      clearTimeout(timer);
      // 恢复页面滚动
      restoreScroll();
    };
  }, []);

  // 处理关闭事件
  const handleClose = () => {
    // 恢复页面滚动
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.classList.remove('authing-guard-open');
    document.documentElement.classList.remove('authing-guard-open');
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    // 调用原始关闭回调
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  const config = getGuardConfig();

  return (
    <div className="authing-guard-wrapper">
      <Guard
        {...config}
        onLogin={onLogin}
        onClose={handleClose}
        onLoginError={onLoginError}
      />
    </div>
  );
};

export default AuthingGuardWrapper; 
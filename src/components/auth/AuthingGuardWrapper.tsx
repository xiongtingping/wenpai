import React, { useEffect, useState, useRef } from 'react';
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
  const wrapperRef = useRef<HTMLDivElement>(null);

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

    // 强制Authing Guard组件显示
    const forceGuardDisplay = () => {
      if (wrapperRef.current) {
        // 强制设置样式
        const wrapper = wrapperRef.current;
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '100vw';
        wrapper.style.height = '100vh';
        wrapper.style.zIndex = '99999';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        wrapper.style.pointerEvents = 'auto';

        // 查找并强制显示Authing Guard组件
        const guardElement = wrapper.querySelector('[data-authing-guard]') as HTMLElement;
        if (guardElement) {
          guardElement.style.position = 'fixed';
          guardElement.style.top = '0';
          guardElement.style.left = '0';
          guardElement.style.width = '100%';
          guardElement.style.height = '100%';
          guardElement.style.zIndex = '99999';
          guardElement.style.display = 'flex';
          guardElement.style.alignItems = 'center';
          guardElement.style.justifyContent = 'center';
          guardElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          guardElement.style.visibility = 'visible';
          guardElement.style.opacity = '1';

          // 强制显示弹窗内容
          const modalContent = guardElement.querySelector('div') as HTMLElement;
          if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.style.maxWidth = '90vw';
            modalContent.style.maxHeight = '90vh';
            modalContent.style.width = '400px';
            modalContent.style.background = 'white';
            modalContent.style.borderRadius = '8px';
            modalContent.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            modalContent.style.overflow = 'hidden';
            modalContent.style.zIndex = '100000';
            modalContent.style.transform = 'none';
            modalContent.style.top = 'auto';
            modalContent.style.left = 'auto';
            modalContent.style.right = 'auto';
            modalContent.style.bottom = 'auto';
            modalContent.style.visibility = 'visible';
            modalContent.style.opacity = '1';
            modalContent.style.display = 'block';
          }
        }
      }
    };

    // 确保组件挂载后立即显示弹窗
    const timer = setTimeout(() => {
      setIsVisible(true);
      // 防止页面滚动
      preventScroll();
      
      // 延迟强制显示，确保Guard组件已渲染
      setTimeout(() => {
        forceGuardDisplay();
      }, 200);
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
    <div ref={wrapperRef} className="authing-guard-wrapper">
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
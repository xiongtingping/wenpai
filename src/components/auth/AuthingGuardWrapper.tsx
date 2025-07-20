/**
 * ✅ Authing Guard 官方弹窗包装器
 * 
 * 本组件仅作为 Authing Guard 官方弹窗的容器包装器
 * 不包含任何本地表单或模拟逻辑，完全依赖 Authing 官方组件
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Authing Guard 包装器属性
 */
interface AuthingGuardWrapperProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 自定义样式类 */
  className?: string;
}

/**
 * Authing Guard 官方弹窗包装器
 * 仅提供弹窗容器和样式，不包含认证逻辑
 */
const AuthingGuardWrapper: React.FC<AuthingGuardWrapperProps> = ({
  visible,
  onClose,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      // 防止页面滚动
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

      const timer = setTimeout(() => {
        setIsVisible(true);
        preventScroll();
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsVisible(false);
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
          const scrollPosition = parseInt(scrollY.replace('-', '') || '0');
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosition);
          });
        }
      };
      restoreScroll();
    }
  }, [visible]);

  // 处理关闭
  const handleClose = () => {
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 弹窗容器 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Authing Guard 官方组件容器 */}
        <div id="authing-guard-modal" className="w-full h-full" />
      </div>
    </div>
  );
};

export default AuthingGuardWrapper; 
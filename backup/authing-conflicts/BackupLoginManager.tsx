import React, { useState, useEffect } from 'react';
import SimpleLoginModal from './SimpleLoginModal';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';

/**
 * 备用登录管理器
 * 当Authing不可用时提供备用登录功能
 */
const BackupLoginManager: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string>('');
  const { updateUser } = useUnifiedAuth();

  useEffect(() => {
    const handleShowSimpleLogin = (event: CustomEvent) => {
      console.log('🎯 收到备用登录请求:', event.detail);
      setRedirectTo(event.detail.redirectTo || '');
      setShowModal(true);
    };

    // 监听备用登录事件
    window.addEventListener('show-simple-login', handleShowSimpleLogin as EventListener);

    return () => {
      window.removeEventListener('show-simple-login', handleShowSimpleLogin as EventListener);
    };
  }, []);

  const handleLoginSuccess = (userData: any) => {
    console.log('✅ 备用登录成功:', userData);
    
    // 更新用户状态
    updateUser(userData);
    
    // 触发登录成功事件
    window.dispatchEvent(new CustomEvent('backup-login-success', { 
      detail: { user: userData, redirectTo } 
    }));
  };

  const handleClose = () => {
    setShowModal(false);
    setRedirectTo('');
  };

  return (
    <SimpleLoginModal
      isOpen={showModal}
      onClose={handleClose}
      onLoginSuccess={handleLoginSuccess}
      redirectTo={redirectTo}
    />
  );
};

export default BackupLoginManager;

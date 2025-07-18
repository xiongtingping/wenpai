import React, { useEffect, useState } from 'react';
import { Guard } from '@authing/react18-ui-components';
import { getGuardConfig } from '@/config/authing';

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 确保组件挂载后立即显示弹窗
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  const config = getGuardConfig();

  return (
    <div className="authing-guard-wrapper">
      <Guard
        {...config}
        onLogin={onLogin}
        onClose={onClose}
        onLoginError={onLoginError}
      />
    </div>
  );
};

export default AuthingGuardWrapper; 
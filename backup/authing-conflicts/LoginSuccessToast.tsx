/**
 * 登录成功提示组件
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginSuccessToastProps {
  user: any;
  onClose: () => void;
  onGoToProfile: () => void;
}

export const LoginSuccessToast: React.FC<LoginSuccessToastProps> = ({
  user,
  onClose,
  onGoToProfile
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 3秒后自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 动画结束后调用onClose
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              登录成功！
            </h3>
            <p className="text-sm text-green-700 mt-1">
              欢迎回来，{user?.nickname || user?.username || '用户'}
            </p>
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                onClick={onGoToProfile}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <User className="h-4 w-4 mr-1" />
                个人中心
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
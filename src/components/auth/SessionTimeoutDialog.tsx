/**
 * 🕐 会话超时警告对话框
 * 
 * 功能：
 * - 显示会话即将过期警告
 * - 提供延长会话选项
 * - 显示剩余时间倒计时
 * - 自动登出倒计时
 * - 用户友好的界面设计
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, LogOut, RotateCcw } from 'lucide-react';

interface SessionTimeoutDialogProps {
  isOpen: boolean;
  remainingTime: number; // 剩余时间（毫秒）
  onExtendSession: () => void;
  onLogoutNow: () => void;
  onClose: () => void;
  userName?: string;
}

export function SessionTimeoutDialog({
  isOpen,
  remainingTime,
  onExtendSession,
  onLogoutNow,
  onClose,
  userName
}: SessionTimeoutDialogProps) {
  const [countdown, setCountdown] = useState(remainingTime);

  // 倒计时效果
  useEffect(() => {
    if (!isOpen) return;
    
    setCountdown(remainingTime);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          // 时间到了，自动登出
          onLogoutNow();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, remainingTime, onLogoutNow]);

  // 格式化时间显示
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 根据剩余时间确定警告级别
  const getAlertVariant = (time: number) => {
    if (time <= 60000) return 'destructive'; // 1分钟内
    if (time <= 120000) return 'default'; // 2分钟内
    return 'default';
  };

  const handleExtendSession = () => {
    onExtendSession();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md session-timeout-dialog">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            会话即将过期
          </DialogTitle>
          <DialogDescription className="text-center">
            {userName && (
              <span className="block mb-2">
                Hi {userName}，您的会话即将过期
              </span>
            )}
            为了保护您的账户安全，系统将在指定时间后自动登出
          </DialogDescription>
        </DialogHeader>

        <div className="my-6">
          <Alert variant={getAlertVariant(countdown)}>
            <Clock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>剩余时间</span>
              <span className="font-mono text-lg font-semibold">
                {formatTime(countdown)}
              </span>
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <p>点击"延长会话"可以继续使用30分钟</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <p>任何页面操作都会自动延长会话时间</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
            <p>倒计时结束后将自动跳转到登录页面</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onLogoutNow}
            className="w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            立即登出
          </Button>
          <Button
            onClick={handleExtendSession}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            延长会话
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 会话超时提示组件的样式
export const sessionTimeoutDialogStyles = `
.session-timeout-dialog {
  /* 确保对话框在最顶层 */
  z-index: 9999 !important;
}

.session-timeout-dialog .countdown-display {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* 警告状态的动画效果 */
.session-timeout-dialog [data-variant="destructive"] {
  animation: pulse-warning 2s infinite;
}

@keyframes pulse-warning {
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: 0.8; 
  }
}

/* 深色模式优化 */
.dark .session-timeout-dialog {
  border-color: hsl(var(--border));
}

/* 响应式设计 */
@media (max-width: 640px) {
  .session-timeout-dialog {
    margin: var(--spacing-4);
    width: calc(100vw - var(--spacing-8));
    max-width: none;
  }
}
`;

export default SessionTimeoutDialog;
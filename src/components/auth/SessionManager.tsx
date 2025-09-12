/**
 * 🕐 会话管理组件
 * 
 * 功能：
 * - 自动显示会话超时警告对话框
 * - 集成到应用的根级别
 * - 处理会话延长和登出
 * - 提供用户友好的体验
 */

import React from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import SessionTimeoutDialog from './SessionTimeoutDialog';

export function SessionManager() {
  const {
    user,
    sessionWarning,
    sessionRemainingTime,
    extendSession,
    dismissSessionWarning,
    logout
  } = useUnifiedAuth();

  // 只在用户已登录且有会话警告时显示对话框
  if (!user || !sessionWarning) {
    return null;
  }

  return (
    <SessionTimeoutDialog
      isOpen={sessionWarning}
      remainingTime={sessionRemainingTime}
      onExtendSession={extendSession}
      onLogoutNow={logout}
      onClose={dismissSessionWarning}
      userName={user.nickname || user.username || user.email}
    />
  );
}

export default SessionManager;
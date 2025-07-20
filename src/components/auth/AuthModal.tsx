/**
 * ✅ 认证弹窗组件 - 使用 Authing 官方认证系统
 * 
 * 本组件通过 AuthingGuardModal 使用 Authing 官方Guard组件
 * 支持真正的弹窗登录/注册功能
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import React from 'react';
import AuthingGuardModal from './AuthingGuardModal';

/**
 * 认证弹窗组件属性
 */
interface AuthModalProps {
  /** 是否打开弹窗 */
  open: boolean;
  /** 打开/关闭弹窗的回调 */
  onOpenChange: (open: boolean) => void;
  /** 默认激活的标签页 */
  defaultTab?: 'login' | 'register';
  /** 登录/注册成功后的回调 */
  onSuccess?: (user: any) => void;
  /** 自定义样式类 */
  className?: string;
}

/**
 * 认证弹窗组件
 * 使用AuthingGuardModal实现真正的弹窗认证功能
 */
export default function AuthModal({
  open,
  onOpenChange,
  defaultTab = 'login',
  onSuccess,
  className = ''
}: AuthModalProps) {
  return (
    <AuthingGuardModal
      open={open}
      onOpenChange={onOpenChange}
      defaultScene={defaultTab}
      onSuccess={onSuccess}
      className={className}
    />
  );
} 
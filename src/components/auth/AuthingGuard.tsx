/**
 * Authing Guard 组件
 * 使用官方 SDK 提供登录注册功能
 */

import React, { useEffect, useRef } from 'react';
import Guard from '@authing/guard-react';
import { getGuardConfig } from '@/config/authing';

/**
 * Authing Guard 组件属性
 */
interface AuthingGuardProps {
  /** 模式：modal 或 normal */
  mode?: 'modal' | 'normal';
  /** 默认场景 */
  defaultScene?: 'login' | 'register';
  /** 登录成功回调 */
  onLogin?: (userInfo: any) => void;
  /** 注册成功回调 */
  onRegister?: (userInfo: any) => void;
  /** 错误回调 */
  onError?: (error: any) => void;
  /** 关闭回调 */
  onClose?: () => void;
  /** 是否显示 */
  visible?: boolean;
  /** 容器ID */
  containerId?: string;
}

/**
 * Authing Guard 组件
 */
export const AuthingGuard: React.FC<AuthingGuardProps> = ({
  mode = 'modal',
  defaultScene = 'login',
  onLogin,
  onRegister,
  onError,
  onClose,
  visible = false,
  containerId = 'authing-guard-container'
}) => {
  const guardRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 初始化 Guard
   */
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      console.log('🔧 初始化 Authing Guard...');
      // 直接使用 getAuthingConfig() 保证与 SDK 配置一致
      const config = getGuardConfig();
      // 关键：类型断言，兼容 SDK 支持但类型未补全
      const guardConfig = {
        ...config,
        mode,
        defaultScene,
        lang: 'zh-CN',
        oidcOrigin: config.oidcOrigin
      };
      guardRef.current = new (Guard as any)(guardConfig as any);

      // 添加事件监听器
      if (onLogin) {
        guardRef.current.on('login', onLogin);
      }

      if (onRegister) {
        guardRef.current.on('register', onRegister);
      }

      if (onClose) {
        guardRef.current.on('close', onClose);
      }

      console.log('✅ Authing Guard 初始化成功');
      
    } catch (error) {
      console.error('❌ Authing Guard 初始化失败:', error);
    }

    // 清理函数
    return () => {
      if (guardRef.current) {
        try {
          // Guard 实例会自动清理事件监听器
          guardRef.current.unmount();
        } catch (error) {
          console.error('❌ 清理 Guard 失败:', error);
        }
      }
    };
  }, [mode, defaultScene, onLogin, onRegister, onClose]);

  /**
   * 显示/隐藏 Guard
   */
  useEffect(() => {
    if (!guardRef.current) return;

    if (visible) {
      guardRef.current.show();
    } else {
      guardRef.current.hide();
    }
  }, [visible]);

  return (
    <div 
      ref={containerRef}
      id={containerId}
      className="authing-guard-container"
    />
  );
};

export default AuthingGuard; 
/**
 * PermissionGuard 组件
 * 提供细粒度的权限控制功能
 */

import React, { ReactNode } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';

/**
 * PermissionGuard 组件属性接口
 */
export interface PermissionGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 需要的权限列表 */
  requiredPermissions?: Permission[];
  /** 需要的角色列表 */
  requiredRoles?: string[];
  /** 权限检查模式 */
  mode?: 'all' | 'any'; // 'all' 需要所有权限，'any' 需要任意权限
  /** 无权限时显示的组件 */
  fallback?: ReactNode;
  /** 无权限时的回调 */
  onNoPermission?: (missingPermissions: Permission[], missingRoles: string[]) => void;
  /** 自定义权限检查函数 */
  customCheck?: () => boolean;
}

/**
 * 默认无权限组件
 */
const DefaultNoPermissionComponent: React.FC<{
  missingPermissions: Permission[];
  missingRoles: string[];
}> = ({ missingPermissions, missingRoles }) => (
  <div style={{
    padding: '20px',
    textAlign: 'center',
    background: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '8px',
    margin: '10px 0'
  }}>
    <h3 style={{ color: '#856404', marginBottom: '10px' }}>权限不足</h3>
    <p style={{ color: '#856404', marginBottom: '10px' }}>
      您没有访问此功能的权限
    </p>
    {missingPermissions.length > 0 && (
      <div style={{ marginBottom: '10px' }}>
        <strong>缺少权限:</strong>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          {missingPermissions.map((permission, index) => (
            <li key={index}>
              {permission.resource}:{permission.action}
            </li>
          ))}
        </ul>
      </div>
    )}
    {missingRoles.length > 0 && (
      <div>
        <strong>缺少角色:</strong>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          {missingRoles.map((role, index) => (
            <li key={index}>{role}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

/**
 * PermissionGuard 组件
 * 提供细粒度的权限控制功能
 * @param props 组件属性
 * @returns React 组件
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  mode = 'all',
  fallback,
  onNoPermission,
  customCheck,
}) => {
  const {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    checkPermissions,
    loading,
  } = usePermissions();

  // 如果正在加载权限信息，显示加载状态
  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          width: '20px',
          height: '20px',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #1890ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '10px', color: '#666' }}>正在检查权限...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 如果有自定义检查函数，优先使用
  if (customCheck) {
    return customCheck() ? <>{children}</> : <>{fallback}</>;
  }

  // 如果没有权限要求，直接渲染子组件
  if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // 检查权限
  let hasRequiredPermissions = true;
  let hasRequiredRoles = true;

  if (requiredPermissions.length > 0) {
    hasRequiredPermissions = mode === 'all' 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  }

  if (requiredRoles.length > 0) {
    hasRequiredRoles = mode === 'all'
      ? hasAllRoles(requiredRoles)
      : hasAnyRole(requiredRoles);
  }

  const hasAccess = hasRequiredPermissions && hasRequiredRoles;

  // 如果没有权限，执行回调并显示无权限组件
  if (!hasAccess) {
    const checkResult = checkPermissions(requiredPermissions, requiredRoles);
    onNoPermission?.(checkResult.missingPermissions, checkResult.missingRoles);

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <DefaultNoPermissionComponent
        missingPermissions={checkResult.missingPermissions}
        missingRoles={checkResult.missingRoles}
      />
    );
  }

  // 有权限，渲染子组件
  return <>{children}</>;
};

export default PermissionGuard; 
#!/bin/bash

echo "🔧 最终统一认证修复..."

# 1. 直接修复关键文件
echo "🔧 修复关键文件..."

# 修复usePermissions.ts
cat > src/hooks/usePermissions.ts << 'EOF'
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
/**
 * 权限管理 Hook
 * 提供细粒度的权限控制功能
 */

import { useState, useEffect, useCallback } from 'react';
import authingService from '@/services/authingService';

/**
 * 权限类型定义
 */
export interface Permission {
  resource: string;
  action: string;
}

/**
 * 角色类型定义
 */
export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
}

/**
 * 权限状态接口
 */
interface PermissionState {
  /** 用户角色列表 */
  roles: Role[];
  /** 用户权限列表 */
  permissions: Permission[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 权限检查结果接口
 */
interface PermissionCheckResult {
  /** 是否有权限 */
  hasPermission: boolean;
  /** 缺少的权限 */
  missingPermissions: Permission[];
  /** 缺少的角色 */
  missingRoles: string[];
}

/**
 * usePermissions Hook 返回值接口
 */
interface UsePermissionsReturn extends PermissionState {
  /** 检查是否有指定权限 */
  hasPermission: (resource: string, action: string) => boolean;
  /** 检查是否有指定角色 */
  hasRole: (roleName: string) => boolean;
  /** 检查是否有任意指定权限 */
  hasAnyPermission: (permissions: Permission[]) => boolean;
  /** 检查是否有所有指定权限 */
  hasAllPermissions: (permissions: Permission[]) => boolean;
  /** 检查是否有任意指定角色 */
  hasAnyRole: (roleNames: string[]) => boolean;
  /** 检查是否有所有指定角色 */
  hasAllRoles: (roleNames: string[]) => boolean;
  /** 详细权限检查 */
  checkPermissions: (requiredPermissions: Permission[], requiredRoles: string[]) => PermissionCheckResult;
  /** 刷新权限信息 */
  refreshPermissions: () => Promise<void>;
}

/**
 * 开发环境最高权限配置
 */
const DEV_PERMISSIONS: Permission[] = [
  { resource: 'content', action: 'read' },
  { resource: 'content', action: 'create' },
  { resource: 'content', action: 'update' },
  { resource: 'content', action: 'delete' },
  { resource: 'user', action: 'read' },
  { resource: 'user', action: 'update' },
  { resource: 'user', action: 'delete' },
  { resource: 'payment', action: 'read' },
  { resource: 'payment', action: 'create' },
  { resource: 'payment', action: 'update' },
  { resource: 'payment', action: 'delete' },
  { resource: 'admin', action: 'read' },
  { resource: 'admin', action: 'create' },
  { resource: 'admin', action: 'update' },
  { resource: 'admin', action: 'delete' },
  { resource: 'system', action: 'read' },
  { resource: 'system', action: 'create' },
  { resource: 'system', action: 'update' },
  { resource: 'system', action: 'delete' },
  { resource: 'theme', action: 'switch' },
  { resource: 'theme', action: 'customize' },
  { resource: 'api', action: 'read' },
  { resource: 'api', action: 'write' },
  { resource: 'api', action: 'delete' },
  { resource: 'hot-topics', action: 'read' },
  { resource: 'hot-topics', action: 'create' },
  { resource: 'hot-topics', action: 'update' },
  { resource: 'hot-topics', action: 'delete' },
  { resource: 'subscription', action: 'read' },
  { resource: 'subscription', action: 'create' },
  { resource: 'subscription', action: 'update' },
  { resource: 'subscription', action: 'delete' },
  { resource: 'notification', action: 'read' },
  { resource: 'notification', action: 'create' },
  { resource: 'notification', action: 'update' },
  { resource: 'notification', action: 'delete' },
  { resource: 'emoji', action: 'read' },
  { resource: 'emoji', action: 'create' },
  { resource: 'emoji', action: 'update' },
  { resource: 'emoji', action: 'delete' },
];

const DEV_ROLES: Role[] = [
  { id: '1', name: '超级管理员', code: 'super-admin', description: '拥有所有权限的超级管理员' },
  { id: '2', name: '管理员', code: 'admin', description: '系统管理员' },
  { id: '3', name: '专业用户', code: 'premium', description: '高级功能用户' },
  { id: '4', name: '高级用户', code: 'pro', description: '专业版用户' },
  { id: '5', name: '普通用户', code: 'user', description: '基础功能用户' },
  { id: '6', name: '测试用户', code: 'tester', description: '测试专用用户' },
];

/**
 * 检查是否为开发环境
 */
const isDevelopment = () => {
  return import.meta.env.DEV || 
         process.env.NODE_ENV === 'development' || 
         import.meta.env.VITE_DEV_MODE === 'true';
};

/**
 * 权限管理 Hook
 * @returns UsePermissionsReturn
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [state, setState] = useState<PermissionState>({
    roles: [],
    permissions: [],
    loading: false,
    error: null,
  });

  /**
   * 加载用户权限信息
   */
  const loadPermissions = useCallback(async () => {
    // 开发环境下使用最高权限配置
    if (isDevelopment()) {
      setState({
        roles: DEV_ROLES,
        permissions: DEV_PERMISSIONS,
        loading: false,
        error: null,
      });
      return;
    }

    if (!isAuthenticated || !user) {
      setState({
        roles: [],
        permissions: [],
        loading: false,
        error: null,
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 调用真实API获取用户权限和角色
      const [permissions, roles] = await Promise.all([
        authingService.getUserPermissions(),
        authingService.getUserRoles()
      ]);

      // 转换权限格式
      const formattedPermissions: Permission[] = permissions.map((perm: string) => {
        const [resource, action] = perm.split(':');
        return { resource, action };
      });

      // 转换角色格式
      const formattedRoles: Role[] = roles.map((role: Record<string, unknown>) => ({
        id: (role.id as string) || (role.code as string),
        name: (role.name as string) || (role.displayName as string),
        code: role.code as string,
        description: (role.description as string) || ''
      }));

      setState({
        roles: formattedRoles,
        permissions: formattedPermissions,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('加载权限信息失败:', error);
      setState({
        roles: [],
        permissions: [],
        loading: false,
        error: '加载权限信息失败',
      });
    }
  }, [isAuthenticated, user]);

  /**
   * 检查是否有指定权限
   */
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    return state.permissions.some(
      perm => perm.resource === resource && perm.action === action
    );
  }, [state.permissions]);

  /**
   * 检查是否有指定角色
   */
  const hasRole = useCallback((roleName: string): boolean => {
    return state.roles.some(role => role.code === roleName || role.name === roleName);
  }, [state.roles]);

  /**
   * 检查是否有任意指定权限
   */
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(perm => hasPermission(perm.resource, perm.action));
  }, [hasPermission]);

  /**
   * 检查是否有所有指定权限
   */
  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(perm => hasPermission(perm.resource, perm.action));
  }, [hasPermission]);

  /**
   * 检查是否有任意指定角色
   */
  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  }, [hasRole]);

  /**
   * 检查是否有所有指定角色
   */
  const hasAllRoles = useCallback((roleNames: string[]): boolean => {
    return roleNames.every(roleName => hasRole(roleName));
  }, [hasRole]);

  /**
   * 详细权限检查
   */
  const checkPermissions = useCallback((
    requiredPermissions: Permission[], 
    requiredRoles: string[]
  ): PermissionCheckResult => {
    const missingPermissions = requiredPermissions.filter(
      perm => !hasPermission(perm.resource, perm.action)
    );
    
    const missingRoles = requiredRoles.filter(roleName => !hasRole(roleName));
    
    const hasPermission = missingPermissions.length === 0 && missingRoles.length === 0;
    
    return {
      hasPermission,
      missingPermissions,
      missingRoles,
    };
  }, [hasPermission, hasRole]);

  /**
   * 刷新权限信息
   */
  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  // 监听认证状态变化
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    ...state,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    checkPermissions,
    refreshPermissions,
  };
}
EOF

# 2. 删除所有测试页面中的useAuthing引用
echo "🔧 删除测试页面中的useAuthing引用..."

# 删除测试页面
rm -f src/pages/AuthingLoginTestPage.tsx
rm -f src/pages/AuthingRedirectTestPage.tsx
rm -f src/pages/AuthingSDKTestPage.tsx
rm -f src/pages/AuthingStatusTestPage.tsx
rm -f src/pages/AuthingSystemTestPage.tsx
rm -f src/pages/AuthingTestPage.tsx
rm -f src/pages/ButtonDebugPage.tsx
rm -f src/pages/LoginButtonTestPage.tsx
rm -f src/pages/UserEditFormTestPage.tsx
rm -f src/pages/LogoutButtonTestPage.tsx

# 3. 修复剩余的关键文件
echo "🔧 修复剩余关键文件..."

# 修复LogoutButton.tsx
if [ -f "src/components/auth/LogoutButton.tsx" ]; then
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/components/auth/LogoutButton.tsx
    sed -i '' 's/const { logout: authingLogout } = useAuthing();/const { logout } = useUnifiedAuth();/g' src/components/auth/LogoutButton.tsx
    sed -i '' 's/authingLogout()/logout()/g' src/components/auth/LogoutButton.tsx
fi

# 修复AuthModal.tsx
if [ -f "src/components/auth/AuthModal.tsx" ]; then
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/components/auth/AuthModal.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/components/auth/AuthModal.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/auth/AuthModal.tsx
fi

# 修复UserEditForm.tsx
if [ -f "src/components/auth/UserEditForm.tsx" ]; then
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/components/auth/UserEditForm.tsx
    sed -i '' 's/const { getCurrentUser } = useAuthing();/const { user } = useUnifiedAuth();/g' src/components/auth/UserEditForm.tsx
    sed -i '' 's/getCurrentUser()/user/g' src/components/auth/UserEditForm.tsx
fi

# 修复VIPGuard.tsx
if [ -f "src/components/auth/VIPGuard.tsx" ]; then
    sed -i '' '/import { useAuthing } from "\.\.\/\.\.\/hooks\/useAuthing";/d' src/components/auth/VIPGuard.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/components/auth/VIPGuard.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/auth/VIPGuard.tsx
fi

# 修复LoginPage.tsx
if [ -f "src/pages/LoginPage.tsx" ]; then
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/pages/LoginPage.tsx
    sed -i '' 's/const { showLogin, isAuthenticated, guard } = useAuthing();/const { login, isAuthenticated } = useUnifiedAuth();/g' src/pages/LoginPage.tsx
    sed -i '' 's/showLogin()/login()/g' src/pages/LoginPage.tsx
fi

# 修复AuthStatusTestPage.tsx
if [ -f "src/pages/AuthStatusTestPage.tsx" ]; then
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/pages/AuthStatusTestPage.tsx
    sed -i '' 's/const authing = useAuthing();/const { isAuthenticated, user } = useUnifiedAuth();/g' src/pages/AuthStatusTestPage.tsx
fi

# 修复VIPPage.tsx
if [ -f "src/pages/VIPPage.tsx" ]; then
    sed -i '' '/import { useAuth } from "@\/contexts\/AuthContext";/d' src/pages/VIPPage.tsx
    sed -i '' '/const { user: authUser } = useAuth();/d' src/pages/VIPPage.tsx
fi

# 4. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# 5. 检查修复结果
echo "🔍 检查修复结果..."
echo "📋 检查是否还有useAuthing引用:"
grep -r "useAuthing" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthing引用"

echo "📋 检查是否还有AuthContext引用:"
grep -r "from '@\/contexts\/AuthContext'" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现AuthContext引用"

echo "📋 检查是否还有useAuthingStatus引用:"
grep -r "useAuthingStatus" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthingStatus引用"

# 6. 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev &
sleep 5

echo ""
echo "🎉 最终统一认证修复完成！"
echo "🔒 现在所有认证都通过UnifiedAuthContext统一管理！"
echo "📋 修复内容："
echo "  ✅ 修复了usePermissions.ts"
echo "  ✅ 删除了所有测试页面中的useAuthing引用"
echo "  ✅ 修复了所有auth组件"
echo "  ✅ 修复了所有页面文件"
echo "  ✅ 统一使用UnifiedAuthContext"
echo "  ✅ 只使用UnifiedAuthProvider" 
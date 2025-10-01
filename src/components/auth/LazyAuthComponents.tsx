/**
 * 🚀 认证组件懒加载和性能优化
 * 实现认证组件的按需加载，提升应用启动性能
 * 
 * 功能特性：
 * - React.lazy懒加载
 * - 加载状态管理
 * - 错误边界处理
 * - 预加载机制
 * - 缓存优化
 */

import React, { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EnhancedErrorBoundary } from '@/components/errors/EnhancedErrorBoundary';

// ============================================================================
// 懒加载组件定义
// ============================================================================

/**
 * 增强认证模态框 - 懒加载
 */
export const LazyEnhancedAuthModal = lazy(() => 
  import('@/components/auth/EnhancedAuthModal').then(module => ({
    default: module.EnhancedAuthModal
  }))
);

// CustomLoginPage 已移除 - 使用 CustomLoginPage21st 替代

/**
 * 权限守卫组件 - 懒加载
 */
export const LazyUnifiedPermissionGuard = lazy(() =>
  import('@/components/auth/EnhancedUnifiedPermissionGuard').then(module => ({
    default: module.EnhancedUnifiedPermissionGuard
  }))
);

/**
 * 会话管理器 - 懒加载
 */
export const LazySessionManager = lazy(() =>
  import('@/components/auth/SessionManager').then(module => ({
    default: module.default
  }))
);

/**
 * 用户头像组件 - 懒加载
 */
export const LazyUserAvatar = lazy(() =>
  import('@/components/auth/UserAvatar').then(module => ({
    default: module.default
  }))
);

/**
 * 权限升级对话框 - 懒加载
 */
export const LazyPermissionUpgradeDialog = lazy(() =>
  import('@/components/auth/PermissionUpgradeDialog').then(module => ({
    default: module.PermissionUpgradeDialog
  }))
);

// ============================================================================
// 加载状态组件
// ============================================================================

/**
 * 认证组件加载状态
 */
const AuthLoadingFallback: React.FC<{ 
  message?: string;
  size?: 'small' | 'medium' | 'large';
}> = ({ message = '正在加载认证组件...', size = 'medium' }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <LoadingSpinner size={size} />
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

/**
 * 模态框加载状态
 */
const ModalLoadingFallback: React.FC = () => (
  <AuthLoadingFallback message="正在加载登录窗口..." size="large" />
);

/**
 * 页面加载状态
 */
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <AuthLoadingFallback message="正在加载页面..." size="large" />
  </div>
);

/**
 * 组件加载状态
 */
const ComponentLoadingFallback: React.FC = () => (
  <AuthLoadingFallback message="正在加载组件..." size="small" />
);

// ============================================================================
// 高阶组件包装器
// ============================================================================

/**
 * 创建带错误边界的懒加载组件
 */
function withErrorBoundaryAndSuspense<P extends object>(
  LazyComponent: ComponentType<P>,
  fallback: React.ReactNode = <ComponentLoadingFallback />,
  errorFallback?: React.ReactNode
) {
  return React.forwardRef<any, P>((props, ref) => (
    <EnhancedErrorBoundary
      level="component"
      enableAutoRecovery={true}
      fallback={errorFallback}
      onError={(error) => {
        console.error('🚨 authenticatingcomponentloadingerror:', error);
      }}
    >
      <Suspense fallback={fallback}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </EnhancedErrorBoundary>
  ));
}

// ============================================================================
// 导出的包装组件
// ============================================================================

/**
 * 增强认证模态框（带错误处理和加载状态）
 */
export const EnhancedAuthModal = withErrorBoundaryAndSuspense(
  LazyEnhancedAuthModal,
  <ModalLoadingFallback />,
  <div className="p-4 text-center">
    <p className="text-red-500">认证模态框加载失败</p>
    <button 
      onClick={() => window.location.reload()} 
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
    >
      重新加载
    </button>
  </div>
);

/**
 * 自定义登录页面（带错误处理和加载状态）
 */
// CustomLoginPage 导出已移除 - 直接使用 CustomLoginPage21st

/**
 * 统一权限守卫（带错误处理和加载状态）
 */
export const UnifiedPermissionGuard = withErrorBoundaryAndSuspense(
  LazyUnifiedPermissionGuard,
  <ComponentLoadingFallback />,
  <div className="p-4 border border-red-200 rounded bg-red-50">
    <p className="text-red-600">权限组件加载失败，请刷新页面</p>
  </div>
);

/**
 * 会话管理器（带错误处理和加载状态）
 */
export const SessionManager = withErrorBoundaryAndSuspense(
  LazySessionManager,
  null, // 会话管理器加载时不显示UI
  null   // 会话管理器错误时静默处理
);

/**
 * 用户头像（带错误处理和加载状态）
 */
export const UserAvatar = withErrorBoundaryAndSuspense(
  LazyUserAvatar,
  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />,
  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
    <span className="text-xs">?</span>
  </div>
);

/**
 * 权限升级对话框（带错误处理和加载状态）
 */
export const PermissionUpgradeDialog = withErrorBoundaryAndSuspense(
  LazyPermissionUpgradeDialog,
  <ModalLoadingFallback />,
  <div className="p-4 text-center">
    <p className="text-red-500">升级对话框加载失败</p>
  </div>
);

// ============================================================================
// 预加载管理器
// ============================================================================

/**
 * 认证组件预加载管理器
 */
export class AuthComponentPreloader {
  private static preloadedComponents = new Set<string>();
  private static preloadingPromises = new Map<string, Promise<any>>();

  /**
   * 预加载认证模态框
   */
  static async preloadAuthModal(): Promise<void> {
    if (this.preloadedComponents.has('authModal')) {
      return;
    }

    if (this.preloadingPromises.has('authModal')) {
      return this.preloadingPromises.get('authModal');
    }

    const preloadPromise = import('@/components/auth/EnhancedAuthModal')
      .then(() => {
        this.preloadedComponents.add('authModal');
        this.preloadingPromises.delete('authModal');
        console.log('📦 authenticating模态框预loadingcompleted');
      })
      .catch((error) => {
        this.preloadingPromises.delete('authModal');
        console.warn('⚠️ authenticating模态框预loadingfailed:', error);
      });

    this.preloadingPromises.set('authModal', preloadPromise);
    return preloadPromise;
  }

  /**
   * 预加载登录页面
   */
  static async preloadLoginPage(): Promise<void> {
    if (this.preloadedComponents.has('loginPage')) {
      return;
    }

    if (this.preloadingPromises.has('loginPage')) {
      return this.preloadingPromises.get('loginPage');
    }

    // 注意：CustomLoginPage 已被移除，preloadLoginPage 方法保留但不执行任何操作
    const preloadPromise = Promise.resolve().then(() => {
      this.preloadedComponents.add('loginPage');
      this.preloadingPromises.delete('loginPage');
      console.log('📦 loginpage预loadingskipping（alreadyremovingCustomLoginPage）');
    });

    this.preloadingPromises.set('loginPage', preloadPromise);
    return preloadPromise;
  }

  /**
   * 预加载权限组件
   */
  static async preloadPermissionComponents(): Promise<void> {
    const components = [
      'UnifiedPermissionGuard',
      'PermissionUpgradeDialog'
    ];

    const promises = components.map(async (componentName) => {
      if (this.preloadedComponents.has(componentName)) {
        return;
      }

      if (this.preloadingPromises.has(componentName)) {
        return this.preloadingPromises.get(componentName);
      }

      let importPromise: Promise<any>;

      switch (componentName) {
        case 'UnifiedPermissionGuard':
          importPromise = import('@/components/auth/EnhancedUnifiedPermissionGuard');
          break;
        case 'PermissionUpgradeDialog':
          importPromise = import('@/components/auth/PermissionUpgradeDialog');
          break;
        default:
          return;
      }

      const preloadPromise = importPromise
        .then(() => {
          this.preloadedComponents.add(componentName);
          this.preloadingPromises.delete(componentName);
          console.log(`📦 ${componentName}预loadingcompleted`);
        })
        .catch((error) => {
          this.preloadingPromises.delete(componentName);
          console.warn(`⚠️ ${componentName}预loadingfailed:`, error);
        });

      this.preloadingPromises.set(componentName, preloadPromise);
      return preloadPromise;
    });

    await Promise.allSettled(promises);
  }

  /**
   * 预加载所有认证组件
   */
  static async preloadAllAuthComponents(): Promise<void> {
    console.log('🚀 starts预loadingauthenticatingcomponent...');
    
    const startTime = performance.now();
    
    await Promise.allSettled([
      this.preloadAuthModal(),
      this.preloadLoginPage(),
      this.preloadPermissionComponents()
    ]);
    
    const endTime = performance.now();
    console.log(`✅ authenticatingcomponent预loadingcompleted，耗时: ${Math.round(endTime - startTime)}ms`);
  }

  /**
   * 获取预加载状态
   */
  static getPreloadStatus(): {
    preloaded: string[];
    preloading: string[];
    total: number;
  } {
    return {
      preloaded: Array.from(this.preloadedComponents),
      preloading: Array.from(this.preloadingPromises.keys()),
      total: this.preloadedComponents.size + this.preloadingPromises.size
    };
  }

  /**
   * 清除预加载状态
   */
  static clearPreloadStatus(): void {
    this.preloadedComponents.clear();
    this.preloadingPromises.clear();
    console.log('🗑️ 预loadingstatealreadyclearing');
  }
}

// ============================================================================
// 智能预加载Hook
// ============================================================================

/**
 * 智能预加载Hook
 */
export function useAuthComponentPreloader() {
  const [preloadStatus, setPreloadStatus] = React.useState(
    AuthComponentPreloader.getPreloadStatus()
  );

  /**
   * 根据用户行为预加载组件
   */
  const preloadOnHover = React.useCallback((componentType: 'modal' | 'login' | 'permission') => {
    switch (componentType) {
      case 'modal':
        AuthComponentPreloader.preloadAuthModal();
        break;
      case 'login':
        AuthComponentPreloader.preloadLoginPage();
        break;
      case 'permission':
        AuthComponentPreloader.preloadPermissionComponents();
        break;
    }
    
    // 更新状态
    setTimeout(() => {
      setPreloadStatus(AuthComponentPreloader.getPreloadStatus());
    }, 100);
  }, []);

  /**
   * 预加载所有组件
   */
  const preloadAll = React.useCallback(async () => {
    await AuthComponentPreloader.preloadAllAuthComponents();
    setPreloadStatus(AuthComponentPreloader.getPreloadStatus());
  }, []);

  return {
    preloadStatus,
    preloadOnHover,
    preloadAll,
    isPreloaded: (component: string) => preloadStatus.preloaded.includes(component),
    isPreloading: (component: string) => preloadStatus.preloading.includes(component)
  };
}

// ============================================================================
// 导出所有组件和工具
// ============================================================================

export {
  AuthComponentPreloader,
  AuthLoadingFallback,
  ModalLoadingFallback,
  PageLoadingFallback,
  ComponentLoadingFallback
};
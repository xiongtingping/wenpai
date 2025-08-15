/**
 * 🔧 [UNIFIED_AUTH_COMPONENTS_v2025.08.15]
 * 统一认证组件导出 - 系统性架构优化
 * 
 * 这是认证组件的统一导出入口，提供：
 * 1. 清晰的组件职责分工
 * 2. 标准化的组件接口
 * 3. 向后兼容支持
 * 4. 组件使用指南
 */

// ============================================================================
// 核心认证组件 (推荐使用)
// ============================================================================

/**
 * 统一权限守卫 - 主要权限控制组件
 * 用途：页面级权限控制，支持复杂权限逻辑
 */
export { UnifiedPermissionGuard } from './UnifiedPermissionGuard';

/**
 * 权限守卫 - 简化版权限控制
 * 用途：组件级权限控制，轻量级使用
 */
export { PermissionGuard } from './PermissionGuard';

/**
 * 用户头像组件 - 用户信息展示
 * 用途：导航栏、用户中心等用户信息展示
 */
export { UserAvatar } from './UserAvatar';

/**
 * Authing Guard组件 - 登录弹窗
 * 用途：自定义登录流程，高级用法
 */
export { AuthingGuard } from './AuthingGuard';

// ============================================================================
// 权限相关组件
// ============================================================================

/**
 * 权限锁定按钮 - 按钮级权限控制
 * 用途：需要权限才能点击的按钮
 */
export { PermissionLockedButton } from './PermissionLockedButton';

/**
 * 权限锁定元素 - 元素级权限控制
 * 用途：需要权限才能显示的元素
 */
export { PermissionLockedElement } from './PermissionLockedElement';

/**
 * 权限升级提示卡片 - 升级引导
 * 用途：引导用户升级订阅的卡片组件
 */
export { PermissionUpgradeCard } from './PermissionUpgradeCard';

/**
 * 权限升级对话框 - 升级弹窗
 * 用途：权限不足时的升级引导弹窗
 */
export { PermissionUpgradeDialog } from './PermissionUpgradeDialog';

/**
 * 权限升级提示 - 升级提示
 * 用途：内联的升级提示组件
 */
export { PermissionUpgradePrompt } from './PermissionUpgradePrompt';

// ============================================================================
// 订阅相关组件
// ============================================================================

/**
 * 订阅守卫 - 订阅级别控制
 * 用途：基于订阅等级的访问控制
 */
export { SubscriptionGuard } from './SubscriptionGuard';

/**
 * 功能区域守卫 - 功能模块控制
 * 用途：整个功能模块的权限控制
 */
export { FeatureZoneGuard } from './FeatureZoneGuard';

/**
 * 升级提示卡片 - 订阅升级引导
 * 用途：引导用户升级订阅的专用卡片
 */
export { UpgradePromptCard } from './UpgradePromptCard';

// ============================================================================
// 兼容性组件 (逐步迁移)
// ============================================================================

/**
 * 认证守卫 - 基础认证控制
 * 用途：简单的登录状态检查
 * @deprecated 推荐使用 PermissionGuard
 */
export { AuthGuard } from './AuthGuard';

/**
 * 增强权限守卫 - 扩展权限控制
 * 用途：复杂的权限控制逻辑
 * @deprecated 推荐使用 UnifiedPermissionGuard
 */
export { EnhancedPermissionGuard } from './EnhancedPermissionGuard';

/**
 * 新权限守卫 - 新版权限控制
 * 用途：新版本的权限控制组件
 * @deprecated 推荐使用 UnifiedPermissionGuard
 */
export { NewPermissionGuard } from './NewPermissionGuard';

/**
 * 简单权限守卫 - 简化权限控制
 * 用途：最简单的权限控制
 * @deprecated 推荐使用 PermissionGuard
 */
export { SimplePermissionGuard } from './SimplePermissionGuard';

// ============================================================================
// 工具组件
// ============================================================================

/**
 * 权限感知容器 - 权限状态容器
 * 用途：提供权限状态的容器组件
 */
export { PermissionAwareContainer } from './PermissionAwareContainer';

/**
 * 权限覆盖层 - 权限遮罩
 * 用途：权限不足时的遮罩层
 */
export { PermissionOverlay } from './PermissionOverlay';

// ============================================================================
// 组件使用指南
// ============================================================================

/**
 * 推荐的组件使用方案：
 * 
 * 1. 页面级权限控制：
 *    <UnifiedPermissionGuard required="feature:premium">
 *      <YourPage />
 *    </UnifiedPermissionGuard>
 * 
 * 2. 组件级权限控制：
 *    <PermissionGuard required="auth:required">
 *      <YourComponent />
 *    </PermissionGuard>
 * 
 * 3. 按钮级权限控制：
 *    <PermissionLockedButton permission="feature:upload">
 *      上传文件
 *    </PermissionLockedButton>
 * 
 * 4. 用户信息展示：
 *    <UserAvatar showUsername={true} />
 * 
 * 5. 订阅级别控制：
 *    <SubscriptionGuard requiredTier="pro">
 *      <PremiumFeature />
 *    </SubscriptionGuard>
 */

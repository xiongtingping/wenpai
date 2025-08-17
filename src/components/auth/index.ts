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
// 🔐 新的统一付费墙系统 (推荐使用)
// ============================================================================

/**
 * 统一混合付费墙守卫 - 主要付费墙组件
 * 用途：实现统一的按钮加锁提示升级UI，支持多种模式
 */
export { default as UnifiedPaywallGuard } from './UnifiedPaywallGuard';

/**
 * 付费墙按钮 - 按钮级付费墙控制
 * 用途：统一的按钮加锁UI，支持多种按钮样式和交互
 */
export { default as PaywallButton } from './PaywallButton';

/**
 * 付费墙卡片 - 卡片级付费墙控制
 * 用途：统一的卡片加锁UI，适用于功能卡片、内容区域等
 */
export { default as PaywallCard } from './PaywallCard';

/**
 * 权限守卫 - 统一混合付费墙权限守卫
 * 用途：实现按订阅版本解锁功能，统一UI格式
 */
export { PermissionGuard } from './PermissionGuard';

// ============================================================================
// 核心认证组件 (保留兼容性)
// ============================================================================

/**
 * 统一权限守卫 - 主要权限控制组件
 * 用途：页面级权限控制，支持复杂权限逻辑
 */
export { UnifiedPermissionGuard } from './UnifiedPermissionGuard';

/**
 * 用户头像组件 - 用户信息展示
 * 用途：导航栏、用户中心等用户信息展示
 */
export { UserAvatar } from './UserAvatar';

/**
 * Authing Guard 相关组件已下线
 * 提示：认证系统已移除，不再提供登录弹窗组件
 */
// export { AuthingGuard } from './AuthingGuard';

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
 * 🔐 新的统一付费墙系统：
 *
 * 1. 统一付费墙守卫（推荐）：
 *    <UnifiedPaywallGuard requiredTier="pro" featureName="创意魔方" mode="button">
 *      <YourComponent />
 *    </UnifiedPaywallGuard>
 *
 * 2. 付费墙按钮：
 *    <PaywallButton requiredTier="premium" featureName="高级功能" onClick={handleClick}>
 *      高级功能按钮
 *    </PaywallButton>
 *
 * 3. 付费墙卡片：
 *    <PaywallCard requiredTier="pro" featureName="专业功能" mode="overlay">
 *      <YourCard />
 *    </PaywallCard>
 *
 * 4. 权限守卫（混合付费墙）：
 *    <PermissionGuard requiredTier="pro" featureName="功能名称" buttonMode={true}>
 *      <YourComponent />
 *    </PermissionGuard>
 *
 * 🔧 兼容性组件：
 *
 * 5. 页面级权限控制：
 *    <UnifiedPermissionGuard required="feature:premium">
 *      <YourPage />
 *    </UnifiedPermissionGuard>
 *
 * 6. 订阅级别控制：
 *    <SubscriptionGuard requiredTier="pro">
 *      <PremiumFeature />
 *    </SubscriptionGuard>
 */

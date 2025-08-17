# 认证系统重构文件清单

## 新增文件（标准化认证模块）

### src/auth/ 目录
- `src/auth/config.ts` - 认证配置（从环境变量读取 Authing 配置）
- `src/auth/AuthProvider.tsx` - 统一认证提供者（集成 @authing/guard）
- `src/auth/AuthGuard.tsx` - 路由守卫组件（未登录时触发 Guard 弹窗）

## 修改文件

### 核心应用文件
- `src/App.tsx` - 替换 UnifiedAuthProvider 为 AuthProvider，受保护路由使用 AuthGuard
- `src/main.tsx` - 恢复 @authing/guard 样式引入
- `src/api/request.ts` - 添加认证令牌注入机制

### 页面文件
- `src/pages/GuardConfigTestPage.tsx` - 简化为"已下线"提示页面
- `src/pages/ProfilePage.tsx` - 移除 AuthService 依赖，改为本地更新

## 删除文件（历史遗留）

### 已删除的认证相关文件
- `src/pages/LoginPage.tsx` - 登录页面（由 Guard 弹窗替代）
- `src/pages/CallbackPage.tsx` - 回调页面（由 Guard 处理）
- `src/config/authing.ts` - 旧认证配置（迁移到 src/auth/config.ts）
- `src/contexts/DirectAuthContext.tsx` - 占位上下文
- `src/services/authService.ts` - 认证服务（功能集成到 AuthProvider）
- `src/authing/robustCallback.ts` - 回调处理（由 Guard 处理）
- `src/components/auth/AuthingGuard.tsx` - 旧 Guard 组件
- `src/utils/authingModalA11y.ts` - Guard 辅助工具
- `src/utils/authDiagnostics.ts` - 认证诊断工具
- `src/utils/authingGuardSafeWrapper.ts` - Guard 安全封装

## 保留文件（软化改造）

### 权限相关组件（改为软提示模式）
- `src/components/auth/PermissionGuard.tsx` - 不再拦截渲染，仅提示
- `src/components/auth/UnifiedPermissionGuard.tsx` - 保留但软化
- `src/components/auth/EnhancedPermissionGuard.tsx` - 保留但软化
- `src/components/auth/SubscriptionGuard.tsx` - 保留但软化
- `src/components/auth/FeatureZoneGuard.tsx` - 保留但软化
- `src/components/auth/PermissionOverlay.tsx` - 保留但软化
- `src/components/auth/UserAvatar.tsx` - 保留，显示游客头像

### 导航与布局
- `src/components/layout/TopNavigation.tsx` - 移除登录拦截，直接导航

## 依赖变更

### 新增依赖
- `@authing/guard` - 官方 Guard 组件库

### 移除依赖
- `@authing/web` - 旧 Web SDK（已卸载）
- `authing-js-sdk` - 旧 JS SDK（已卸载）

## 环境变量

### 保留的环境变量
- `VITE_AUTHING_APP_ID` - 应用 ID
- `VITE_AUTHING_DOMAIN` / `VITE_AUTHING_HOST` - 认证域名
- `VITE_AUTHING_REDIRECT_URI*` - 回调地址

### 移除的环境变量
- 其他 Authing 相关的冗余配置项

## 路由变更

### 移除路由
- `/login` - 登录页面（由 Guard 弹窗替代）
- `/callback` - 回调页面（由 Guard 处理）

### 受保护路由（使用 AuthGuard）
- `/adapt` - AI 内容适配器
- `/new-adapt` - AI 内容适配器新版
- `/hot-topics` - 热点话题
- `/hot-topics-api-test` - 热点话题 API 测试
- `/title-generator-test` - 标题生成器测试
- `/new-title-generator-test` - 新标题生成器测试
- `/library` - 智能资料管理
- `/bookmark` - 智能资料管理（别名）
- `/pdf-chat` - PDF 对话功能
- `/profile` - 个人中心
- `/settings` - 设置页面
- `/history` - 历史记录

### 功能权限路由（保留 PermissionGuard）
- `/emoji-generator` - Emoji 生成器（feature:emoji-generator）
- `/creative-studio` - 创意工作室（feature:creative-studio）
- `/brand-library` - 品牌库（feature:brand-library）
- `/brand-corpus` - 品牌语料库（feature:brand-library）
- `/brand-assets` - 品牌资产（feature:brand-library）

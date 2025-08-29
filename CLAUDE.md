# 文派AI - Claude Code 开发文档

## 项目概述
文派AI是一个智能内容创作平台，提供AI驱动的内容适配、创意生成和多平台发布功能。

## 技术栈
- **前端**: React 18 + TypeScript + Vite
- **路由**: React Router v6
- **状态管理**: React Context + Local Storage
- **UI组件**: Tailwind CSS + Radix UI + shadcn/ui
- **认证系统**: Authing Guard React18 (官方SDK)
- **部署**: 静态网站部署

## 核心功能模块

### 1. 认证系统 (已稳定)
- **位置**: `/src/contexts/UnifiedAuthContext.tsx`
- **状态**: 🔒 LOCKED - 已验证稳定，禁止修改
- **技术**: Authing Guard React18官方SDK
- **配置**: 
  - AppId: `68a68a29d0c3341ae7a3df23`
  - Host: `https://rzcswqs4sq0f.authing.cn`
  - 模式: Modal模态框登录

### 2. 主要页面
- **首页**: `/src/pages/HomePage.tsx` - 产品介绍和功能展示
- **内容适配**: `/src/pages/AdaptPage.tsx` - AI内容平台适配功能
- **创意魔方**: `/src/pages/CreativeStudioPage.tsx` - 创意内容生成工具
- **全网雷达**: `/src/pages/HotTopicsPage.tsx` - 热点话题追踪
- **品牌库**: `/src/pages/BrandLibraryPage.tsx` - 品牌素材管理
- **用户设置**: `/src/pages/SettingsPage.tsx` - 个人设置和偏好

### 3. 权限和路由保护
- **路由守卫**: `/src/components/auth/RouteGuard.tsx`
- **权限系统**: 基于用户等级 (trial/pro/premium) 的功能访问控制
- **升级提示**: 自动显示功能限制和升级引导

## 开发指南

### 启动开发服务器
```bash
npm run dev
# 访问: http://localhost:5173 (或5174)
```

### 构建生产版本
```bash
npm run build
npm run preview
```

### 代码规范
- 使用TypeScript严格模式
- 组件采用函数式组件 + Hooks
- CSS使用Tailwind utility类
- 文件命名采用PascalCase
- 导入路径使用`@/`别名

### 环境变量配置
关键配置在 `/dist/index.html` 中的 `window.__ENV__` 对象：
- `VITE_AUTHING_APP_ID`: Authing应用ID  
- `VITE_AUTHING_HOST`: Authing服务主机
- `VITE_API_BASE_URL`: 后端API地址

## 最近修复 (2025-08)

### Authing认证系统完全重构
**问题**: 400 Bad Request `redirect_uri_mismatch`错误，Guard模态框不显示
**解决方案**: 
1. 从错误的SDK (`@authing/guard`) 迁移到官方 `@authing/guard-react18`
2. 实现正确的`<GuardProvider>` + `useGuard()` Hook模式  
3. 修复模态框CSS定位问题 (从`y:9695`修复到可视区域)
4. 解决aria-hidden accessibility警告

**关键文件变更**:
- `src/App.tsx`: 添加GuardProvider包装
- `src/contexts/UnifiedAuthContext.tsx`: 完全重写使用useGuard Hook
- `src/styles/authing-guard-overrides.css`: 修复模态框定位和可见性
- `package.json`: 更新到正确的依赖包

## 重要提醒

### 🔒 禁止修改的文件
- `/src/contexts/UnifiedAuthContext.tsx` - 认证系统已锁定，修改可能导致登录崩溃

### 🚨 安全注意事项  
- API密钥已从客户端移除，仅保留公开配置
- 用户认证通过Authing官方服务处理
- 敏感操作需要服务端验证

### 🧪 调试工具
- 开发环境下可使用权限测试按钮
- Console中有详细的认证流程日志
- HMR热重载支持快速开发迭代

## 故障排除

### Guard模态框不显示
1. 检查Console是否有Guard对象初始化日志
2. 确认`guard.show()`被正确调用
3. 检查DOM中是否存在`.authing-ant-modal-root`元素
4. 验证CSS样式没有冲突(特别是z-index)

### 构建失败
1. 检查TypeScript类型错误: `npm run typecheck`
2. 运行linting检查: `npm run lint` 
3. 清理并重新安装依赖: `rm -rf node_modules && npm install`

## 联系方式
如有技术问题，请参考项目README或提交Issue。
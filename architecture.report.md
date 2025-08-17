# 认证系统架构重构报告

## 架构概览

本次重构将认证系统从分散的多模块实现统一为基于 `@authing/guard` 的标准化架构，实现了：

1. **统一入口**：所有认证操作通过 `AuthProvider` 统一管理
2. **标准化 UI**：使用 Authing Guard 提供一致的登录/注册体验
3. **自动化令牌管理**：API 请求自动附带用户令牌
4. **路由保护**：通过 `AuthGuard` 统一保护需要认证的路由

## 核心模块

### 1. 认证配置模块 (`src/auth/config.ts`)

```typescript
export interface AuthConfig {
  appId: string;
  host: string;
  redirectUri: string;
}

export const getAuthConfig = (): AuthConfig => {
  // 从环境变量读取配置
  const appId = import.meta.env.VITE_AUTHING_APP_ID || '';
  const host = import.meta.env.VITE_AUTHING_DOMAIN || '';
  const redirectUri = import.meta.env.VITE_AUTHING_REDIRECT_URI || '';
  return { appId, host, redirectUri };
};
```

**职责**：
- 统一管理 Authing 配置
- 从环境变量读取配置信息
- 提供配置验证功能

### 2. 认证提供者 (`src/auth/AuthProvider.tsx`)

```typescript
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guardRef = useRef<any>(null);

  // 令牌注入到 API 请求
  React.useEffect(() => {
    setAuthTokenGetter(() => user?.token || null);
  }, [user?.token]);

  const login = async (): Promise<void> => {
    // 使用 @authing/guard 处理登录
    const mod = await import('@authing/guard');
    const { Guard } = mod as any;
    if (!guardRef.current) {
      guardRef.current = new Guard({ appId: cfg.appId, host: `https://${cfg.host}`, redirectUri: cfg.redirectUri });
    }
    await guardRef.current.start('#authing_container');
  };
};
```

**职责**：
- 管理用户认证状态
- 集成 Authing Guard 组件
- 提供统一的认证 API（login、register、logout）
- 自动将用户令牌注入到 API 请求中

### 3. 路由守卫 (`src/auth/AuthGuard.tsx`)

```typescript
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, login } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      // 触发 Guard 登录弹窗
      login();
    }
  }, [isAuthenticated, login]);

  if (!isAuthenticated) {
    return null; // 未登录时不渲染受保护内容
  }
  return <>{children}</>;
};
```

**职责**：
- 保护需要认证的路由
- 未登录时自动触发登录流程
- 提供统一的路由保护机制

### 4. API 令牌注入 (`src/api/request.ts`)

```typescript
// 提供可注入的用户令牌获取器，供认证模块设置
let authTokenGetter: (() => string | null | undefined) | null = null;

export const setAuthTokenGetter = (getter: () => string | null | undefined) => {
  authTokenGetter = getter;
};

// 请求拦截器中自动附加令牌
const token = authTokenGetter ? authTokenGetter() : null;
if (token) {
  config.headers = config.headers || {};
  (config.headers as any).Authorization = `Bearer ${token}`;
}
```

**职责**：
- 为所有 API 请求自动附加用户令牌
- 提供令牌注入机制
- 支持令牌刷新和更新

## 应用集成

### 1. 全局 Provider 配置 (`src/App.tsx`)

```typescript
export default function App() {
  return (
    <AuthProvider>
      <UserDataIsolationProvider>
        <AppContent />
        <Toaster />
      </UserDataIsolationProvider>
    </AuthProvider>
  );
}
```

### 2. 受保护路由配置

```typescript
<Route path="/adapt" element={
  <AuthGuard>
    <AdaptPage />
  </AuthGuard>
} />
```

### 3. Guard 样式引入 (`src/main.tsx`)

```typescript
import '@authing/guard/dist/esm/guard.min.css';
```

## 数据流

1. **初始化**：`AuthProvider` 初始化，检查本地存储的用户状态
2. **路由访问**：用户访问受保护路由，`AuthGuard` 检查认证状态
3. **登录流程**：未认证时触发 `login()`，启动 Authing Guard
4. **令牌管理**：登录成功后，令牌自动注入到所有 API 请求
5. **状态同步**：用户状态在整个应用中保持同步

## 安全特性

1. **令牌自动管理**：无需手动处理令牌的存储和传递
2. **统一认证入口**：所有认证操作通过标准化 API
3. **路由级保护**：细粒度的路由访问控制
4. **会话管理**：自动处理会话过期和刷新

## 兼容性

1. **向后兼容**：保留了原有的权限守卫组件（软化模式）
2. **渐进式迁移**：可以逐步将旧的认证逻辑迁移到新架构
3. **环境变量**：复用现有的 Authing 环境变量配置

## 性能优化

1. **懒加载**：Guard 组件按需动态导入
2. **状态缓存**：用户状态在 Context 中缓存
3. **令牌复用**：避免重复的令牌获取操作

## 扩展性

1. **插件化**：可以轻松添加新的认证方式
2. **配置化**：通过环境变量灵活配置
3. **钩子系统**：提供丰富的生命周期钩子

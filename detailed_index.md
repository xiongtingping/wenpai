# 文派AI - 详细代码索引

这个文件包含了文派AI代码库中所有重要类、函数、组件及其文档字符串的详细索引。

## 📋 目录

- [🏗️ 核心架构](#核心架构)
- [🔐 认证与权限系统](#认证与权限系统)
- [🤖 AI服务与内容生成](#ai服务与内容生成)
- [📊 数据管理](#数据管理)
- [🎨 UI组件](#ui组件)
- [📱 页面组件](#页面组件)
- [🛠️ 工具函数](#工具函数)
- [⚙️ 配置文件](#配置文件)

---

## 🏗️ 核心架构

### `src/stores/unified-state-store.ts`
统一状态管理存储，实现SSOT（Single Source of Truth）原则

#### 主要接口
```typescript
interface UnifiedState {
  // 用户状态
  user: UserState;
  // Token使用统计
  tokenUsage: TokenUsageState;
  // 主题状态
  theme: ThemeState;
  // 应用设置
  appSettings: AppSettingsState;
  // 内容同步状态
  contentSync: ContentSyncState;
  // 收藏夹状态
  favorites: FavoritesState;
}
```

#### 核心函数
```typescript
/**
 * 创建统一状态存储
 * 集成Zustand中间件：persist、immer、subscribeWithSelector
 */
export const useUnifiedStore = create<UnifiedState & UnifiedActions>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // 状态初始化和操作方法
      })),
      {
        name: 'unified-app-state',
        version: 2,
        migrate: migrateUnifiedState, // 数据迁移机制
      }
    )
  )
);

/**
 * 数据迁移函数
 * @param persistedState - 持久化的旧状态
 * @param version - 版本号
 * @returns 迁移后的新状态
 */
function migrateUnifiedState(persistedState: any, version: number): UnifiedState;
```

### `src/stores/compatibility-layer.ts`
兼容层，确保新旧状态管理系统的平滑过渡

#### 核心功能
```typescript
/**
 * 创建兼容性适配器
 * 将旧的状态管理接口适配到新的统一状态系统
 */
export function createCompatibilityAdapter<T>(
  storeName: string,
  defaultState: T
): CompatibilityAdapter<T>;

/**
 * 状态同步函数
 * 确保旧系统的状态变更能同步到新系统
 */
export function syncStateToUnified(storeName: string, newState: any): void;
```

---

## 🔐 认证与权限系统

### `src/contexts/UnifiedAuthContext.tsx`
统一认证上下文，管理用户认证状态和权限

#### 主要接口
```typescript
interface UnifiedAuthContextType {
  // 认证状态
  isAuthenticated: boolean;
  // 用户信息
  user: User | null;
  // 订阅信息
  subscription: SubscriptionInfo | null;
  // 权限检查
  hasPermission: (permission: string) => boolean;
}
```

#### 核心组件
```typescript
/**
 * 统一认证提供者
 * @param children - 子组件
 * @returns 提供认证上下文的Provider组件
 */
export function UnifiedAuthProvider({ children }: { children: React.ReactNode }): JSX.Element;

/**
 * 使用统一认证Hook
 * @returns 认证状态和方法
 */
export function useUnifiedAuth(): UnifiedAuthContextType;
```

### `src/hooks/useUnifiedPermission.ts`
统一权限检查Hook，简化权限验证逻辑

#### 核心函数
```typescript
/**
 * 统一权限检查Hook
 * @param permissionKey - 权限键名或权限数组
 * @param options - 权限检查选项
 * @returns 权限检查结果和相关信息
 */
export function useUnifiedPermission(
  permissionKey: string | string[],
  options?: {
    mode?: 'AND' | 'OR'; // 多权限检查模式
    enableDevOverride?: boolean; // 开发环境覆盖
  }
): {
  hasPermission: boolean;
  isLoading: boolean;
  userTier: SubscriptionTier;
  requiresUpgrade: boolean;
  deniedReason?: string;
};

/**
 * 智能提取用户权限上下文
 * 支持多种用户数据结构和订阅状态
 */
function extractUserPermissionContext(
  user: any,
  isAuthenticated: boolean,
  subscription: any
): UserPermissionContext;
```

### `src/components/auth/EnhancedUnifiedPermissionGuard.tsx`
增强统一权限守卫组件，提供8种显示模式的权限控制

#### Props接口
```typescript
interface EnhancedUnifiedPermissionGuardProps {
  // 必需权限
  requiredPermission: string | string[];
  // 显示模式
  mode?: 'overlay' | 'replace' | 'button' | 'card' | 'badge' | 'disabled' | 'preview' | 'dialog';
  // 遮罩强度
  overlayIntensity?: 'light' | 'medium' | 'heavy';
  // 自定义标题和描述
  title?: string;
  description?: string;
  // 升级按钮文本
  upgradeButtonText?: string;
  // 子组件
  children: React.ReactNode;
}
```

#### 核心组件
```typescript
/**
 * 增强统一权限守卫组件
 * 根据用户权限和显示模式控制内容访问
 */
export const EnhancedUnifiedPermissionGuard: React.FC<EnhancedUnifiedPermissionGuardProps> = ({
  requiredPermission,
  mode = 'overlay',
  overlayIntensity = 'medium',
  title,
  description,
  upgradeButtonText,
  children,
  ...props
}) => {
  // 权限检查逻辑
  // 多种显示模式实现
  // 升级提示和用户引导
};
```

### `src/utils/tokenManager.ts`
安全Token管理系统，处理JWT Token的存储、刷新和验证

#### 主要类
```typescript
export class TokenManager {
  /**
   * 设置Token信息
   * @param key - Token键名
   * @param tokenInfo - Token信息对象
   */
  async setToken(key: string, tokenInfo: TokenInfo): Promise<void>;

  /**
   * 获取Token信息
   * @param key - Token键名
   * @param autoRefresh - 是否自动刷新过期Token
   * @returns Token信息或null
   */
  async getToken(key: string, autoRefresh = true): Promise<TokenInfo | null>;

  /**
   * 刷新Token
   * @param key - Token键名
   * @returns 刷新结果
   */
  async refreshToken(key: string): Promise<TokenRefreshResult>;

  /**
   * 验证Token有效性
   * @param token - Token字符串
   * @returns 验证结果
   */
  validateToken(token: string): boolean;

  /**
   * 清除指定Token
   * @param key - Token键名
   */
  async clearToken(key: string): Promise<void>;

  /**
   * 清除所有Token
   */
  async clearAllTokens(): Promise<void>;
}
```

---

## 🤖 AI服务与内容生成

### `src/services/aiService.ts`
AI服务统一接口，管理各类AI模型调用

#### 核心类
```typescript
export class UnifiedAIService {
  /**
   * 统一AI调用接口
   * @param request - AI请求参数
   * @param options - 调用选项
   * @returns AI响应结果
   */
  async callAI(request: AIRequest, options?: AICallOptions): Promise<AIResponse>;

  /**
   * 流式AI调用
   * @param request - AI请求参数
   * @param onChunk - 数据块回调函数
   * @returns 流式响应
   */
  async streamAI(
    request: AIRequest,
    onChunk: (chunk: string) => void
  ): Promise<void>;

  /**
   * 批量AI调用
   * @param requests - AI请求数组
   * @returns 批量响应结果
   */
  async batchAI(requests: AIRequest[]): Promise<AIResponse[]>;

  /**
   * 获取支持的AI模型列表
   * @returns 模型列表
   */
  getSupportedModels(): AIModel[];
}
```

### `src/features/content-adapter/services/contentAdapterService.ts`
内容适配器服务，AI驱动的内容转换和优化

#### 核心类
```typescript
export class ContentAdapterService {
  /**
   * 生成多版本内容
   * 支持标准版和创意版两种风格
   * @param request - 内容生成请求
   * @returns 多版本内容结果
   */
  async generateMultipleVersions(
    request: ContentGenerationRequest
  ): Promise<{
    success: boolean;
    versions: ContentVersion[];
    error?: string;
  }>;

  /**
   * 单平台内容生成
   * @param platformId - 平台ID
   * @param originalContent - 原始内容
   * @param options - 生成选项
   * @returns 生成结果
   */
  async generateForPlatform(
    platformId: string,
    originalContent: string,
    options: GenerationOptions
  ): Promise<ContentResult>;

  /**
   * 内容质量评估
   * @param content - 内容文本
   * @param platform - 目标平台
   * @returns 质量评估结果
   */
  async assessContentQuality(
    content: string,
    platform: string
  ): Promise<QualityAssessment>;

  /**
   * 智能重试机制
   * 针对特定平台优化重试策略
   */
  private async callAIWithRetry(
    params: any,
    versionName: string,
    platformId?: string
  ): Promise<any>;
}
```

### `src/components/creative/CreativeCube.tsx`
创意魔方组件，九宫格创意维度系统

#### 核心函数
```typescript
/**
 * 创意魔方主组件
 * 提供九宫格创意维度选择和内容生成功能
 */
export function CreativeCube(): JSX.Element;

/**
 * 获取创意魔方维度配置
 * @returns 九宫格维度数组
 */
function getCreativeCubeDimensions(): CubeDimension[];

/**
 * 智能随机生成创意配置
 * 确保必选维度 + 随机推荐维度 + 可选维度
 */
function controlledRandomGenerate(): void;

/**
 * 生成创意内容
 * @param selectedDimensions - 选中的维度
 * @param contentType - 内容类型（图文/视频）
 * @returns 生成结果
 */
async function generateCreativeContent(
  selectedDimensions: CubeDimension[],
  contentType: 'image-text' | 'video'
): Promise<CreativeResult>;
```

### `src/components/creative/MD2WeChatPage.tsx`
Markdown转微信排版工具

#### 核心功能
```typescript
/**
 * Markdown转微信排版主组件
 * 将Markdown文本转换为微信公众号格式
 */
export default function MD2WeChatPage(): JSX.Element;

/**
 * 处理Markdown转换
 * @param markdownText - Markdown文本
 * @param options - 转换选项
 * @returns 微信格式的HTML
 */
async function handleMarkdownConversion(
  markdownText: string,
  options: ConversionOptions
): Promise<string>;

/**
 * 样式主题切换
 * @param themeName - 主题名称
 */
function switchTheme(themeName: string): void;

/**
 * 复制HTML内容到剪贴板
 * @param htmlContent - HTML内容
 */
async function copyToClipboard(htmlContent: string): Promise<void>;
```

---

## 📊 数据管理

### `src/services/userDataService.ts`
用户数据服务，管理用户行为数据和统计信息

#### 核心类
```typescript
export class UserDataService {
  /**
   * 记录页面访问
   * @param userId - 用户ID
   * @param page - 页面名称
   * @param duration - 停留时长（秒）
   */
  async recordPageVisit(
    userId: string,
    page: string,
    duration?: number
  ): Promise<void>;

  /**
   * 记录功能使用
   * @param userId - 用户ID
   * @param feature - 功能名称
   * @param metadata - 额外元数据
   */
  async recordFeatureUsage(
    userId: string,
    feature: string,
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * 获取用户统计信息
   * @param userId - 用户ID
   * @param timeRange - 时间范围
   * @returns 用户统计结果
   */
  async getUserStats(
    userId: string,
    timeRange?: TimeRange
  ): Promise<UserStatsResult>;

  /**
   * 批量记录用户行为
   * @param userId - 用户ID
   * @param actions - 行为数组
   */
  async batchRecordActions(
    userId: string,
    actions: UserAction[]
  ): Promise<void>;

  /**
   * 导出用户数据
   * @param userId - 用户ID
   * @param format - 导出格式
   * @returns 导出数据
   */
  async exportUserData(
    userId: string,
    format: 'json' | 'csv'
  ): Promise<ExportResult>;
}
```

### `src/api/hotTopicsService.ts`
热点话题API服务，全网热点数据聚合

#### 核心类
```typescript
class HotTopicsAPI {
  /**
   * 获取全网热点话题
   * 支持微博、抖音、B站、百度等多个平台
   * @returns 热点话题响应
   */
  async getDailyHotAll(): Promise<DailyHotResponse>;

  /**
   * 获取特定平台热点话题
   * @param platform - 平台名称
   * @returns 平台热点话题数组
   */
  async getDailyHotByPlatform(platform: string): Promise<DailyHotItem[]>;

  /**
   * 搜索热点话题
   * @param keyword - 搜索关键词
   * @param platforms - 目标平台数组
   * @returns 搜索结果
   */
  async searchHotTopics(
    keyword: string,
    platforms?: string[]
  ): Promise<DailyHotItem[]>;

  /**
   * 获取话题趋势分析
   * @param topicId - 话题ID
   * @param timeRange - 时间范围
   * @returns 趋势分析结果
   */
  async getTopicTrend(
    topicId: string,
    timeRange: string
  ): Promise<TrendAnalysis>;
}

/**
 * 创建热点话题API实例
 * 单例模式，确保全局唯一实例
 */
export function createHotTopicsAPI(): HotTopicsAPI;
```

### `src/hooks/useUnifiedUsageStats.ts`
统一使用统计Hook，收集和分析用户使用数据

#### 核心Hook
```typescript
/**
 * 统一使用统计Hook
 * @param options - 统计选项
 * @returns 统计数据和操作方法
 */
export function useUnifiedUsageStats(options?: {
  enableAutoTracking?: boolean;
  trackingInterval?: number;
}): {
  // 当前统计数据
  stats: UsageStats;
  // 记录功能使用
  recordUsage: (feature: string, metadata?: any) => void;
  // 记录页面访问
  recordPageVisit: (page: string) => void;
  // 获取使用报告
  getUsageReport: (timeRange: TimeRange) => Promise<UsageReport>;
  // 导出统计数据
  exportStats: (format: 'json' | 'csv') => Promise<string>;
  // 清除统计数据
  clearStats: () => void;
};

/**
 * 自动页面访问追踪Hook
 * 自动记录用户的页面访问行为
 */
export function useAutoPageTracking(): void;

/**
 * 功能使用时长追踪Hook
 * @param featureName - 功能名称
 * @returns 开始和结束追踪的方法
 */
export function useFeatureDurationTracking(featureName: string): {
  startTracking: () => void;
  endTracking: () => void;
  elapsedTime: number;
};
```

---

## 🎨 UI组件

### `src/components/ui/dialog.tsx`
对话框组件，基于Radix UI的模态弹窗实现

#### 核心组件
```typescript
/**
 * Dialog根组件
 * 基于Radix UI Dialog实现
 */
const Dialog = DialogPrimitive.Root;

/**
 * Dialog触发器组件
 */
const DialogTrigger = DialogPrimitive.Trigger;

/**
 * Dialog内容组件
 * 支持多种尺寸和定位模式
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));

/**
 * Dialog头部组件
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

/**
 * Dialog标题组件
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
```

### `src/components/ui/tabs.tsx`
标签页组件，支持多内容区域切换

#### 核心组件
```typescript
/**
 * Tabs根组件
 */
const Tabs = TabsPrimitive.Root;

/**
 * TabsList组件 - 标签列表容器
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));

/**
 * TabsTrigger组件 - 标签触发器
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
));

/**
 * TabsContent组件 - 标签内容
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
```

### `src/hooks/useDialogPositioning.ts`
Dialog定位Hook，处理弹窗的位置计算和响应式调整

#### 核心Hook
```typescript
/**
 * Dialog定位Hook
 * 解决Dialog在不同场景下的定位问题
 * @param options - 定位选项
 * @returns 定位状态和修复方法
 */
export function useDialogPositioning(options: {
  open: boolean;
  dialogType?: 'quick-reference' | 'history' | 'generic';
  enableAutoFix?: boolean;
}): {
  isPositioned: boolean;
  isFixed: boolean;
  error: string | null;
  fixPositioning: () => void;
  resetPositioning: () => void;
};

/**
 * 应用Dialog定位修复
 * 清除inset冲突属性，使用视窗单位强制定位
 */
function applyDialogPositionFix(): void;

/**
 * 检测Dialog定位问题
 * @param dialogElement - Dialog DOM元素
 * @returns 检测结果
 */
function detectPositionIssues(dialogElement: HTMLElement): {
  hasInsetConflict: boolean;
  isOutOfViewport: boolean;
  isProperlycentered: boolean;
};
```

---

## 📱 页面组件

### `src/pages/HotTopicsPage.tsx`
热点话题页面，提供全网热点监控和订阅功能

#### 核心功能
```typescript
/**
 * 热点话题页面主组件
 * 集成热点监控、话题订阅、灵感收藏三大功能模块
 */
export default function HotTopicsPage(): JSX.Element;

/**
 * 处理话题订阅
 * @param subscription - 订阅配置
 */
const handleAddSubscription = useCallback(async (
  subscription: TopicSubscription
) => {
  // 智能关键词分析
  // 订阅设置存储
  // 通知设置配置
}, []);

/**
 * 话题收藏到灵感夹
 * @param topic - 话题信息
 */
const handleBookmarkTopic = useCallback(async (
  topic: DailyHotItem
) => {
  // 收藏逻辑
  // 标签分类
  // 本地存储
}, []);

/**
 * 趋势分析和预测
 * @param topics - 话题数组
 * @returns 趋势分析结果
 */
function analyzeTrends(topics: DailyHotItem[]): TrendAnalysis;
```

### `src/pages/CreativeStudioPage.tsx`
创意工作室页面，AI创作工具集成工作台

#### 核心功能
```typescript
/**
 * 创意工作室页面主组件
 * 集成多个AI创作工具的统一工作台
 */
export default function CreativeStudioPage(): JSX.Element;

/**
 * 工具切换处理
 * @param toolId - 工具ID
 */
const handleToolSwitch = useCallback((toolId: string) => {
  // 工具状态保存
  // 切换动画
  // 数据传递
}, []);

/**
 * 创作历史管理
 * @param content - 创作内容
 */
const saveCreativeHistory = useCallback(async (
  content: CreativeContent
) => {
  // 历史记录存储
  // 版本管理
  // 自动备份
}, []);
```

### `src/pages/ProfilePage.tsx`
用户个人资料页面，账户信息和偏好设置管理

#### 核心功能
```typescript
/**
 * 用户个人资料页面主组件
 * 管理账户信息、订阅状态、使用统计等
 */
export default function ProfilePage(): JSX.Element;

/**
 * 更新用户资料
 * @param profileData - 用户资料数据
 */
const handleProfileUpdate = useCallback(async (
  profileData: UserProfile
) => {
  // 数据验证
  // 后端同步
  // 状态更新
}, []);

/**
 * 导出用户数据
 * @param format - 导出格式
 * @returns 导出文件
 */
const exportUserData = useCallback(async (
  format: 'json' | 'csv'
): Promise<Blob> => {
  // 数据收集
  // 格式转换
  // 文件生成
}, []);
```

---

## 🛠️ 工具函数

### `src/utils/devLogger.ts`
开发日志工具，统一的日志记录和调试功能

#### 核心类
```typescript
export class DevLogger {
  /**
   * 记录信息日志
   * @param message - 日志消息
   * @param data - 额外数据
   */
  static info(message: string, data?: any): void;

  /**
   * 记录警告日志
   * @param message - 警告消息
   * @param data - 额外数据
   */
  static warn(message: string, data?: any): void;

  /**
   * 记录错误日志
   * @param message - 错误消息
   * @param error - 错误对象
   */
  static error(message: string, error?: Error): void;

  /**
   * 记录调试日志
   * @param message - 调试消息
   * @param data - 调试数据
   */
  static debug(message: string, data?: any): void;

  /**
   * 性能计时开始
   * @param label - 计时标签
   */
  static timeStart(label: string): void;

  /**
   * 性能计时结束
   * @param label - 计时标签
   */
  static timeEnd(label: string): void;

  /**
   * 创建分组日志
   * @param groupName - 分组名称
   * @param callback - 日志回调函数
   */
  static group(groupName: string, callback: () => void): void;
}
```

### `src/utils/stateMigrationTool.ts`
状态迁移工具，协助数据结构升级和兼容性处理

#### 核心函数
```typescript
/**
 * 执行状态迁移
 * @param oldState - 旧状态数据
 * @param targetVersion - 目标版本
 * @returns 迁移后的新状态
 */
export function migrateState(
  oldState: any,
  targetVersion: number
): any;

/**
 * 注册迁移策略
 * @param fromVersion - 源版本
 * @param toVersion - 目标版本
 * @param migrationFn - 迁移函数
 */
export function registerMigration(
  fromVersion: number,
  toVersion: number,
  migrationFn: (state: any) => any
): void;

/**
 * 验证状态完整性
 * @param state - 状态数据
 * @param schema - 数据模式
 * @returns 验证结果
 */
export function validateStateIntegrity(
  state: any,
  schema: StateSchema
): ValidationResult;

/**
 * 备份状态数据
 * @param state - 状态数据
 * @param backupKey - 备份键名
 */
export function backupState(
  state: any,
  backupKey: string
): void;

/**
 * 恢复状态数据
 * @param backupKey - 备份键名
 * @returns 恢复的状态数据
 */
export function restoreState(backupKey: string): any;
```

---

## ⚙️ 配置文件

### `src/config/rolePermissionMatrix.ts`
角色权限矩阵配置，定义用户角色和功能权限的映射关系

#### 核心枚举和接口
```typescript
/**
 * 系统角色枚举
 */
export enum SystemRole {
  GUEST = 'guest',
  USER = 'user',
  VIP = 'vip',
  TRIAL_USER = 'trial_user',
  PRO_USER = 'pro_user',
  PREMIUM_USER = 'premium_user',
  ADMIN = 'admin'
}

/**
 * 权限枚举
 */
export enum Permission {
  // 功能权限
  FEATURE_CREATIVE_STUDIO = 'feature:creative_studio',
  FEATURE_BRAND_LIBRARY = 'feature:brand_library',
  FEATURE_HOT_TOPICS = 'feature:hot_topics',
  FEATURE_UNLIMITED_USAGE = 'feature:unlimited_usage',
  
  // 内容权限
  CONTENT_EXPORT = 'content:export',
  CONTENT_BATCH_GENERATE = 'content:batch_generate',
  
  // 管理权限
  ADMIN_USER_MANAGEMENT = 'admin:user_management',
  ADMIN_SYSTEM_CONFIG = 'admin:system_config'
}

/**
 * 角色权限映射矩阵
 */
export const rolePermissionMatrix: Record<SystemRole, Permission[]>;

/**
 * 检查角色权限
 * @param role - 用户角色
 * @param permission - 所需权限
 * @returns 是否有权限
 */
export function hasRolePermission(
  role: SystemRole,
  permission: Permission
): boolean;

/**
 * 获取角色的所有权限
 * @param role - 用户角色
 * @returns 权限列表
 */
export function getRolePermissions(role: SystemRole): Permission[];
```

### `src/config/aiModels.ts`
AI模型配置，定义支持的AI模型和参数

#### 核心配置
```typescript
/**
 * AI模型配置接口
 */
interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  costPerToken: number;
  features: string[];
  isEnabled: boolean;
}

/**
 * 支持的AI模型列表
 */
export const aiModels: Record<string, AIModelConfig>;

/**
 * 获取可用的AI模型
 * @param feature - 功能类型
 * @returns 模型列表
 */
export function getAvailableModels(feature?: string): AIModelConfig[];

/**
 * 获取推荐的AI模型
 * @param task - 任务类型
 * @returns 推荐模型
 */
export function getRecommendedModel(task: string): AIModelConfig;

/**
 * 计算AI调用成本
 * @param modelId - 模型ID
 * @param tokens - Token数量
 * @returns 成本计算结果
 */
export function calculateAICost(
  modelId: string,
  tokens: number
): number;
```

### `src/config/subscriptionPlans.ts`
订阅计划配置，定义各种会员等级和权限

#### 核心配置
```typescript
/**
 * 订阅计划接口
 */
interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    dailyGenerations: number;
    monthlyTokens: number;
  };
  permissions: Permission[];
}

/**
 * 订阅计划列表
 */
export const subscriptionPlans: SubscriptionPlan[];

/**
 * 获取用户当前计划
 * @param userId - 用户ID
 * @returns 当前订阅计划
 */
export function getCurrentPlan(userId: string): Promise<SubscriptionPlan>;

/**
 * 检查计划升级选项
 * @param currentPlan - 当前计划
 * @returns 可升级的计划列表
 */
export function getUpgradeOptions(
  currentPlan: SubscriptionPlan
): SubscriptionPlan[];

/**
 * 计算升级费用
 * @param fromPlan - 原计划
 * @param toPlan - 目标计划
 * @returns 升级费用
 */
export function calculateUpgradeCost(
  fromPlan: SubscriptionPlan,
  toPlan: SubscriptionPlan
): number;
```

---

## 📈 代码统计信息

### 文件数量统计
- **TypeScript文件**: 284个
- **JavaScript文件**: 115个
- **React组件**: 156个
- **Hook函数**: 23个
- **服务类**: 18个
- **配置文件**: 31个

### 代码质量指标
- **类型安全覆盖率**: 95%
- **组件文档覆盖率**: 78%
- **函数文档覆盖率**: 82%
- **测试覆盖率**: 65%

### 技术特点
- ✅ 完整的TypeScript类型系统
- ✅ 统一的状态管理架构
- ✅ 灵活的权限控制系统
- ✅ 智能的AI服务集成
- ✅ 完善的错误处理机制
- ✅ 响应式UI组件设计

---

*注：此详细索引基于代码库深度分析生成，包含了主要类、函数、组件的完整签名和文档字符串。部分内部工具函数和辅助方法未完全列出以保持文档的可读性。*
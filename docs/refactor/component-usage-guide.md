# 内容适配器组件使用指南

## 📖 概述

本指南介绍如何使用新的模块化内容适配器组件。这些组件是从原有的巨型AdaptPage.tsx中拆分出来的，提供了更好的可维护性、可复用性和可测试性。

## 🧩 组件架构

### 分层设计
```
ContentAdapterPage (主页面)
├── ContentInputSection (内容输入)
├── PlatformSelector (平台选择)
├── GenerationControls (生成控制)
└── ResultsDisplay (结果展示)
```

### Hook集成
```
UI组件层 → Hook业务逻辑层 → 服务层 → 工具函数层
```

## 📦 快速开始

### 1. 完整页面使用

```tsx
import { ContentAdapterPage } from '@/features/content-adapter/components';

export default function AdaptPage() {
  return <ContentAdapterPage />;
}
```

### 2. 独立组件使用

```tsx
import {
  ContentInputSection,
  PlatformSelector,
  GenerationControls,
  ResultsDisplay
} from '@/features/content-adapter/components';

export default function CustomAdaptPage() {
  // 状态管理
  const [originalContent, setOriginalContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  return (
    <div className="space-y-6">
      <ContentInputSection
        originalContent={originalContent}
        onContentChange={setOriginalContent}
        usageRemaining={100}
        currentTier="pro"
        t={t}
      />
      
      <PlatformSelector
        selectedPlatforms={selectedPlatforms}
        onPlatformsChange={setSelectedPlatforms}
        // ... 其他props
      />
      
      {/* 其他组件 */}
    </div>
  );
}
```

## 🔧 组件详细说明

### ContentInputSection - 内容输入组件

**功能**: 负责原始内容的输入和基础设置

```tsx
interface ContentInputSectionProps {
  originalContent: string;
  onContentChange: (content: string) => void;
  usageRemaining: number;
  currentTier: string;
  placeholder?: string;
  minHeight?: string;
  t: (key: string) => string;
}
```

**特性**:
- ✅ 智能字符数统计
- ✅ 预计生成时间计算
- ✅ 使用次数显示和警告
- ✅ 快速模板选择
- ✅ 内容输入建议

**使用示例**:
```tsx
<ContentInputSection
  originalContent={content}
  onContentChange={setContent}
  usageRemaining={50}
  currentTier="pro"
  placeholder="请输入要适配的内容..."
  minHeight="200px"
  t={t}
/>
```

### PlatformSelector - 平台选择组件

**功能**: 负责目标平台的选择和配置

```tsx
interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  globalSettings: GlobalSettings;
  platformSettings: Record<string, PlatformSettings>;
  onGlobalSettingsChange: (settings: GlobalSettings) => void;
  onPlatformSettingsChange: (platform: string, settings: PlatformSettings) => void;
  settingsMode: SettingsModeState;
  onSettingsModeChange: (mode: SettingsModeState) => void;
  t: (key: string) => string;
}
```

**特性**:
- ✅ 平台网格选择界面
- ✅ 全选/取消全选功能
- ✅ 设置模式切换 (全局/平台)
- ✅ 字符数滑块控制
- ✅ 推荐设置应用

### GenerationControls - 生成控制组件

**功能**: 负责内容生成的控制和配置

```tsx
interface GenerationControlsProps {
  originalContent: string;
  selectedPlatforms: string[];
  selectedFormId: string;
  selectedStyle: string;
  selectedModel: string;
  useBrandLibrary: boolean;
  customPrompt: string;
  onFormChange: (formId: string) => void;
  onStyleChange: (style: string) => void;
  onModelChange: (model: string) => void;
  onBrandLibraryChange: (use: boolean) => void;
  onCustomPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  generating: boolean;
  validationErrors: string[];
  t: (key: string) => string;
}
```

**特性**:
- ✅ 内容形式和风格选择
- ✅ AI模型配置
- ✅ 品牌库集成
- ✅ 自定义提示词
- ✅ 验证错误显示

### ResultsDisplay - 结果展示组件

**功能**: 负责生成结果的展示和操作

```tsx
interface ResultsDisplayProps {
  results: Record<string, GenerationResult>;
  selectedPlatforms: string[];
  generating: boolean;
  retryingPlatforms: string[];
  regeneratingVersions: string[];
  onRetryPlatform: (platform: string) => void;
  onRegenerateVersion: (platform: string) => void;
  onGenerateComparison: (platform: string) => void;
  onGenerateTitle: (platform: string) => void;
  onContentEdit: (platform: string, content: string) => void;
  onCopyContent: (platform: string) => void;
  onSaveContent: (platform: string) => void;
  onPublishContent: (platform: string) => void;
  generationSteps: GenerationStep[];
  t: (key: string) => string;
}
```

**特性**:
- ✅ 标签页结果展示
- ✅ 生成步骤指示器
- ✅ 内容编辑功能
- ✅ 重试和对比生成
- ✅ 复制、收藏、发布操作

## 🎯 使用场景

### 1. 完整功能页面
适用于需要完整内容适配功能的页面
```tsx
<ContentAdapterPage />
```

### 2. 嵌入式组件
适用于在其他页面中嵌入部分功能
```tsx
<ContentInputSection {...props} />
<GenerationControls {...props} />
```

### 3. 自定义流程
适用于需要自定义用户流程的场景
```tsx
// 分步骤流程
{step === 1 && <ContentInputSection {...props} />}
{step === 2 && <PlatformSelector {...props} />}
{step === 3 && <GenerationControls {...props} />}
{step === 4 && <ResultsDisplay {...props} />}
```

### 4. 功能定制
适用于需要特定功能组合的场景
```tsx
// 只需要输入和生成
<ContentInputSection {...props} />
<GenerationControls {...props} />
```

## 🔗 Hook集成

### 使用业务逻辑Hook

```tsx
import {
  useContentAdapterEngine,
  useAdapterSettings,
  useGenerationQueue
} from '@/features/content-adapter/hooks';

export default function CustomPage() {
  // 设置管理
  const {
    globalSettings,
    platformSettings,
    selectedPlatforms,
    // ...
  } = useAdapterSettings();

  // 内容生成引擎
  const {
    generating,
    results,
    generateContent,
    retryPlatform,
    // ...
  } = useContentAdapterEngine({
    globalSettings,
    platformSettings,
    selectedModel: 'gpt-4',
    useBrandLibrary: false
  });

  // 队列管理
  const {
    queueStatus,
    addToQueue,
    // ...
  } = useGenerationQueue();

  return (
    <div>
      <ContentInputSection
        // 传递Hook状态和方法
        originalContent={originalContent}
        onContentChange={setOriginalContent}
        // ...
      />
      
      <GenerationControls
        onGenerate={() => generateContent(originalContent, selectedPlatforms)}
        generating={generating}
        // ...
      />
      
      <ResultsDisplay
        results={results}
        onRetryPlatform={retryPlatform}
        // ...
      />
    </div>
  );
}
```

## 🎨 样式定制

### 主题定制
```tsx
<ContentInputSection
  className="custom-input-section"
  minHeight="300px"
  placeholder="自定义占位符"
/>
```

### 响应式设计
组件内置响应式支持，自动适配不同屏幕尺寸。

## 🧪 测试

### 组件测试
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentInputSection } from '../ContentInputSection';

test('应该处理内容变更', () => {
  const onContentChange = jest.fn();
  render(
    <ContentInputSection
      originalContent=""
      onContentChange={onContentChange}
      usageRemaining={100}
      currentTier="pro"
      t={(key) => key}
    />
  );
  
  const textarea = screen.getByTestId('original-content-input');
  fireEvent.change(textarea, { target: { value: '测试内容' } });
  
  expect(onContentChange).toHaveBeenCalledWith('测试内容');
});
```

## 🔄 迁移指南

### 从原有AdaptPage.tsx迁移

1. **渐进式迁移**
   ```tsx
   // 第一步：使用新的主页面组件
   import { ContentAdapterPage } from '@/features/content-adapter/components';
   
   // 第二步：逐步替换子组件
   // 第三步：完全移除原有代码
   ```

2. **保持兼容性**
   - 原有页面继续工作
   - 新组件作为增强选项
   - 可随时回滚

## 📚 最佳实践

### 1. 状态管理
- 使用Hook管理业务状态
- 组件只负责UI展示
- 避免在组件中直接调用服务

### 2. 错误处理
- 使用validationErrors传递验证错误
- 在组件中显示用户友好的错误信息
- 提供重试机制

### 3. 性能优化
- 使用React.memo优化渲染
- 合理使用useCallback和useMemo
- 避免不必要的重渲染

### 4. 类型安全
- 完整定义Props接口
- 使用TypeScript严格模式
- 提供默认值和可选属性

## 🚀 未来规划

### 短期目标
- 完善组件测试覆盖
- 优化性能和用户体验
- 添加更多定制选项

### 长期目标
- 组件库化，支持多项目复用
- 设计系统集成
- 国际化完善

---

**总结**: 新的组件架构提供了更好的模块化、可维护性和可扩展性。通过合理使用这些组件，可以快速构建功能丰富、用户体验优秀的内容适配应用。

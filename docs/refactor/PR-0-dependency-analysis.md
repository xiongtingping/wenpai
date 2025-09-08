# PR-0: AI内容适配器依赖关系分析

## 🔍 核心依赖图

### 主文件：src/pages/AdaptPage.tsx (6489行)

#### 🔒 内容生成相关依赖（绝对不变）
```
AdaptPage.tsx
├── 🚫 内部函数（100%不变）
│   ├── generateMatrixPrompt (4152-4467行) - 多维矩阵提示词系统
│   ├── getPlatformCharacteristics (4098-4149行) - 平台特色要求
│   ├── getAlternativeContentForm (4051-4063行) - 替代内容形式
│   ├── getAlternativeStyle (4066-4074行) - 替代风格
│   ├── generatePlatformDimension (4255-4265行) - 平台维度生成
│   └── generateContentFormDimension (4268行+) - 内容形式维度
│
├── 🚫 外部配置依赖（100%不变）
│   ├── @/config/contentSchemes - 内容方案配置
│   ├── @/config/contentForms - 内容形式配置  
│   ├── @/config/aiModels - AI模型配置
│   └── @/config/platformLimits - 平台限制配置
│
├── 🚫 API服务依赖（100%不变）
│   ├── @/api/contentAdapter - 内容适配API
│   ├── @/services/aiWithTokenTracking - AI调用服务
│   ├── @/api/unifiedAIService - 统一AI服务
│   └── @/api/aiService - AI服务（AITaskType等）
│
└── ✅ UI组件依赖（可重构）
    ├── React组件 (useState, useEffect等)
    ├── UI组件库 (@/components/ui/*)
    ├── 图标库 (lucide-react)
    └── 路由/状态管理 (react-router-dom, stores)
```

#### 🔒 关键内容生成函数调用链（绝对不变）
```
generateMatrixPrompt()
├── generatePlatformDimension()
│   └── getPlatformCharacteristics() - 平台特色定义
├── generateContentFormDimension()
│   └── getContentFormById() - 内容形式配置
├── generateBrandDimension() - 品牌维度
└── 多维矩阵组装逻辑

callAIWithTokenTracking()
├── prompt: generateMatrixPrompt()结果
├── model: selectedModel
├── systemPrompt: 系统提示词
├── temperature: 0.7-0.9
├── maxTokens: 1000-2000
├── feature: 'AI内容适配器'
└── taskType: AITaskType.CONTENT_ADAPTATION
```

## 📊 文件规模分析

### 当前状态
- **总行数**: 6489行
- **核心生成逻辑**: ~500行 (generateMatrixPrompt及相关函数)
- **UI渲染逻辑**: ~4000行 (JSX组件)
- **状态管理**: ~1000行 (useState, useEffect等)
- **工具函数**: ~500行 (校验、格式化等)
- **类型定义**: ~200行 (接口、类型)

### 重构目标拆分
```
src/features/content-adapter/
├── index.tsx (200行) - 容器组件
├── ui/ (1500行) - 纯展示组件
│   ├── PlatformPicker.tsx
│   ├── ContentFormSelector.tsx  
│   ├── StyleSelector.tsx
│   ├── ModelSelector.tsx
│   ├── GenerateActions.tsx
│   └── ResultsPanel.tsx
├── hooks/ (800行) - 业务hooks
│   ├── useContentAdapterEngine.ts
│   ├── useGenerationQueue.ts
│   ├── usePlatformSettings.ts
│   └── useCharCountValidation.ts
├── services/ (300行) - 服务适配
│   └── contentAdapterService.ts
├── utils/ (600行) - 纯函数工具
│   ├── promptBuilders.ts (迁移generateMatrixPrompt)
│   ├── contentValidation.ts
│   └── resultMappers.ts
└── types/ (100行) - 类型定义
    └── index.ts
```

## 🚨 风险评估

### 高风险区域
1. **generateMatrixPrompt函数** (4152-4467行)
   - 复杂的多维矩阵逻辑
   - 品牌库集成
   - 平台特色适配
   - **风险**: 逻辑复杂，迁移时容易出错

2. **状态管理耦合**
   - 40+个useState
   - 复杂的useEffect依赖
   - **风险**: 状态依赖关系复杂

3. **异步调用链**
   - 并发生成逻辑
   - 重试机制
   - 取消逻辑
   - **风险**: 竞态条件和内存泄漏

### 中等风险区域
1. **UI组件耦合**
   - 大量内联JSX
   - 事件处理函数
   - **风险**: 拆分时可能遗漏交互逻辑

2. **配置依赖**
   - 多个config文件依赖
   - 动态配置读取
   - **风险**: 配置路径变更可能导致运行时错误

## 🔧 迁移策略

### 阶段1: 纯函数抽离 (最安全)
```typescript
// 目标: utils/promptBuilders.ts
export const generateMatrixPrompt = /* 完全相同的实现 */;
export const getPlatformCharacteristics = /* 完全相同的实现 */;
export const getAlternativeContentForm = /* 完全相同的实现 */;
export const getAlternativeStyle = /* 完全相同的实现 */;
```

### 阶段2: 服务层封装
```typescript  
// 目标: services/contentAdapterService.ts
export class ContentAdapterService {
  async generate(req: AdaptRequest): Promise<AdaptResult> {
    // 封装callAIWithTokenTracking调用
  }
}
```

### 阶段3: Hooks抽离
```typescript
// 目标: hooks/useContentAdapterEngine.ts
export function useContentAdapterEngine() {
  // 迁移生成、重试、对比逻辑
}
```

### 阶段4: UI组件拆分
```typescript
// 目标: ui/PlatformPicker.tsx等
export function PlatformPicker(props) {
  // 纯展示逻辑
}
```

## ✅ 验证清单

### MD5校验目标
- [ ] generateMatrixPrompt函数
- [ ] getPlatformCharacteristics函数  
- [ ] getAlternativeContentForm函数
- [ ] getAlternativeStyle函数
- [ ] 所有内容生成相关配置文件

### Golden Prompts测试
- [ ] 15组平台×形式×风格组合
- [ ] 边界情况测试
- [ ] 输出100%一致性验证

### 性能基准
- [ ] Bundle size基准
- [ ] 内存使用基准
- [ ] 首屏渲染基准
- [ ] API响应时延基准

## 📝 下一步

1. **PR-0.5**: 最小可行拆分验证
2. **PR-1**: 提示词系统抽离
3. **PR-2**: 服务层封装
4. **PR-3+**: UI组件逐步替换

---
**重要提醒**: 所有标记🚫的内容必须100%保持不变，仅允许物理位置迁移。

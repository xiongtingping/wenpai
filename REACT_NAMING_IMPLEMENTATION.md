# 🧩 React组件命名规范实施指南

## 🎯 实施目标

根据CLAUDE.md规范要求，建立统一、可维护、符合最佳实践的React组件命名体系，确保代码库的长期健康和可维护性。

## 📋 QuickReferenceDialog组件重构清单

### ✅ 已完成的重构

1. **Hook引用修复**
   ```typescript
   // ✅ 修复前
   import { useQuickReferenceDialogPositioning } from "@/hooks/useDialogPositioning";
   
   // ✅ 修复后  
   import { useQuickReferenceDialogPositioning } from "@/hooks/useDialogPositioning";
   ```

2. **CSS类名统一**
   ```typescript
   // ✅ 修复前
   className="dialog dialog__content dialog__content--quick-reference"
   
   // ✅ 修复后
   className="dialog dialog--quick-reference quick-reference-dialog"
   ```

3. **综合修复器实现**
   ```typescript
   // ✅ 结合定位和可见性修复
   const fixDialogComprehensively = () => {
     // 清除冲突属性 + 强制定位 + 可见性修复 + 尺寸设置
   };
   ```

### 🔄 正在进行的重构

4. **TypeScript接口命名**
   ```typescript
   // 🔄 当前状态
   interface QuickReferenceDialogProps {
     open: boolean;
     onOpenChange: (open: boolean) => void;
     onSelect: (content: string) => void;
     multiSelect?: boolean;
     className?: string;
   }
   
   // 🔄 待完善
   interface QuickReferenceItemCardProps {
     item: QuickReferenceItem;
     isSelected: boolean;
     multiSelect: boolean;
     searchQuery: string;
     onSelect: (item: QuickReferenceItem) => void;
     onCopyContent: (content: string) => void;
   }
   ```

5. **组件内部命名规范**
   ```typescript
   // 🔄 状态命名
   const [activeTab, setActiveTab] = useState<TabType>('brand');
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
   
   // 🔄 事件处理器命名
   const handleItemSelect = useCallback((item: QuickReferenceItem) => {});
   const handleMultiSelectConfirm = useCallback(() => {});
   const handleRefresh = useCallback(() => {});
   ```

### ⏭️ 待完成的重构

6. **子组件拆分和命名**
   ```typescript
   // ⏭️ 待实现
   // 文件：QuickReferenceDialog/components/QuickReferenceHeader.tsx
   interface QuickReferenceHeaderProps {
     title: string;
     description: string;
   }
   
   // 文件：QuickReferenceDialog/components/QuickReferenceSearchBar.tsx
   interface QuickReferenceSearchBarProps {
     searchQuery: string;
     onSearchChange: (query: string) => void;
     onRefresh: () => void;
     isLoading: boolean;
   }
   
   // 文件：QuickReferenceDialog/components/QuickReferenceTabsContainer.tsx
   interface QuickReferenceTabsContainerProps {
     activeTab: TabType;
     onTabChange: (tab: TabType) => void;
     tabs: TabDefinition[];
     items: Record<TabType, QuickReferenceItem[]>;
   }
   ```

7. **Hook拆分和规范化**
   ```typescript
   // ⏭️ 待实现
   // 文件：hooks/useQuickReferenceData.ts
   export function useQuickReferenceData(activeTab: TabType) {
     // 数据加载逻辑
   }
   
   // 文件：hooks/useQuickReferenceSearch.ts 
   export function useQuickReferenceSearch(items: QuickReferenceItem[], query: string) {
     // 搜索逻辑
   }
   
   // 文件：hooks/useQuickReferenceSelection.ts
   export function useQuickReferenceSelection(multiSelect: boolean) {
     // 选择逻辑
   }
   ```

## 📁 目录结构重构计划

### 🎯 目标结构

```
src/
├── components/
│   ├── creative/
│   │   └── QuickReference/
│   │       ├── QuickReferenceDialog.tsx              # 主组件
│   │       ├── components/                           # 子组件
│   │       │   ├── QuickReferenceHeader.tsx
│   │       │   ├── QuickReferenceSearchBar.tsx
│   │       │   ├── QuickReferenceTabsContainer.tsx
│   │       │   ├── QuickReferenceItemList.tsx
│   │       │   └── QuickReferenceItemCard.tsx
│   │       ├── hooks/                                # 专用hooks
│   │       │   ├── useQuickReferenceData.ts
│   │       │   ├── useQuickReferenceSearch.ts
│   │       │   └── useQuickReferenceSelection.ts
│   │       ├── types/                                # 类型定义
│   │       │   ├── QuickReferenceTypes.ts
│   │       │   └── QuickReferenceProps.ts
│   │       └── index.ts                              # 统一导出
│   └── ui/                                           # 基础UI组件
├── hooks/                                            # 全局hooks
│   ├── useDialogPositioning.ts                       ✅ 已存在
│   └── useToast.ts                                   ✅ 已存在
├── styles/                                           # 样式文件
│   ├── unified-dialog-system.css                     ✅ 已创建
│   └── quick-reference-compact-ui.css                ✅ 已存在
└── types/                                            # 全局类型
    └── dialog-types.ts                               ✅ 已存在
```

## 🔧 命名规范执行检查

### CSS类名检查清单

- [x] ✅ 使用BEM方法论
- [x] ✅ 避免缩写（quick-reference-dialog）
- [x] ✅ 语义化命名（dialog--quick-reference）
- [x] ✅ 一致的分隔符（kebab-case）
- [x] ✅ 基于设计令牌（避免硬编码）

### React组件检查清单

- [x] ✅ PascalCase命名（QuickReferenceDialog）
- [x] ✅ 描述性且准确（QuickReferenceDialog vs QRDialog）
- [x] ✅ Props接口命名正确（QuickReferenceDialogProps）
- [x] ✅ Hook命名遵循use前缀（useQuickReferenceDialogPositioning）
- [x] ✅ 文件名与组件名一致

### TypeScript接口检查清单

- [x] ✅ Props接口使用组件名+Props后缀
- [x] ✅ 避免I前缀（Interface前缀）
- [x] ✅ 描述性类型名称
- [x] ✅ 一致的泛型命名（T, K, V）

## 🚀 实施步骤

### Phase 1: 核心修复（已完成）
- [x] ✅ 修复组件引用错误
- [x] ✅ 统一CSS类名
- [x] ✅ 实现综合修复器
- [x] ✅ 创建统一Dialog系统

### Phase 2: 架构重构（进行中）
- [ ] 🔄 子组件拆分
- [ ] 🔄 Hook专业化
- [ ] 🔄 类型定义完善
- [ ] 🔄 目录结构调整

### Phase 3: 质量保证（待开始）
- [ ] ⏭️ 单元测试覆盖
- [ ] ⏭️ 集成测试验证
- [ ] ⏭️ 性能优化
- [ ] ⏭️ 文档完善

### Phase 4: 团队推广（计划中）
- [ ] 📅 团队培训
- [ ] 📅 代码审查模板
- [ ] 📅 自动化检查工具
- [ ] 📅 最佳实践文档

## 🎯 质量标准

### 功能标准
- [ ] Dialog必须正确居中显示
- [ ] 搜索功能正常工作
- [ ] 多选功能正确实现
- [ ] 响应式设计适配
- [ ] 无障碍性支持

### 代码质量标准
- [ ] TypeScript类型完整
- [ ] 没有eslint警告
- [ ] 遵循命名规范
- [ ] 代码可读性良好
- [ ] 性能优化到位

### 测试标准
- [ ] 单元测试覆盖率>80%
- [ ] 集成测试通过
- [ ] 视觉回归测试通过
- [ ] 性能基准测试通过

## ⚠️ 风险管控

### 已识别风险
1. **样式冲突风险** - 多个CSS文件可能产生冲突
   - 缓解措施：统一Dialog系统，移除重复文件
   
2. **组件重构风险** - 大规模重构可能引入bug
   - 缓解措施：渐进式重构，保持向后兼容
   
3. **命名规范执行风险** - 团队成员可能不遵循规范
   - 缓解措施：自动化检查，代码审查强制执行

### 回滚计划
如果重构出现问题，可以：
1. 恢复到备份文件（.backup文件）
2. 使用git revert回滚特定提交
3. 逐步撤销问题修改

## 📈 成功指标

### 短期指标（1周内）
- [x] ✅ 快速引用Dialog正常工作
- [x] ✅ 构建无错误
- [x] ✅ 基础功能测试通过

### 中期指标（1月内）
- [ ] 🎯 所有Dialog组件统一命名
- [ ] 🎯 代码覆盖率达到要求
- [ ] 🎯 性能基准测试建立

### 长期指标（3月内）
- [ ] 🎯 整个项目命名规范统一
- [ ] 🎯 自动化检查工具部署
- [ ] 🎯 团队开发效率提升

---

**⚠️ 重要提醒：所有修改必须遵循CLAUDE.md规范，确保不引入技术债务，保持系统稳定性。**
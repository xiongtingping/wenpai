# 多维矩阵提示词系统实现计划

## 🎯 系统概述

多维矩阵提示词系统是一个动态组合的AI提示词内容生成系统，旨在提升内容适配的灵活性与个性化程度。

## 🌟 核心功能要求

### 1. 系统提示词预览框
- **位置**：在生成按钮前的合适位置
- **功能**：让用户清晰了解提示词结构
- **交互**：可展开/收起，实时显示动态构建的提示词

### 2. 用户自定义提示词输入框
- **功能**：允许用户在系统提示词基础上手动添加定制内容
- **优先级**：用户自定义内容具有高优先级
- **融合**：与系统提示词自然融合

### 3. AI内容生成
- **要求**：根据最终拼接提示词生成内容
- **匹配**：内容必须匹配提示词的多个维度
- **差异化**：自动引入差异化内容，防止模版化

## 📐 系统提示词维度说明

### 🔺 品牌库内容（最高优先级）
- **覆盖规则**：品牌资料覆盖所有默认平台设定和用户临时输入
- **权重**：品牌提示词在最终组合中拥有最高权重
- **要求**：始终遵循品牌调性、语言规范、表达一致性
- **维度包含**：
  - 品牌语调/个性（活泼、专业、诗意、温暖等）
  - 品牌基本信息（品牌名、简介、行业等）
  - 品牌身份（愿景、使命、价值观）
  - 内容创作要素（禁用词、高频词、口吻模板等）

### ✅ 必需维度
1. **原始内容**：用户输入的原始内容
2. **目标平台**：必须体现平台差异性与用户语言偏好

### ⭕ 可选维度
1. **内容形式**：影响内容排版、分段、用词等
2. **表达风格**：覆盖平台默认风格
3. **用户自定义提示词**：关键词、表达方向、金句、口头禅等
4. **字符数控制**：精确控制生成字数范围
5. **格式化要求**：Emoji、美化排版、自动加粗、换行等
6. **系统差异化维度**：随机选用近义句式、打乱结构、局部换词

## 🔄 提示词组合逻辑

### 基础组合
- **最简组合**：原始内容 + 平台 → 平台默认内容形式 + 常用表达风格
- **指定形式**：+ 内容形式 → 按指定结构输出
- **指定风格**：+ 表达风格 → 优先按指定风格生成
- **品牌模式**：+ 品牌库资料 → 品牌调性拥有最高优先级

### 优先级机制
1. **品牌库 > 用户选择 > 平台默认**
2. **维度越多，内容越个性化且具辨识度**
3. **禁止静态模版**：所有提示词必须模块化拼接，动态适应

## 🛠️ 技术实现架构

### 1. 状态管理
```typescript
// 多维矩阵提示词系统状态
const [showPromptPreview, setShowPromptPreview] = useState(false);
const [systemPrompt, setSystemPrompt] = useState('');
const [customPrompt, setCustomPrompt] = useState('');
const [brandProfile, setBrandProfile] = useState<any>(null);
```

### 2. 核心函数
```typescript
// 多维矩阵提示词生成系统
const generateMatrixPrompt = async (
  originalContent: string,
  platform: string,
  formId?: string,
  style: StyleType = 'professional',
  charCount?: number,
  customPromptText?: string,
  useBrand: boolean = false
): Promise<string>
```

### 3. 维度生成函数
- `generateBrandDimension()` - 品牌维度
- `generateContentDimension()` - 内容维度
- `generatePlatformDimension()` - 平台维度
- `generateContentFormDimension()` - 内容形式维度
- `generateStyleDimension()` - 风格维度
- `generateCustomDimension()` - 自定义维度
- `generateCharCountDimension()` - 字符数维度
- `generateFormatDimension()` - 格式化维度
- `generateDifferentiationDimension()` - 差异化维度

## 🎨 UI组件设计

### 多维矩阵提示词系统卡片
```tsx
<Card className="mb-8">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Brain className="h-5 w-5" />
      多维矩阵提示词系统
    </CardTitle>
    <CardDescription>
      动态组合的AI提示词内容生成系统，提升内容适配的灵活性与个性化程度
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* 用户自定义提示词输入框 */}
    <Textarea
      value={customPrompt}
      onChange={(e) => setCustomPrompt(e.target.value)}
      placeholder="在此添加您的个性化要求..."
    />
    
    {/* 系统提示词预览 */}
    <div className="space-y-2">
      <Button onClick={() => setShowPromptPreview(!showPromptPreview)}>
        {showPromptPreview ? '隐藏预览' : '显示预览'}
      </Button>
      {showPromptPreview && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <pre className="text-xs whitespace-pre-wrap">
            {systemPrompt || '系统提示词将在生成时动态构建'}
          </pre>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

## 🔧 集成流程

### 1. 替换现有API调用
```typescript
// 原有方式
const response = await generateAdaptedContent(request);

// 新方式
const matrixPrompt = await generateMatrixPrompt(
  originalContent.trim(),
  platformId,
  selectedFormId,
  selectedStyle,
  charCount,
  customPrompt,
  useBrandLibrary
);

// 更新系统提示词预览
setSystemPrompt(matrixPrompt);

// 使用统一AI服务生成内容
const aiResult = await callAI({
  prompt: matrixPrompt,
  model: selectedModel,
  systemPrompt: '你是一个专业的多维度内容创作专家',
  temperature: 0.8 // 增加随机性避免模板化
});
```

### 2. 品牌库集成
- 检测用户是否启用品牌库
- 加载品牌档案数据
- 在提示词中注入品牌维度（最高优先级）

### 3. 实时预览更新
- 用户修改任何参数时，动态重新构建提示词
- 实时更新预览区域
- 保持预览状态的持久化

## 📊 预期效果

### 内容质量提升
1. **平台差异化明显**：每个平台都有独特的内容风格
2. **品牌一致性强**：启用品牌库时严格遵循品牌调性
3. **个性化程度高**：用户自定义要求得到充分体现
4. **模板化程度低**：差异化维度确保内容独特性

### 用户体验改善
1. **透明度高**：用户可以清楚看到系统如何构建提示词
2. **可控性强**：用户可以精确控制内容生成的各个维度
3. **灵活性好**：支持从简单到复杂的各种使用场景
4. **专业性强**：提供企业级的品牌内容生成能力

## 🚀 实施状态

### ✅ 已完成
- 多维矩阵提示词生成函数架构设计
- 各维度生成函数定义
- 平台特色配置系统
- 品牌库集成逻辑设计

### 🔄 进行中
- UI组件实现和集成
- 语法错误修复
- 状态管理优化

### ⏳ 待完成
- 完整功能测试
- 品牌库真实数据集成
- 性能优化
- 用户体验优化

## 🎯 下一步计划

1. **修复当前语法错误**：解决重复声明和try-catch结构问题
2. **完成UI集成**：确保多维矩阵提示词系统界面正常显示
3. **功能测试**：验证各个维度的提示词生成效果
4. **品牌库对接**：集成真实的品牌库数据
5. **用户测试**：收集用户反馈并优化体验

多维矩阵提示词系统将显著提升AI内容生成的质量和个性化程度，为用户提供更专业、更灵活的内容创作工具！🎉

# AI服务统一迁移指南

## 🎯 迁移目标

将所有前端组件的AI调用逻辑统一到 `src/api/aiService.ts`，实现：
- 统一的API调用接口
- 一致的错误处理
- 标准化的响应格式
- 集中的配置管理

## 📋 迁移检查清单

### 第一阶段：核心功能迁移

#### 1. AI总结器 (`AISummarizer.tsx`) ✅
- **状态**: 已完成
- **变更**: 使用 `aiService.summarizeContent()`
- **测试**: 需要验证功能正常

#### 2. 品牌Emoji生成器 (`BrandEmojiGenerator.tsx`)
- **当前调用**: 直接调用 `/.netlify/functions/api`
- **目标调用**: `aiService.generateImage()`
- **特殊处理**: 支持参考图片上传

#### 3. 通用Emoji生成器 (`EmojiGenerator.tsx`)
- **当前调用**: 直接调用 `/.netlify/functions/api`
- **目标调用**: `aiService.generateImage()`
- **特殊处理**: 重试机制和错误处理

#### 4. 创意魔方 (`CreativeCube.tsx`)
- **当前调用**: `callOpenAIDevProxy()`
- **目标调用**: `aiService.generateCreativeContent()`
- **特殊处理**: 复杂的系统提示词

### 第二阶段：分析功能迁移

#### 5. AI分析服务 (`aiAnalysisService.ts`)
- **当前调用**: `callOpenAIProxy()`
- **目标调用**: `aiService.analyzeBrandContent()`
- **特殊处理**: JSON格式响应

#### 6. Emoji推荐 (`EmojiPage.tsx`)
- **当前调用**: `callOpenAIDevProxy()`
- **目标调用**: `aiService.recommendEmojis()`
- **特殊处理**: Emoji列表推荐

#### 7. 内容提取 (`ContentExtractorPage.tsx`)
- **当前调用**: `callOpenAIDevProxy()`
- **目标调用**: `aiService.summarizeContent()`
- **特殊处理**: 内容提取和总结

### 第三阶段：遗留功能迁移

#### 8. 品牌内容生成器 (`BrandContentGenerator.tsx`)
- **当前状态**: 使用模拟数据
- **目标调用**: `aiService.generateCreativeContent()`
- **特殊处理**: 品牌档案集成

#### 9. 朋友圈文案生成器 (`MomentsTextGenerator.tsx`)
- **当前状态**: 使用模拟AI生成
- **目标调用**: `aiService.generateCreativeContent()`
- **特殊处理**: 多种文案风格

## 🔧 迁移步骤详解

### 步骤1：导入统一AI服务

```typescript
// 旧代码
import { callOpenAIDevProxy } from '@/api/devApiProxy';
import { callOpenAIProxy } from '@/api/openaiProxy';

// 新代码
import aiService from '@/api/aiService';
```

### 步骤2：更新API调用

#### 文本生成类调用

```typescript
// 旧代码 - 直接调用OpenAI
const response = await callOpenAIDevProxy({
  messages: [{ role: 'user', content: prompt }],
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000
});

// 新代码 - 使用统一服务
const response = await aiService.generateText({
  messages: [{ role: 'user', content: prompt }],
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000
});
```

#### 图像生成类调用

```typescript
// 旧代码 - 直接调用Netlify函数
const response = await fetch('/.netlify/functions/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openai',
    action: 'generate-image',
    prompt,
    n,
    size,
    response_format
  })
});

// 新代码 - 使用统一服务
const response = await aiService.generateImage({
  prompt,
  n,
  size,
  response_format
});
```

#### 专用功能调用

```typescript
// 内容总结
const response = await aiService.summarizeContent(content);

// 品牌分析
const response = await aiService.analyzeBrandContent(brandContent);

// 调性检查
const response = await aiService.checkContentTone(content, brandProfile);

// Emoji推荐
const response = await aiService.recommendEmojis(contentContext);

// 创意内容生成
const response = await aiService.generateCreativeContent(prompt, 'text');

// 内容适配
const response = await aiService.adaptContent(content, ['weibo', 'wechat']);
```

### 步骤3：更新错误处理

```typescript
// 旧代码
try {
  const response = await callOpenAIDevProxy(options);
  if (response.success) {
    // 处理成功响应
  } else {
    throw new Error('API调用失败');
  }
} catch (error) {
  console.error('错误:', error);
  // 通用错误处理
}

// 新代码
try {
  const response = await aiService.generateText(options);
  if (response.success) {
    // 处理成功响应
  } else {
    throw new Error(response.error || 'AI服务调用失败');
  }
} catch (error) {
  console.error('AI服务错误:', error);
  // 统一的错误处理，包含详细错误信息
  toast({
    title: "操作失败",
    description: error instanceof Error ? error.message : "未知错误",
    variant: "destructive",
  });
}
```

### 步骤4：更新响应处理

```typescript
// 旧代码 - 不同组件有不同的响应格式
if (response.success && response.data?.data?.choices?.[0]?.message?.content) {
  const content = response.data.data.choices[0].message.content;
}

// 新代码 - 统一的响应格式
if (response.success && response.data) {
  // 根据具体方法返回的数据结构处理
  const content = response.data; // 或 response.data.content
}
```

## 📝 具体组件迁移示例

### 示例1：品牌Emoji生成器迁移

```typescript
// 旧代码
const generateEmoji = async () => {
  try {
    const response = await fetch('/.netlify/functions/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        action: 'generate-image',
        prompt: emojiPrompt,
        n: emojiCount,
        size: '512x512',
        response_format: 'url',
        reference_image: uploadedImage
      })
    });

    const data = await response.json();
    if (data.success) {
      setGeneratedEmojis(data.data.images);
    }
  } catch (error) {
    console.error('生成失败:', error);
  }
};

// 新代码
const generateEmoji = async () => {
  try {
    const response = await aiService.generateImage({
      prompt: emojiPrompt,
      n: emojiCount,
      size: '512x512',
      response_format: 'url',
      reference_image: uploadedImage
    });

    if (response.success && response.data?.images) {
      setGeneratedEmojis(response.data.images);
    } else {
      throw new Error(response.error || 'Emoji生成失败');
    }
  } catch (error) {
    console.error('Emoji生成失败:', error);
    toast({
      title: "生成失败",
      description: error instanceof Error ? error.message : "请稍后重试",
      variant: "destructive",
    });
  }
};
```

### 示例2：创意魔方迁移

```typescript
// 旧代码
const generateContent = async () => {
  try {
    const response = await callOpenAIDevProxy({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000
    });

    if (response.success) {
      setGeneratedContent(response.data.data.choices[0].message.content);
    }
  } catch (error) {
    console.error('生成失败:', error);
  }
};

// 新代码
const generateContent = async () => {
  try {
    const response = await aiService.generateCreativeContent(
      userPrompt, 
      contentType
    );

    if (response.success && response.data?.data?.choices?.[0]?.message?.content) {
      setGeneratedContent(response.data.data.choices[0].message.content);
    } else {
      throw new Error(response.error || '内容生成失败');
    }
  } catch (error) {
    console.error('内容生成失败:', error);
    toast({
      title: "生成失败",
      description: error instanceof Error ? error.message : "请稍后重试",
      variant: "destructive",
    });
  }
};
```

## 🧪 测试验证

### 功能测试清单

- [ ] **API调用测试**: 验证所有AI调用正常工作
- [ ] **错误处理测试**: 验证网络错误、API错误等异常情况
- [ ] **响应格式测试**: 验证返回数据格式正确
- [ ] **用户体验测试**: 验证加载状态、错误提示等UI交互
- [ ] **性能测试**: 验证响应时间和资源使用

### 测试命令

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 构建检查
npm run build
```

## 🚨 注意事项

### 1. 环境变量配置
确保 `.env.local` 文件包含必要的API密钥：
```bash
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 2. 类型安全
- 使用TypeScript类型检查
- 确保所有响应数据都有正确的类型定义
- 避免使用 `any` 类型

### 3. 错误处理
- 始终检查 `response.success` 状态
- 提供有意义的错误信息
- 实现适当的重试机制

### 4. 性能优化
- 避免不必要的API调用
- 实现适当的缓存机制
- 控制并发请求数量

## 📞 支持

如果在迁移过程中遇到问题：

1. **查看日志**: 检查浏览器控制台和网络请求
2. **验证配置**: 确认环境变量和API密钥正确
3. **测试API**: 使用Postman或curl测试API端点
4. **查看文档**: 参考 `AI_CALL_ANALYSIS_REPORT.md`

## 🎉 迁移完成检查

完成迁移后，请确认：

- [ ] 所有AI功能正常工作
- [ ] 错误处理统一且友好
- [ ] 代码重复减少
- [ ] 类型定义统一
- [ ] 配置管理集中
- [ ] 测试覆盖完整

迁移完成后，可以删除旧的API调用文件和重复的类型定义。 
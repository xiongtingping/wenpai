# AI API 配置指南

## 概述

本项目已移除所有模拟响应逻辑，现在将直接调用真实的 AI 服务。请按照以下步骤配置您的 AI API 密钥。

## 配置步骤

### 1. 开发环境配置

#### 方法一：直接配置 API 密钥（推荐用于本地开发）

编辑 `src/api/devApiProxy.ts` 文件：

```typescript
const OPENAI_CONFIG = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: 'sk-your-actual-openai-api-key-here', // 替换为您的真实 API Key
  model: 'gpt-4o'
};
```

#### 方法二：使用环境变量（推荐用于生产环境）

1. 创建 `.env.local` 文件（如果不存在）：
```bash
# OpenAI API 配置
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# DeepSeek API 配置（可选）
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here

# Google Gemini API 配置（可选）
VITE_GEMINI_API_KEY=your-actual-gemini-api-key-here
```

2. 修改 `src/api/devApiProxy.ts`：
```typescript
const OPENAI_CONFIG = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'sk-proj-your-api-key-here',
  model: 'gpt-4o'
};
```

### 2. 生产环境配置（Netlify）

#### 部署到 Netlify 并配置环境变量

1. **部署项目**：
```bash
npm run build
netlify deploy --prod
```

2. **配置 Netlify 环境变量**：
   - 登录 Netlify 控制台
   - 进入项目设置 → Environment variables
   - 添加以下环境变量：
     - `OPENAI_API_KEY`: 您的 OpenAI API 密钥
     - `DEEPSEEK_API_KEY`: 您的 DeepSeek API 密钥（可选）
     - `GEMINI_API_KEY`: 您的 Google Gemini API 密钥（可选）

### 3. 验证配置

#### 测试 API 连接

1. **开发环境测试**：
```bash
npm run dev
```
然后在浏览器中访问：`http://localhost:3000/test` 或 `http://localhost:3000/ai-test`

2. **生产环境测试**：
部署后访问您的网站，尝试使用 AI 功能。

## 支持的 AI 提供商

### 1. OpenAI (推荐)
- **模型**: GPT-4o, GPT-4, GPT-3.5-turbo
- **特点**: 最稳定，功能最全面
- **配置**: 需要 OpenAI API 密钥

### 2. DeepSeek (可选)
- **模型**: deepseek-v2.5, deepseek-chat
- **特点**: 中文优化，价格相对较低
- **配置**: 需要 DeepSeek API 密钥

### 3. Google Gemini (可选)
- **模型**: gemini-pro, gemini-flash
- **特点**: 多模态支持，Google 生态
- **配置**: 需要 Google AI Studio API 密钥

## 错误处理

### 常见错误及解决方案

1. **"OpenAI API Key未配置"**
   - 确保在 `devApiProxy.ts` 中配置了正确的 API 密钥
   - 或在 `.env.local` 中设置了 `VITE_OPENAI_API_KEY`

2. **"Netlify Functions不可用"**
   - 确保项目已正确部署到 Netlify
   - 检查 Netlify Functions 是否正常工作
   - 验证环境变量是否已配置

3. **"AI服务调用失败"**
   - 检查 API 密钥是否有效
   - 确认账户余额充足
   - 检查网络连接

4. **"AI服务连接失败"**
   - 检查网络连接
   - 确认 API 端点可访问
   - 验证防火墙设置

## 安全注意事项

1. **API 密钥安全**：
   - 永远不要将 API 密钥提交到 Git 仓库
   - 使用环境变量存储敏感信息
   - 定期轮换 API 密钥

2. **使用限制**：
   - 监控 API 使用量
   - 设置合理的速率限制
   - 注意成本控制

3. **数据隐私**：
   - 了解 AI 提供商的数据使用政策
   - 避免上传敏感信息
   - 考虑数据本地化需求

## 故障排除

### 开发环境问题

1. **API 调用失败**：
   - 检查 API 密钥格式是否正确
   - 确认账户有足够的余额
   - 验证网络连接

2. **CORS 错误**：
   - 确保使用正确的 API 端点
   - 检查请求头设置

### 生产环境问题

1. **Netlify Functions 404**：
   - 确保 `netlify/functions/api.js` 文件存在
   - 检查 `netlify.toml` 配置
   - 重新部署项目

2. **环境变量未生效**：
   - 在 Netlify 控制台中重新设置环境变量
   - 触发重新部署
   - 清除缓存

## 联系支持

如果您遇到配置问题，请：

1. 检查本文档的故障排除部分
2. 查看浏览器控制台的错误信息
3. 确认 API 密钥和网络连接正常
4. 联系技术支持团队

---

**注意**: 配置完成后，所有 AI 功能将使用真实的 AI 服务，不再使用模拟响应。请确保您的账户有足够的余额以支持正常使用。 
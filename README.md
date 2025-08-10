# 文派 - 智能内容创作平台

<div align="center">

![文派 Logo](https://img.shields.io/badge/文派-智能内容创作平台-blue?style=for-the-badge)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Authing](https://img.shields.io/badge/Authing-5.1.0-FF6B35?style=flat-square)](https://authing.cn/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**基于现代化技术栈的企业级智能内容创作平台，集成多AI模型、统一认证、实时热点追踪等功能**

[🚀 在线体验](https://www.wenpai.xyz) | [📖 文档](./docs) | [🐛 问题反馈](https://github.com/xiongtingping/wenpai/issues)

</div>

---

## 📋 目录

- [✨ 功能特性](#-功能特性)
- [🛠️ 技术栈](#️-技术栈)
- [📦 快速开始](#-快速开始)
- [🏗️ 项目结构](#️-项目结构)
- [🔧 配置说明](#-配置说明)
- [🚀 部署指南](#-部署指南)
- [📚 API 文档](#-api-文档)
- [🧪 测试](#-测试)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)

---

## ✨ 功能特性

### 🎯 核心功能

| 功能模块 | 描述 | 状态 |
|---------|------|------|
| **多平台内容适配** | 一键适配微信公众号、小红书、知乎、抖音等主流平台 | ✅ 已完成 |
| **AI智能创作** | 集成 GPT-4o、DeepSeek、Gemini 等多种AI模型 | ✅ 已完成 |
| **品牌资料库** | 智能品牌资产管理，支持多维度分析和自动去重 | ✅ 已完成 |
| **全网热点追踪** | 实时聚合微博、知乎、B站、抖音等平台热点话题 | ✅ 已完成 |
| **统一认证系统** | 基于Authing的企业级身份认证和权限管理 | ✅ 已完成 |

### 🚀 AI智能工具

| 工具名称 | 功能描述 | 技术特点 |
|---------|----------|----------|
| **🎨 九宫格创意魔方** | AI驱动的创意内容生成，支持多维度创意组合 | 智能提示词系统、批量生成 |
| **📄 内容提取智采器** | 支持URL、文件、文本多源内容提取和AI总结 | 多格式解析、智能摘要 |
| **😊 AI Emoji生成器** | 智能生成个性化Emoji图片和推荐 | 风格定制、批量下载 |
| **🔖 智能收藏管理** | 网络资源分类整理，支持标签和状态管理 | 智能分类、搜索过滤 |
| **📱 朋友圈文案模板** | 专业设计的社交媒体文案模板库 | 字数优化、风格多样 |

### 🔥 实时数据服务

- **📊 热点话题聚合**: 实时获取全网热点，支持平台筛选和趋势分析
- **🎯 智能内容推荐**: 基于用户偏好和热点趋势的内容推荐
- **📈 数据统计分析**: 内容创作效果分析和用户行为洞察
- **🔄 自动内容同步**: 跨平台内容同步和状态管理

---

## 🛠️ 技术栈

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.3.1 | 用户界面构建 |
| **TypeScript** | 5.7.2 | 类型安全的JavaScript |
| **Vite** | 7.0.5 | 构建工具和开发服务器 |
| **Tailwind CSS** | 3.0 | 原子化CSS框架 |
| **shadcn/ui** | Latest | 现代化UI组件库 |

### 状态管理与路由

- **Zustand** - 轻量级状态管理
- **React Router v6** - 客户端路由
- **React Hook Form** - 表单状态管理

### 认证与安全

- **Authing Guard** v5.1.0 - 企业级身份认证服务
- **JWT** - 安全令牌认证
- **统一权限管理** - 基于角色的访问控制
- **HTTPS** - 全站加密传输

### AI 服务集成

- **OpenAI GPT-4o** - 最新文本生成和对话模型
- **DeepSeek Chat** - 中文优化的AI模型
- **Google Gemini Pro** - 多模态AI能力
- **统一AI服务** - 环境感知的智能路由

### 后端服务

- **Netlify Functions** - 无服务器API
- **热点数据API** - 实时热点话题聚合
- **Creem支付** - 订阅和支付处理
- **MongoDB** - 数据存储（可选）

---

## 📦 快速开始

### 环境要求

- **Node.js** >= 20.16.0
- **npm** >= 9.0.0 或 **yarn** >= 1.22.0
- **Git** >= 2.0.0

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/xiongtingping/wenpai.git
cd wenpai

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp env.example .env.local
# 编辑 .env.local 文件，添加必要的API密钥

# 4. 启动开发服务器
npm run dev
```

🎉 访问 http://localhost:5173 查看应用

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署到 Netlify
npm run deploy:netlify
```

---

## 🏗️ 项目结构

```
wenpai/
├── 📁 public/                    # 静态资源
│   ├── favicon.ico               # 网站图标
│   └── pdf.worker.min.js         # PDF处理工具
├── 📁 src/
│   ├── 📁 api/                   # API 服务层
│   │   ├── aiService.ts          # 统一AI服务核心
│   │   ├── unifiedAIService.ts   # 环境感知AI路由
│   │   ├── request.ts            # HTTP请求封装
│   │   ├── hotTopicsService.ts   # 热点话题API
│   │   └── index.ts              # API统一导出
│   ├── 📁 components/            # React 组件
│   │   ├── 📁 ui/               # 基础UI组件 (shadcn/ui)
│   │   ├── 📁 auth/             # 认证相关组件
│   │   ├── 📁 creative/         # 创意工具组件
│   │   ├── 📁 landing/          # 落地页组件
│   │   ├── 📁 layout/           # 布局组件
│   │   └── 📁 monitoring/       # 性能监控组件
│   ├── 📁 contexts/             # React Context
│   │   ├── UnifiedAuthContext.tsx # 统一认证上下文
│   │   └── UserDataIsolationProvider.tsx # 用户数据隔离
│   ├── 📁 features/             # 功能模块
│   │   ├── 📁 titleGeneration/  # 标题生成系统
│   │   ├── 📁 brandLibrary/     # 品牌资料库
│   │   └── 📁 contentExtraction/ # 内容提取
│   ├── 📁 pages/                # 页面组件
│   │   ├── HomePage.tsx         # 首页
│   │   ├── AdaptPage.tsx        # 内容适配页
│   │   ├── BrandLibraryPage.tsx # 品牌资料库
│   │   ├── HotTopicsPage.tsx    # 热点话题页
│   │   ├── ContentExtractorPage.tsx # 内容提取器
│   │   ├── CreativeCubePage.tsx # 九宫格创意魔方
│   │   ├── EmojiPage.tsx        # Emoji生成器
│   │   └── ...                  # 其他页面
│   ├── 📁 prompts/              # AI提示词系统
│   │   └── PromptSystem.ts      # 提示词管理
│   ├── 📁 services/             # 业务服务
│   │   ├── tokenUsageService.ts # Token使用统计
│   │   └── systemMonitorService.ts # 系统监控
│   ├── 📁 stores/               # Zustand 状态管理
│   │   ├── authStore.ts         # 认证状态
│   │   ├── contentSyncStore.ts  # 内容同步状态
│   │   └── favoritesStore.ts    # 收藏系统状态
│   ├── 📁 utils/                # 工具函数
│   │   ├── safeStringUtils.ts   # 安全字符串处理
│   │   ├── authingGuardSafeWrapper.ts # 认证安全包装
│   │   └── webExtractor.ts      # 网页内容提取
│   ├── 📁 config/               # 配置文件
│   │   ├── authing.ts           # Authing认证配置
│   │   ├── platformLimits.ts    # 平台限制配置
│   │   ├── aiModels.ts          # AI模型配置
│   │   └── subscriptionPlans.ts # 订阅计划配置
│   └── 📁 types/                # TypeScript 类型定义
├── 📁 netlify/                  # Netlify Functions
│   └── 📁 functions/            # 服务端API函数
│       └── api.cjs              # 统一API代理
├── 📁 .augment/                 # 代码助手规则
│   └── 📁 rules/                # 开发规则配置
└── 📄 配置文件
    ├── package.json             # 项目依赖
    ├── vite.config.ts           # Vite配置
    ├── tailwind.config.js       # Tailwind配置
    └── tsconfig.json            # TypeScript配置
```

---

## 🔧 配置说明

### 环境变量配置

创建 `.env.local` 文件并配置以下变量：

```bash
# ===========================================
# AI API Keys - AI服务密钥
# ===========================================
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_OPENAI_MODEL=gpt-4o
VITE_DEEPSEEK_API_KEY=sk-your-deepseek-api-key
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_GEMINI_MODEL=gemini-pro

# ===========================================
# Authing 认证配置 (已预配置)
# ===========================================
VITE_AUTHING_APP_ID=68823897631e1ef8ff3720b2
VITE_AUTHING_DOMAIN=rzcswqd4sq0f.authing.cn
VITE_AUTHING_HOST=https://rzcswqd4sq0f.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback

# ===========================================
# 应用配置
# ===========================================
VITE_API_BASE_URL=https://www.wenpai.xyz/api
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_IMAGE_GENERATION=true

# ===========================================
# 支付配置 (可选)
# ===========================================
VITE_CREEM_API_KEY=your-creem-api-key

# ===========================================
# 安全配置
# ===========================================
VITE_ENCRYPTION_KEY=your-custom-encryption-key-32-chars-long
VITE_SECURITY_LEVEL=high
```

### 核心配置说明

#### 1. AI服务配置

| 服务商 | 获取方式 | 模型 | 用途 |
|--------|----------|------|------|
| **OpenAI** | [OpenAI Platform](https://platform.openai.com) | GPT-4o | 高质量文本生成 |
| **DeepSeek** | [DeepSeek Platform](https://platform.deepseek.com) | DeepSeek-Chat | 中文优化AI |
| **Google Gemini** | [Google AI Studio](https://makersuite.google.com) | Gemini Pro | 多模态AI |

#### 2. 认证系统配置

项目已预配置Authing认证服务，支持：
- **统一登录**: 邮箱、手机号、社交账号登录
- **权限管理**: 基于角色的访问控制
- **安全防护**: JWT令牌、HTTPS加密
- **多环境支持**: 开发/生产环境自动适配

#### 3. 环境感知AI路由

系统自动根据环境选择AI调用方式：
- **开发环境**: 直连AI服务商API，便于调试
- **生产环境**: 通过Netlify Functions代理，保护API密钥
- **智能降级**: API失败时自动切换到备用服务

#### 4. 热点数据配置

集成多平台热点数据源：
- **微博热搜**: 实时社会热点
- **知乎热榜**: 深度讨论话题
- **B站热门**: 视频内容趋势
- **抖音热点**: 短视频流行趋势

---

## 🚀 部署指南

### Netlify 部署（推荐）

1. **准备部署**
   ```bash
   # Fork 项目到你的 GitHub
   git clone https://github.com/your-username/wenpai.git
   cd wenpai
   ```

2. **Netlify 配置**
   - 登录 [Netlify](https://netlify.com)
   - 连接 GitHub 仓库
   - 配置构建设置：
     ```
     Build command: npm run build
     Publish directory: dist
     Functions directory: netlify/functions
     ```

3. **环境变量配置**
   在 Netlify 控制台的 Environment variables 中添加所有必要的环境变量

4. **域名配置**
   - 配置自定义域名（可选）
   - 启用 HTTPS
   - 配置 DNS 记录

### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### Docker 部署

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 📚 API 文档

### 统一AI服务 API

#### 智能内容生成
```typescript
import { callAI } from '@/api/aiService';

// 基础调用
const result = await callAI({
  prompt: "写一篇关于人工智能的文章",
  taskType: AITaskType.CONTENT_GENERATION,
  model: "gpt-4o",
  maxTokens: 1000
});

// 带系统提示词
const result = await callAI({
  prompt: "分析这个品牌",
  systemPrompt: "你是一个专业的品牌分析师",
  taskType: AITaskType.BRAND_ANALYSIS,
  temperature: 0.3
});
```

#### 专用AI功能

```typescript
// 内容适配
const adaptedContent = await callContentAdapter({
  originalContent: "原始内容",
  targetPlatforms: ["wechat", "xiaohongshu"],
  brandProfile: brandInfo
});

// 创意生成
const creativeContent = await callCreativeGeneration({
  theme: "科技创新",
  contentType: "social_media",
  style: "专业"
});

// Emoji生成
const emojiResult = await callEmojiGenerator({
  description: "开心的表情",
  style: "可爱",
  count: 5
});
```

### 热点话题 API

#### 获取热点数据
```typescript
import { fetchHotTopics } from '@/api/hotTopicsService';

// 获取所有平台热点
const allTopics = await fetchHotTopics();

// 获取指定平台热点
const weiboTopics = await fetchHotTopics('weibo');
```

#### 热点数据结构
```typescript
interface DailyHotItem {
  title: string;
  url: string;
  hot: string;
  platform: string;
  rank: number;
  desc?: string;
  timestamp: number;
  category: string;
  tags: string[];
  heat_score: number;
  trend: 'rising' | 'falling' | 'stable';
}
```

### 品牌资料库 API

#### 品牌维度管理
```typescript
interface BrandDimension {
  id: string;
  title: string;
  description: string;
  items: BrandInfoItem[];
  color: string;
  icon: string;
}

interface BrandInfoItem {
  id: string;
  content: string;
  source: string;
  confidence: number;
  isPinned: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 统一请求封装

所有HTTP请求必须通过统一封装：

```typescript
import { request } from '@/api/request';

// GET请求
const data = await request.get('/api/endpoint');

// POST请求
const result = await request.post('/api/endpoint', {
  param1: 'value1',
  param2: 'value2'
});
```

---

## 🧪 测试与验证

### 功能验证

项目包含完整的功能验证体系：

```bash
# 构建验证
npm run build
npm run type-check

# 开发服务器
npm run dev

# 生产预览
npm run preview
```

### 核心功能测试

| 功能模块 | 测试页面 | 验证内容 |
|---------|----------|----------|
| **AI服务** | `/test-ai` | AI模型调用、响应解析 |
| **认证系统** | `/auth-test` | 登录流程、权限验证 |
| **热点数据** | `/hot-topics` | 数据获取、实时更新 |
| **品牌库** | `/brand-library` | 数据管理、智能分析 |
| **内容提取** | `/extractor` | 多源提取、AI总结 |

### 自动化验证流程

系统内置多轮自动验证机制：

1. **构建检查**: TypeScript类型检查、ESLint代码规范
2. **功能测试**: AI调用、认证流程、数据获取
3. **性能监控**: 渲染性能、内存使用、响应时间
4. **错误处理**: 异常捕获、降级策略、用户反馈

### 开发调试

```bash
# 启用调试模式
VITE_DEBUG_MODE=true npm run dev

# 查看详细日志
VITE_LOG_LEVEL=debug npm run dev

# 性能分析
npm run build:analyze
```

### 质量保证

- ✅ **TypeScript严格模式**: 类型安全保障
- ✅ **ESLint规范检查**: 代码质量控制
- ✅ **统一错误处理**: 异常捕获和用户友好提示
- ✅ **性能监控**: 实时性能指标和优化建议
- ✅ **安全防护**: XSS防护、CSRF保护、数据加密

---

## 🤝 贡献指南

### 开发规范

#### 代码风格
- 使用 **ESLint** 和 **Prettier** 进行代码格式化
- 遵循 **TypeScript 严格模式**
- 组件使用 **PascalCase** 命名
- 文件使用 **camelCase** 命名
- 常量使用 **UPPER_SNAKE_CASE**

#### Git 提交规范
使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
perf: 性能优化
ci: CI/CD相关
```

**示例:**
```bash
feat(auth): 添加微信登录功能
fix(ui): 修复移动端布局问题
docs(api): 更新API文档
```

### 开发流程

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/wenpai.git
   cd wenpai
   git remote add upstream https://github.com/xiongtingping/wenpai.git
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **开发和测试**
   ```bash
   # 开发新功能
   npm run dev

   # 运行测试
   npm run test

   # 代码检查
   npm run lint
   ```

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写详细的描述
   - 等待代码审查

### 贡献类型

| 贡献类型 | 描述 | 标签 |
|----------|------|------|
| 🐛 **Bug 修复** | 修复现有功能的问题 | `bug` |
| ✨ **新功能** | 添加新的功能特性 | `enhancement` |
| 📚 **文档** | 改进项目文档 | `documentation` |
| 🎨 **UI/UX** | 改进用户界面和体验 | `ui/ux` |
| ⚡ **性能** | 性能优化相关 | `performance` |
| 🧪 **测试** | 添加或改进测试 | `testing` |

---

## 🚨 故障排除

### 常见问题解决

#### 1. 环境配置问题

**Q: AI API调用失败**
```bash
# 检查环境变量
echo $VITE_OPENAI_API_KEY | head -c 10

# 测试API连接
curl -H "Authorization: Bearer $VITE_OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

**解决方案:**
- 确保API密钥格式正确（OpenAI: `sk-`开头，DeepSeek: `sk-`开头）
- 检查API密钥余额和权限
- 验证网络连接和代理设置

#### 2. 认证系统问题

**Q: Authing登录失败**
```javascript
// 检查Guard配置
import { getAuthingConfig } from '@/config/authing';
console.log('Authing配置:', getAuthingConfig());
```

**解决方案:**
- 项目已预配置Authing，无需修改配置
- 检查回调地址是否正确配置
- 清除浏览器缓存和localStorage

#### 3. 热点数据获取失败

**Q: 热点话题无法加载**
```bash
# 测试热点API
curl https://api-hot.imsyy.top/weibo
```

**解决方案:**
- 检查网络连接
- 使用VPN或代理（如需要）
- 等待API服务恢复

#### 4. 构建和部署问题

**Q: TypeScript类型错误**
```bash
# 类型检查
npm run type-check

# 清理并重新构建
npm run clean && npm run build
```

**Q: Netlify部署失败**
```bash
# 检查构建日志
netlify logs

# 本地测试构建
npm run build && npm run preview
```

### 系统监控

#### 性能监控
- 内置性能监控组件，实时显示渲染性能
- 自动检测内存泄漏和无限循环
- Token使用统计和成本控制

#### 错误追踪
```javascript
// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
});

// React错误边界
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

#### 调试工具
```bash
# 开发环境调试
VITE_DEBUG_MODE=true npm run dev

# 查看系统状态
访问 /debug 页面

# 性能分析
npm run build:analyze
```

### 技术支持

如遇到无法解决的问题：

1. **查看控制台**: 检查浏览器开发者工具的错误信息
2. **检查网络**: 确认API请求是否正常发送和接收
3. **重启服务**: 停止开发服务器后重新启动
4. **清理缓存**: 清除浏览器缓存和node_modules
5. **提交Issue**: 在GitHub仓库提交详细的问题报告

---

## 🌟 项目亮点

### 技术创新

- **🔄 环境感知AI路由**: 自动根据环境选择最优AI调用方式
- **🛡️ 统一安全封装**: 所有API调用通过统一封装，确保安全性
- **⚡ 智能缓存机制**: 多层缓存策略，提升响应速度
- **🔍 实时性能监控**: 内置性能监控和自动优化建议
- **🎯 模块化架构**: 高度模块化设计，易于扩展和维护

### 用户体验

- **🎨 现代化UI**: 基于shadcn/ui的精美界面设计
- **📱 响应式设计**: 完美适配桌面端和移动端
- **🚀 快速加载**: 优化的构建配置，首屏加载时间<2秒
- **♿ 无障碍访问**: 完整的ARIA支持和键盘导航
- **🌙 主题切换**: 支持明暗主题自动切换

### 企业级特性

- **🔐 企业级认证**: 基于Authing的统一身份认证
- **👥 团队协作**: 支持多用户协作和权限管理
- **📊 数据分析**: 详细的使用统计和效果分析
- **🔄 自动备份**: 重要数据自动备份和恢复
- **🛠️ 可扩展架构**: 支持插件化扩展和自定义开发

## 📞 支持与联系

### 获取帮助

| 渠道 | 链接 | 用途 |
|------|------|------|
| 🚀 **在线体验** | [www.wenpai.xyz](https://www.wenpai.xyz) | 产品演示和试用 |
| 📖 **项目文档** | [GitHub Wiki](https://github.com/xiongtingping/wenpai/wiki) | 详细使用指南 |
| 🐛 **问题反馈** | [GitHub Issues](https://github.com/xiongtingping/wenpai/issues) | Bug报告和功能建议 |
| 💬 **社区讨论** | [GitHub Discussions](https://github.com/xiongtingping/wenpai/discussions) | 技术交流和经验分享 |
| 📧 **商务合作** | support@wenpai.xyz | 企业服务和定制开发 |

### 项目信息

- **GitHub仓库**: [xiongtingping/wenpai](https://github.com/xiongtingping/wenpai)
- **主要维护者**: [@xiongtingping](https://github.com/xiongtingping)
- **当前版本**: v2.0.0
- **最后更新**: 2025年1月

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

```
MIT License

Copyright (c) 2024 文派团队

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🎯 发展路线图

### 近期计划 (Q1 2025)

- [ ] **AI模型扩展**: 集成Claude、文心一言等更多AI模型
- [ ] **协作功能增强**: 实时协作编辑和评论系统
- [ ] **移动端优化**: PWA支持和移动端专用功能
- [ ] **API开放平台**: 提供开放API供第三方集成

### 中期目标 (Q2-Q3 2025)

- [ ] **企业版功能**: 私有化部署和企业级管理
- [ ] **插件生态**: 支持第三方插件和扩展
- [ ] **多语言支持**: 国际化和本地化
- [ ] **AI训练平台**: 支持用户自定义AI模型训练

### 长期愿景 (2025-2026)

- [ ] **智能创作助手**: 全流程AI辅助内容创作
- [ ] **内容生态平台**: 构建完整的内容创作生态
- [ ] **行业解决方案**: 针对不同行业的专业解决方案

---

<div align="center">

### 🌟 感谢支持

**如果这个项目对你有帮助，请给我们一个 Star！**

[![GitHub stars](https://img.shields.io/github/stars/xiongtingping/wenpai?style=social)](https://github.com/xiongtingping/wenpai/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/xiongtingping/wenpai?style=social)](https://github.com/xiongtingping/wenpai/network)
[![GitHub issues](https://img.shields.io/github/issues/xiongtingping/wenpai?style=social)](https://github.com/xiongtingping/wenpai/issues)

---

**Made with ❤️ by [文派团队](https://github.com/xiongtingping)**

*让内容创作更智能，让创意无限可能*

**🚀 立即体验**: [www.wenpai.xyz](https://www.wenpai.xyz)

</div>

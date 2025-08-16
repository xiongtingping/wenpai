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
- [🏗️ 架构设计与重构](#️-架构设计与重构)
- [🔧 配置说明](#-配置说明)
- [🚀 部署指南](#-部署指南)
- [📚 API 文档](#-api-文档)
- [🧪 测试与验证](#-测试与验证)
- [👨‍💻 开发者指南](#-开发者指南)
- [🤖 Augment代码助手与规则系统](#-augment代码助手与规则系统)
- [🤝 贡献指南](#-贡献指南)
- [🚨 故障排除](#-故障排除)
- [🌟 项目亮点](#-项目亮点)
- [🎯 发展路线图](#-发展路线图)
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
| **🧠 智能标题生成器** | 基于AI的多平台标题优化生成 | 语义分析、平台适配 |
| **🎯 自动化内容流** | 批量内容处理和自动化发布 | 工作流引擎、安全合规 |

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
| **Radix UI** | Latest | 无障碍UI基础组件 |
| **Lucide React** | 0.503.0 | 现代图标库 |

### 状态管理与路由

- **Zustand** - 轻量级状态管理
- **React Router v6** - 客户端路由
- **React Hook Form** - 表单状态管理
- **TanStack Table** - 高性能数据表格
- **Embla Carousel** - 轮播组件

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
- **智能提示词系统** - 模块化提示词管理
- **AI服务提供商适配** - 统一的AI调用接口

### 后端服务与集成

- **Netlify Functions** - 无服务器API
- **热点数据API** - 实时热点话题聚合
- **Creem支付** - 订阅和支付处理
- **MongoDB** - 数据存储（可选）
- **文件处理服务** - PDF、Word、Excel等格式支持
- **图像生成服务** - AI驱动的图像创作
- **自动化引擎** - 批量处理和工作流管理

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
│   ├── 📁 ai/                    # 新一代AI服务架构
│   │   ├── 📁 providers/         # AI服务提供商
│   │   │   ├── openai.ts         # OpenAI GPT-4o集成
│   │   │   └── deepseek.ts       # DeepSeek Chat集成
│   │   ├── 📁 prompts/           # 智能提示词系统
│   │   │   ├── brand.ts          # 品牌分析提示词
│   │   │   ├── titleGeneration.ts # 标题生成提示词
│   │   │   └── titleGenerationSystemPrompt.ts # 系统级提示词
│   │   ├── 📁 utils/             # AI工具函数
│   │   └── types.ts              # AI相关类型定义
│   ├── 📁 api/                   # API 服务层
│   │   ├── aiService.ts          # 统一AI服务核心
│   │   ├── unifiedAIService.ts   # 环境感知AI路由
│   │   ├── request.ts            # HTTP请求封装
│   │   ├── hotTopicsService.ts   # 热点话题API
│   │   ├── contentAdapter.ts     # 内容适配服务
│   │   ├── imageGenerationService.ts # 图像生成服务
│   │   ├── platformApiService.ts # 平台API服务
│   │   ├── 📁 providers/         # API提供商适配器
│   │   │   ├── openai.ts         # OpenAI API适配
│   │   │   └── deepseek.ts       # DeepSeek API适配
│   │   └── index.ts              # API统一导出
│   ├── 📁 components/            # React 组件
│   │   ├── 📁 ui/               # 基础UI组件 (shadcn/ui)
│   │   ├── 📁 auth/             # 认证相关组件
│   │   ├── 📁 creative/         # 创意工具组件
│   │   ├── 📁 landing/          # 落地页组件
│   │   ├── 📁 layout/           # 布局组件
│   │   ├── 📁 ai/               # AI功能组件
│   │   ├── 📁 analytics/        # 数据分析组件
│   │   ├── 📁 extractor/        # 内容提取组件
│   │   ├── 📁 hot-topics/       # 热点话题组件
│   │   ├── 📁 payment/          # 支付相关组件
│   │   ├── 📁 platform/         # 平台集成组件
│   │   ├── 📁 profile/          # 用户资料组件
│   │   ├── 📁 shared/           # 共享组件
│   │   ├── 📁 dialogs/          # 对话框组件
│   │   ├── 📁 error/            # 错误处理组件
│   │   └── 📁 dev/              # 开发调试组件
│   ├── 📁 automation/           # 自动化系统
│   │   ├── AutomationEngine.ts  # 自动化引擎
│   │   ├── SecurityCompliance.ts # 安全合规
│   │   ├── batchForward.ts      # 批量转发
│   │   └── 📁 adapters/         # 自动化适配器
│   ├── 📁 contexts/             # React Context
│   │   └── UnifiedAuthContext.tsx # 统一认证上下文
│   ├── 📁 features/             # 功能模块
│   │   └── 📁 titleGeneration/  # 标题生成系统
│   ├── 📁 pages/                # 页面组件
│   │   ├── HomePage.tsx         # 首页
│   │   ├── AdaptPage.tsx        # 内容适配页 (5399行)
│   │   ├── BrandLibraryPage.tsx # 品牌资料库 (3723行)
│   │   ├── HotTopicsPage.tsx    # 热点话题页 (2168行)
│   │   ├── ContentExtractorPage.tsx # 内容提取器
│   │   ├── CreativeCubePage.tsx # 九宫格创意魔方
│   │   ├── EmojiPage.tsx        # Emoji生成器
│   │   ├── BookmarkPage.tsx     # 智能收藏管理
│   │   ├── WechatTemplatePage.tsx # 朋友圈文案模板
│   │   ├── PaymentPage.tsx      # 支付页面
│   │   ├── ProfilePage.tsx      # 用户资料页
│   │   ├── SettingsPage.tsx     # 设置页面
│   │   └── ...                  # 其他页面 (90+个页面)
│   ├── 📁 prompts/              # AI提示词系统
│   │   └── PromptSystem.ts      # 统一提示词管理 (2245行)
│   ├── 📁 services/             # 业务服务
│   │   ├── tokenUsageService.ts # Token使用统计
│   │   ├── systemMonitorService.ts # 系统监控
│   │   ├── brandCorpusService.ts # 品牌语料库服务 (1257行)
│   │   ├── authService.ts       # 认证服务
│   │   ├── paymentService.ts    # 支付服务
│   │   ├── emojiService.ts      # Emoji服务
│   │   ├── fileFormatSupportService.ts # 文件格式支持
│   │   ├── webContentExtractor.ts # 网页内容提取
│   │   └── unifiedUsageService.ts # 统一使用统计
│   ├── 📁 stores/               # Zustand 状态管理
│   │   ├── authStore.ts         # 认证状态
│   │   ├── contentSyncStore.ts  # 内容同步状态
│   │   ├── favoritesStore.ts    # 收藏系统状态
│   │   └── tokenUsageStore.ts   # Token使用状态
│   ├── 📁 utils/                # 工具函数
│   │   ├── safeStringUtils.ts   # 安全字符串处理
│   │   ├── authingGuardSafeWrapper.ts # 认证安全包装
│   │   ├── userDataIsolation.ts # 用户数据隔离
│   │   ├── undefinedPreventionSystem.ts # undefined防护系统
│   │   ├── apiRequestQueue.ts   # API请求队列
│   │   ├── hashtagGenerator.ts  # 标签生成器
│   │   └── titleGenerationUtils.ts # 标题生成工具
│   ├── 📁 config/               # 配置文件
│   │   ├── authing.ts           # Authing认证配置
│   │   ├── platformLimits.ts    # 平台限制配置
│   │   ├── aiModels.ts          # AI模型配置
│   │   ├── subscriptionPlans.ts # 订阅计划配置
│   │   ├── contentForms.ts      # 内容形式配置
│   │   └── fileFormatConfig.ts  # 文件格式配置
│   ├── 📁 types/                # TypeScript 类型定义
│   │   ├── auth.ts              # 认证相关类型
│   │   ├── brand.ts             # 品牌相关类型
│   │   ├── subscription.ts      # 订阅相关类型
│   │   └── authing.d.ts         # Authing类型声明
│   ├── 📁 guards/               # 路由守卫
│   ├── 📁 hooks/                # 自定义Hook
│   ├── 📁 lib/                  # 核心库函数
│   ├── 📁 constants/            # 常量定义
│   └── 📁 styles/               # 样式文件
├── 📁 netlify/                  # Netlify Functions
│   └── 📁 functions/            # 服务端API函数
│       └── api.cjs              # 统一API代理
├── 📁 .augment/                 # Augment代码助手配置
│   └── 📁 rules/                # 开发规则与用户指南
│       ├── authing.md           # 认证系统保护规则
│       ├── 统一请求封装.md        # API调用规范
│       ├── 多轮测试.md           # 自动化验证要求
│       ├── 聚焦解决问题.md       # 问题解决原则
│       ├── 自动加载.md           # 规则自动加载
│       ├── 硬编码.md             # 配置管理规范
│       └── ...                  # 其他开发规则
└── 📄 配置文件
    ├── package.json             # 项目依赖
    ├── vite.config.ts           # Vite配置
    ├── tailwind.config.js       # Tailwind配置
    └── tsconfig.json            # TypeScript配置
```

---

## 🏗️ 架构设计与重构

### 📊 代码质量现状

项目当前包含一些大型组件文件，正在进行模块化重构：

| 文件名 | 当前行数 | 状态 | 重构计划 |
|--------|----------|------|----------|
| **AdaptPage.tsx** | 5,399行 | 🔄 计划重构 | 拆分为6个模块 |
| **BrandLibraryPage.tsx** | 3,723行 | ✅ 已修复JSX错误 | 拆分为5个模块 |
| **HotTopicsPage.tsx** | 2,168行 | 🔄 监控中 | 逐步优化 |
| **CreativeCube.tsx** | 2,622行 | 🔄 监控中 | 组件拆分 |
| **PromptSystem.ts** | 2,245行 | ✅ 功能完整 | 模块化提示词 |

### 🎯 重构原则

#### 安全第一
- ✅ **原文件备份**: 保留原始文件作为回退方案
- ✅ **渐进式重构**: 逐步替换，确保功能完整性
- ✅ **向后兼容**: 新接口兼容旧调用方式
- ✅ **回归保护**: 每次变更都有测试覆盖

#### 架构分层
- 🎨 **UI层**: 纯展示组件，无业务逻辑
- 🧠 **逻辑层**: 状态管理、业务逻辑Hook
- 🔌 **服务层**: API调用、数据处理

#### 模块化设计
```typescript
// 示例：AdaptPage重构后的结构
📁 src/pages/AdaptPage/
├── 📄 index.tsx                    (兼容入口)
├── 📄 AdaptPageNew.tsx             (新实现)
├── 📁 hooks/                       (逻辑层)
│   ├── useContentGeneration.ts     (内容生成)
│   └── usePlatformSettings.ts      (平台设置)
├── 📁 components/                  (UI层)
│   ├── PlatformSelector.tsx        (平台选择)
│   ├── ContentInput.tsx            (内容输入)
│   └── ResultsDisplay.tsx          (结果展示)
├── 📁 services/                    (服务层)
│   └── contentGenerationService.ts (API服务)
└── 📁 types/                       (类型定义)
    └── index.ts                    (统一类型)
```

### 🛡️ 质量保证

#### CI/CD质量门槛
- **构建检查**: TypeScript类型检查、ESLint规范
- **测试覆盖**: 单元测试覆盖率80%+
- **性能监控**: Bundle大小、加载时间监控
- **安全扫描**: 依赖漏洞检查、代码安全审计

#### 开发规范
- **代码审查**: 每个PR必须经过代码审查
- **测试先行**: 新功能必须包含测试用例
- **文档同步**: 代码变更同步更新文档
- **版本管理**: 语义化版本控制

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
VITE_AUTHING_DOMAIN=rzcswqs4sq0f.authing.cn
VITE_AUTHING_HOST=https://rzcswqs4sq0f.authing.cn
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

#### 5. Augment代码助手配置

项目集成了智能代码助手系统，自动加载开发规则：

##### 规则文件结构
```
📁 .augment/rules/
├── 📄 自动加载.md           # 规则自动加载机制
├── 📄 统一请求封装.md       # API调用规范
├── 📄 多轮测试.md           # 自动化验证要求
├── 📄 authing.md            # 认证系统保护
├── 📄 聚焦解决问题.md       # 问题解决原则
├── 📄 硬编码.md             # 配置管理规范
├── 📄 删除功能组件.md       # 功能保护规则
├── 📄 弹窗.md               # UI组件规范
└── 📄 ...                   # 其他开发规则
```

##### 规则自动加载
```typescript
// 系统启动时自动执行
async function loadAugmentRules() {
  const rulesPath = '.augment/rules/';
  const rules = await loadRulesFromDirectory(rulesPath);

  // 验证规则完整性
  validateRules(rules);

  // 应用到开发环境
  applyRulesToEnvironment(rules);

  console.log(`✅ 已加载 ${rules.length} 条开发规则`);
}
```

##### 用户自定义规则
开发者可以添加项目特定的规则：

```markdown
<!-- .augment/rules/custom-api-rule.md -->
---
type: "always_apply"
---
{
  "name": "API响应时间监控",
  "severity": "warning",
  "description": "所有API调用必须包含响应时间监控，超过3秒需要优化提示"
}
```

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

# 代码质量检查
npm run lint
npm run lint:fix

# 开发服务器
npm run dev

# 生产预览
npm run preview

# 部署到Netlify
npm run deploy:netlify

# 清理缓存
npm run clean
```

### 核心功能测试

| 功能模块 | 测试页面 | 验证内容 |
|---------|----------|----------|
| **AI服务** | `/ai-test` | AI模型调用、响应解析 |
| **认证系统** | `/auth-test` | 登录流程、权限验证 |
| **热点数据** | `/hot-topics` | 数据获取、实时更新 |
| **品牌库** | `/brand-library` | 数据管理、智能分析 |
| **内容提取** | `/extractor` | 多源提取、AI总结 |
| **支付系统** | `/payment-test` | 支付流程、订阅管理 |
| **Emoji生成** | `/emoji-test` | 图像生成、风格定制 |
| **自动化流程** | `/automation-test` | 批量处理、工作流 |

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

## 👨‍💻 开发者指南

### 🚀 快速上手

#### 开发环境设置
```bash
# 1. 克隆项目
git clone https://github.com/xiongtingping/wenpai.git
cd wenpai

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp env.example .env.local
# 编辑 .env.local，添加必要的API密钥

# 4. 启动开发服务器
npm run dev
```

#### 开发工具推荐
- **IDE**: VS Code + TypeScript插件
- **调试**: React Developer Tools
- **API测试**: 内置调试页面 `/ai-test`
- **性能分析**: `npm run build:analyze`

### 🏗️ 架构理解

#### 核心概念
1. **统一AI服务**: 所有AI调用通过 `aiService.ts` 统一管理
2. **环境感知路由**: 开发/生产环境自动选择最优调用方式
3. **用户数据隔离**: 企业级数据安全和隐私保护
4. **模块化组件**: 大型组件正在重构为小模块

#### 关键文件说明
```typescript
// 核心AI服务
src/api/aiService.ts          // 统一AI调用接口
src/api/unifiedAIService.ts   // 环境感知路由
src/prompts/PromptSystem.ts   // 提示词管理系统

// 认证系统
src/contexts/UnifiedAuthContext.tsx  // 统一认证上下文
src/config/authing.ts               // Authing配置

// 状态管理
src/stores/authStore.ts         // 认证状态
src/stores/contentSyncStore.ts  // 内容同步
src/stores/favoritesStore.ts    // 收藏系统
```

### 🤖 Augment代码助手与规则系统

#### 📋 规则系统概述

项目集成了 **Augment代码助手**，通过智能规则系统确保代码质量和开发规范。所有规则存储在 `.augment/rules/` 目录中，自动加载并应用于开发过程。

#### 🔧 核心规则类别

| 规则类型 | 文件 | 严重级别 | 描述 |
|---------|------|----------|------|
| **自动加载** | `自动加载.md` | Critical | 每次任务前必须加载规则与用户指南 |
| **统一封装** | `统一请求封装.md` | Error | 所有API调用必须通过统一封装 |
| **多轮测试** | `多轮测试.md` | Critical | 任务执行必须包含自动化验证流程 |
| **认证保护** | `authing.md` | Error | 禁止破坏Authing登录与认证系统 |
| **聚焦解决** | `聚焦解决问题.md` | Warning | 专注解决当前问题，避免过度重构 |
| **配置管理** | `硬编码.md` | Error | 禁止硬编码配置项，必须使用环境变量 |

#### 🛡️ 关键规则详解

##### 1. 自动加载规则 (Critical)
```json
{
  "name": "每次任务开始前必须加载规则与用户指南",
  "severity": "critical",
  "description": "Augment在执行任何任务前，必须先自动加载并应用当前项目的Rules与User Guidelines。如果规则未加载成功，必须中止任务并提醒用户配置。"
}
```

##### 2. 统一请求封装 (Error)
```typescript
// ✅ 正确：使用统一封装
import { request } from '@/api/request';
import { callAI } from '@/api/aiService';
import { useUnifiedAuth } from '@/hooks/useAuth';

// ❌ 错误：私自调用
// 禁止使用 fetch、axios.create() 或私自封装
```

##### 3. 多轮测试验证 (Critical)
```bash
# 必须执行的验证流程
npm run build      # 构建检查
npm run type-check # 类型检查
npm run test       # 单元测试
npm run dev        # 启动验证
# 至少3轮自动验证才能完成任务
```

##### 4. 聚焦解决问题 (Warning)
- ✅ 专注于解决当前用户提出的具体问题
- ❌ 不要在无关区域进行重构或优化
- ✅ 保留现有可用代码，仅在必要处修改
- ❌ 避免因重构而大面积替换原有逻辑

#### 🔄 规则自动应用

##### 开发流程中的自动检查
```bash
# 1. 任务开始前
✅ 自动加载 .augment/rules/ 中的所有规则
✅ 验证规则完整性和有效性
✅ 应用用户自定义指南

# 2. 代码修改时
✅ 实时检查是否违反规则
✅ 自动提示规范要求
✅ 阻止不符合规范的操作

# 3. 任务完成前
✅ 执行多轮自动验证
✅ 确保所有规则得到遵守
✅ 生成合规性报告
```

##### 规则违反处理
```typescript
// 示例：违反统一封装规则时的处理
if (detectDirectAPICall()) {
  throw new RuleViolationError({
    rule: "统一请求封装",
    severity: "error",
    message: "检测到直接API调用，请使用 request.ts 统一封装",
    suggestion: "import { request } from '@/api/request';"
  });
}
```

#### 📝 用户自定义规则

##### 添加新规则
```markdown
<!-- .augment/rules/custom-rule.md -->
---
type: "always_apply"
---
{
  "name": "自定义规则名称",
  "severity": "warning|error|critical",
  "description": "规则描述和要求"
}
```

##### 规则优先级
1. **Critical**: 阻断性规则，违反时中止任务
2. **Error**: 错误级规则，必须修复才能继续
3. **Warning**: 警告级规则，提示但不阻断

#### 🔍 规则监控与报告

##### 实时监控
- 📊 规则遵守率统计
- 🚨 违规行为实时告警
- 📈 代码质量趋势分析
- 🎯 团队规范执行情况

##### 合规性报告
```bash
# 生成规则遵守报告
npm run rules:check

# 输出示例
✅ 统一请求封装: 100% 遵守
✅ 认证系统保护: 100% 遵守
⚠️  聚焦解决问题: 85% 遵守 (3个警告)
❌ 硬编码检查: 发现2个违规项
```

### 🔧 开发规范

#### 代码规范
```typescript
// 组件命名：PascalCase
export function ContentGenerator() {}

// Hook命名：use开头
export function useContentGeneration() {}

// 服务命名：Service结尾
export class ContentGenerationService {}

// 类型命名：Interface/Type
interface ContentGenerationParams {}
type AIModel = 'gpt-4o' | 'deepseek-chat';
```

#### 文件组织
```
📁 新功能开发建议结构：
├── 📄 index.tsx              (主组件)
├── 📁 components/            (子组件)
├── 📁 hooks/                 (业务逻辑)
├── 📁 services/              (API服务)
├── 📁 types/                 (类型定义)
├── 📁 utils/                 (工具函数)
└── 📁 __tests__/             (测试文件)
```

#### API调用规范
```typescript
// ✅ 正确：使用统一AI服务
import { callAI } from '@/api/aiService';

const result = await callAI({
  prompt: "生成内容",
  taskType: AITaskType.CONTENT_GENERATION,
  model: "gpt-4o"
});

// ❌ 错误：直接调用AI API
// 禁止直接使用 fetch 或 axios 调用AI服务
```

### 🧪 测试指南

#### 测试类型
1. **单元测试**: Hook和工具函数
2. **组件测试**: UI组件渲染和交互
3. **集成测试**: 完整功能流程
4. **E2E测试**: 用户关键路径

#### 测试示例
```typescript
// Hook测试
import { renderHook } from '@testing-library/react';
import { useContentGeneration } from '../hooks/useContentGeneration';

test('should generate content', async () => {
  const { result } = renderHook(() => useContentGeneration());
  // 测试逻辑
});

// 组件测试
import { render, screen } from '@testing-library/react';
import { ContentGenerator } from '../ContentGenerator';

test('should render content generator', () => {
  render(<ContentGenerator />);
  expect(screen.getByText('生成内容')).toBeInTheDocument();
});
```

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

#### 5. Augment代码助手问题

**Q: 规则加载失败**
```bash
# 检查规则文件格式
find .augment/rules -name "*.md" -exec echo "检查文件: {}" \;

# 验证规则JSON格式
node -e "
const fs = require('fs');
const files = fs.readdirSync('.augment/rules');
files.forEach(file => {
  if (file.endsWith('.md')) {
    const content = fs.readFileSync(\`.augment/rules/\${file}\`, 'utf8');
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        JSON.parse(jsonMatch[0]);
        console.log(\`✅ \${file}: JSON格式正确\`);
      } catch (e) {
        console.log(\`❌ \${file}: JSON格式错误 - \${e.message}\`);
      }
    }
  }
});
"
```

**Q: 规则违反警告**
```bash
# 查看规则遵守情况
npm run rules:check

# 修复常见违规问题
npm run rules:fix

# 生成规则报告
npm run rules:report
```

**解决方案:**
- 确保所有规则文件使用正确的Markdown + JSON格式
- 检查规则的severity级别设置
- 验证规则描述的完整性和准确性
- 定期更新规则以适应项目发展

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
- **🧠 智能提示词系统**: 模块化提示词管理，支持动态组合
- **🔒 用户数据隔离**: 企业级数据安全和隐私保护
- **🚀 自动化工作流**: 批量处理和智能化内容生产流水线
- **🤖 智能代码助手**: Augment集成，自动加载规则和用户指南
- **📋 规则驱动开发**: 17+条开发规则，确保代码质量和规范性
- **🔄 多轮自动验证**: 构建、测试、部署全流程自动化验证

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
- **💰 灵活计费**: 基于Token使用的精确计费系统
- **🔧 开发友好**: 完整的开发工具和调试界面
- **📈 性能优化**: 自动化性能监控和优化建议

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
- **当前版本**: v2.1.0
- **最后更新**: 2025年8月
- **代码行数**: 90,000+ 行
- **组件数量**: 200+ 个
- **页面数量**: 90+ 个

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

- [x] **大型组件重构**: AdaptPage和BrandLibraryPage模块化重构
- [ ] **AI模型扩展**: 集成Claude、文心一言等更多AI模型
- [ ] **协作功能增强**: 实时协作编辑和评论系统
- [ ] **移动端优化**: PWA支持和移动端专用功能
- [ ] **API开放平台**: 提供开放API供第三方集成
- [ ] **测试覆盖提升**: 完善单元测试和E2E测试

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

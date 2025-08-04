# 文派 - 智能内容创作平台

<div align="center">

![文派 Logo](https://img.shields.io/badge/文派-智能内容创作平台-blue?style=for-the-badge)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**一个基于现代化技术栈的智能内容创作平台，支持多平台内容适配、AI辅助创作、团队协作等功能**

[🚀 在线体验](https://wenpai.netlify.app) | [📖 文档](./docs) | [🐛 问题反馈](https://github.com/xiongtingping/wenpai/issues)

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
| **AI智能创作** | 集成 GPT-4、DeepSeek、Gemini 等多种AI模型 | ✅ 已完成 |
| **品牌库管理** | 统一管理品牌资料，确保内容一致性 | ✅ 已完成 |
| **团队协作** | 支持团队管理、权限控制、邀请奖励 | ✅ 已完成 |

### 🆕 高级功能

- **🔖 网络信息收藏区**: 分类整理、标签管理、备注批注、使用状态跟踪
- **😊 Emoji图片生成器**: AI生成精美Emoji图片，支持下载、复制、收藏
- **📱 微信朋友圈文案模板**: 专业设计的文案模板，符合最佳展示字数
- **📄 内容抓取工具**: 支持多种格式内容提取和AI自动总结
- **🎨 创意工作室**: 九宫格创意魔方、文案管理、营销日历、代办事项
- **🔥 热点话题追踪**: 实时获取全网热点，助力内容创作
- **🤖 智能批量转发**: 自动化内容分发到多个平台

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

- **Authing** - 统一身份认证服务
- **JWT** - 安全令牌认证
- **HTTPS** - 全站加密传输

### AI 服务集成

- **OpenAI GPT-4** - 文本生成和对话
- **DeepSeek** - 中文优化的AI模型
- **Google Gemini** - 多模态AI能力

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
│   │   ├── ai.ts                 # AI服务统一接口
│   │   ├── request.ts            # HTTP请求封装
│   │   └── unifiedAIService.ts   # 环境感知AI服务
│   ├── 📁 components/            # React 组件
│   │   ├── 📁 ui/               # 基础UI组件 (shadcn/ui)
│   │   ├── 📁 auth/             # 认证相关组件
│   │   ├── 📁 creative/         # 创意工具组件
│   │   ├── 📁 landing/          # 落地页组件
│   │   └── 📁 layout/           # 布局组件
│   ├── 📁 contexts/             # React Context
│   │   └── UnifiedAuthContext.tsx # 统一认证上下文
│   ├── 📁 hooks/                # 自定义 Hooks
│   ├── 📁 pages/                # 页面组件
│   │   ├── HomePage.tsx         # 首页
│   │   ├── AdaptPage.tsx        # 内容适配页
│   │   ├── CreativeStudioPage.tsx # 创意工作室
│   │   └── ...                  # 其他页面
│   ├── 📁 stores/               # Zustand 状态管理
│   │   ├── authStore.ts         # 认证状态
│   │   ├── contentSyncStore.ts  # 内容同步状态
│   │   └── favoritesStore.ts    # 收藏系统状态
│   ├── 📁 utils/                # 工具函数
│   │   ├── safeStringUtils.ts   # 安全字符串处理
│   │   └── titleGenerationUtils.ts # 标题生成工具
│   ├── 📁 config/               # 配置文件
│   │   ├── authing.ts           # Authing认证配置
│   │   └── platformLimits.ts    # 平台限制配置
│   └── 📁 types/                # TypeScript 类型定义
├── 📁 netlify/                  # Netlify Functions
│   └── 📁 functions/            # 服务端API函数
├── 📁 docs/                     # 项目文档
├── 📁 tests/                    # 测试文件
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
VITE_DEEPSEEK_API_KEY=sk-your-deepseek-api-key  
VITE_GEMINI_API_KEY=your-gemini-api-key

# ===========================================
# Authing 认证配置
# ===========================================
VITE_AUTHING_APP_ID=your-authing-app-id
VITE_AUTHING_DOMAIN=your-authing-domain.authing.cn
VITE_AUTHING_HOST=https://your-authing-domain.authing.cn

# ===========================================
# 应用配置
# ===========================================
VITE_API_BASE_URL=https://your-api-domain.com
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info

# ===========================================
# 支付配置 (可选)
# ===========================================
VITE_CREEM_API_KEY=your-creem-api-key
```

### Authing 认证配置步骤

1. **注册 Authing 账号**
   - 访问 [Authing 控制台](https://console.authing.cn)
   - 注册并创建新应用

2. **配置应用信息**
   ```
   应用名称: 文派智能内容创作平台
   应用类型: 单页Web应用
   认证地址: https://your-domain.authing.cn
   ```

3. **设置回调地址**
   ```
   开发环境: http://localhost:5173/callback
   生产环境: https://your-domain.com/callback
   ```

4. **获取配置信息**
   - App ID: 在应用概览页面获取
   - 认证域名: your-domain.authing.cn

### AI 服务配置

| 服务商 | 获取方式 | 用途 |
|--------|----------|------|
| **OpenAI** | [OpenAI Platform](https://platform.openai.com) | GPT-4 文本生成 |
| **DeepSeek** | [DeepSeek Platform](https://platform.deepseek.com) | 中文优化AI |
| **Google Gemini** | [Google AI Studio](https://makersuite.google.com) | 多模态AI |

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

### 认证 API

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "nickname": "用户昵称"
    }
  }
}
```

#### 获取用户信息
```http
GET /api/auth/user
Authorization: Bearer <token>
```

### AI 服务 API

#### 内容生成
```http
POST /api/ai/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "prompt": "写一篇关于人工智能的文章",
  "platform": "wechat",
  "model": "gpt-4",
  "maxTokens": 1000
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "content": "生成的内容...",
    "charCount": 856,
    "platform": "wechat",
    "model": "gpt-4"
  }
}
```

#### 智能标题生成
```http
POST /api/ai/title
Content-Type: application/json

{
  "content": "文章内容...",
  "platform": "xiaohongshu",
  "count": 5,
  "style": "吸引眼球"
}
```

### 平台适配 API

#### 获取平台限制
```http
GET /api/platforms/limits
```

**响应:**
```json
{
  "wechat": {
    "maxChars": 2000,
    "supportRichText": true,
    "recommendedChars": 800
  },
  "xiaohongshu": {
    "maxChars": 1000,
    "supportHashtags": true,
    "recommendedChars": 500
  }
}
```

---

## 🧪 测试

### 运行测试

```bash
# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage

# 监听模式
npm run test:watch
```

### 测试结构

```
tests/
├── unit/                 # 单元测试
│   ├── components/       # 组件测试
│   ├── utils/           # 工具函数测试
│   └── api/             # API测试
├── integration/         # 集成测试
├── e2e/                # 端到端测试
└── fixtures/           # 测试数据
```

### 测试示例

```typescript
// 组件测试示例
import { render, screen } from '@testing-library/react'
import { AdaptPage } from '@/pages/AdaptPage'

describe('AdaptPage', () => {
  it('should render platform selector', () => {
    render(<AdaptPage />)
    expect(screen.getByText('选择目标平台')).toBeInTheDocument()
  })
})

// API测试示例
import { callAI } from '@/api/ai'

describe('AI API', () => {
  it('should generate content successfully', async () => {
    const result = await callAI({
      prompt: 'Test prompt',
      model: 'gpt-4'
    })
    expect(result.success).toBe(true)
    expect(result.content).toBeDefined()
  })
})
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

#### 1. 启动问题

**Q: 端口占用错误**
```bash
Error: listen EADDRINUSE: address already in use :::5173
```
**解决方案:**
```bash
# 方法1: 更改端口
npm run dev -- --port 3000

# 方法2: 杀死占用进程
lsof -ti:5173 | xargs kill -9
```

**Q: 依赖安装失败**
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 2. 认证问题

**Q: Authing 认证失败**
```bash
# 检查配置
npm run check-authing-config

# 验证回调地址
curl -I https://your-domain.authing.cn/api/v2/applications/your-app-id
```

**Q: Token 过期**
```javascript
// 自动刷新token
const { refreshToken } = useUnifiedAuth()
await refreshToken()
```

#### 3. AI API 问题

**Q: API 调用失败**
```bash
# 测试API连接
npm run test-ai-api

# 检查API密钥
node -e "console.log(process.env.VITE_OPENAI_API_KEY?.slice(0,10))"
```

**Q: 请求频率限制**
```javascript
// 使用请求队列
import { apiRequestQueue } from '@/utils/apiRequestQueue'
const result = await apiRequestQueue.add(() => callAI(params))
```

#### 4. 构建问题

**Q: TypeScript 类型错误**
```bash
# 类型检查
npm run type-check

# 生成类型定义
npm run build:types
```

**Q: 内存不足**
```bash
# 增加内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 调试工具

#### 开发环境调试
```bash
# 启用调试模式
VITE_DEBUG_MODE=true npm run dev

# 查看详细日志
VITE_LOG_LEVEL=debug npm run dev
```

#### 生产环境监控
- 访问 `/debug` 页面查看系统状态
- 使用 `npm run check-status` 检查健康状态
- 查看 Netlify Functions 日志

#### 性能分析
```bash
# 构建分析
npm run build:analyze

# 性能测试
npm run test:performance
```

---

## 📞 支持与联系

### 获取帮助

| 渠道 | 链接 | 用途 |
|------|------|------|
| 📖 **文档** | [项目文档](./docs) | 详细使用指南 |
| 🐛 **问题反馈** | [GitHub Issues](https://github.com/xiongtingping/wenpai/issues) | Bug报告和功能建议 |
| 💬 **讨论** | [GitHub Discussions](https://github.com/xiongtingping/wenpai/discussions) | 社区讨论 |
| 📧 **邮箱** | support@wenpai.com | 商务合作 |

### 社区

- **GitHub**: [@xiongtingping](https://github.com/xiongtingping)
- **在线演示**: [wenpai.netlify.app](https://wenpai.netlify.app)
- **更新日志**: [CHANGELOG.md](./CHANGELOG.md)

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

<div align="center">

### 🌟 感谢支持

**如果这个项目对你有帮助，请给我们一个 Star！**

[![GitHub stars](https://img.shields.io/github/stars/xiongtingping/wenpai?style=social)](https://github.com/xiongtingping/wenpai/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/xiongtingping/wenpai?style=social)](https://github.com/xiongtingping/wenpai/network)

---

**Made with ❤️ by [文派团队](https://github.com/xiongtingping)**

*让内容创作更智能，让创意无限可能*

</div>

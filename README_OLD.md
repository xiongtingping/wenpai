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

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🌐 部署

### Netlify 部署

1. **自动部署** (推荐)
   - Fork 本仓库到你的 GitHub 账户
   - 在 [Netlify](https://netlify.com) 中连接你的 GitHub 仓库
   - 设置构建命令: `npm run build`
   - 设置发布目录: `dist`
   - 点击部署

2. **手动部署**
   ```bash
   # 安装 Netlify CLI
   npm install -g netlify-cli
   
   # 构建并部署
   npm run deploy:netlify
   ```

3. **环境变量配置**
   在 Netlify 控制台中设置以下环境变量:
   ```
   VITE_AUTHING_APP_ID=你的Authing应用ID
   VITE_AUTHING_HOST=你的Authing域名
   ```

### 其他平台部署

- **Vercel**: 支持自动部署，配置 `vercel.json`
- **GitHub Pages**: 使用 GitHub Actions 自动部署
- **服务器**: 使用 Nginx 或 Apache 部署 `dist` 目录

## 🔧 配置

### 快速配置

我们提供了便捷的配置工具来帮助您快速设置项目：

```bash
# 检查当前配置状态
./check-deployment-config.sh

# 快速配置环境变量
./setup-deployment-config.sh
```

### 必需配置

项目需要以下必需的环境变量：

```env
# OpenAI API配置（必需）
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key

# Authing认证配置（必需）
VITE_AUTHING_APP_ID=688237f7f9e118de849dc274
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_PROD=https://your-domain.com/callback
```

### 可选配置

```env
# DeepSeek API配置（可选）
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key

# Gemini API配置（可选）
VITE_GEMINI_API_KEY=your-actual-gemini-api-key

# Creem支付API配置（可选）
VITE_CREEM_API_KEY=creem_your-actual-creem-api-key

# 后端API配置（可选）
VITE_API_BASE_URL=https://your-domain.com/api
```

### 配置验证

部署完成后，访问 `/api-config-test` 页面验证配置是否正确。

### 详细配置指南

查看以下文档获取详细配置说明：
- [部署环境API配置指南](DEPLOYMENT_API_CONFIG_GUIDE.md)
- [API配置最终总结](API_CONFIG_FINAL_SUMMARY.md)

## 📱 功能页面

- **首页**: `/` - 产品介绍和功能导航
- **内容适配**: `/adapt` - 多平台内容适配工具
- **品牌库**: `/brand-library` - 品牌资料管理
- **热点话题**: `/hot-topics` - 实时热点话题分析
- **收藏夹**: `/bookmarks` - 网络信息收藏管理
- **Emoji图片**: `/emojis` - AI生成Emoji图片库
- **朋友圈模板**: `/wechat-templates` - 微信朋友圈文案模板
- **创意工作室**: `/creative-studio` - 综合创意管理工具
- **内容抓取**: `/content-extractor` - 内容提取和AI总结
- **个人中心**: `/profile` - 用户信息和设置
- **配置测试**: `/api-config-test` - API配置状态验证

## 🛠️ 配置工具

### 自动化脚本
- **`setup-deployment-config.sh`** - 交互式配置脚本，支持多种部署平台
- **`check-deployment-config.sh`** - 配置状态检查脚本

### 配置文档
- **`DEPLOYMENT_API_CONFIG_GUIDE.md`** - 详细部署配置指南
- **`API_CONFIG_FINAL_SUMMARY.md`** - API配置系统总结
- **`API_KEYS_CONFIG.md`** - API密钥配置说明

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Authing](https://authing.cn) - 统一身份认证服务
- [shadcn/ui](https://ui.shadcn.com) - 优秀的设计系统
- [Tailwind CSS](https://tailwindcss.com) - 实用优先的CSS框架
- [Vite](https://vitejs.dev) - 下一代前端构建工具

## 📞 联系我们

- 项目地址: [https://github.com/xiongtingping/wenpai](https://github.com/xiongtingping/wenpai)
- 在线演示: [https://wenpai.netlify.app](https://wenpai.netlify.app)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
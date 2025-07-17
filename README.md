# 文派 - 智能内容创作平台

一个基于 React + TypeScript + Authing 的现代化内容创作平台，支持多平台内容适配、AI辅助创作、团队协作等功能。

## 🚀 功能特性

### 核心功能
- **多平台内容适配**: 一键适配微信公众号、小红书、知乎、抖音等平台
- **AI智能创作**: 集成多种AI模型，智能生成标题、内容、配图
- **品牌库管理**: 统一管理品牌资料，确保内容一致性
- **团队协作**: 支持团队管理、权限控制、邀请奖励

### 新增功能模块
- **网络信息收藏区**: 分类整理、标签管理、备注批注、使用状态跟踪
- **Emoji图片区**: AI生成精美Emoji图片，支持下载、复制、收藏
- **微信朋友圈文案模板**: 专业设计的文案模板，符合最佳展示字数
- **内容抓取工具**: 支持多种格式内容提取和AI自动总结
- **创意工作室**: 九宫格创意魔方、文案管理、营销日历、代办事项

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI组件**: shadcn/ui + Tailwind CSS
- **认证**: Authing 统一身份认证
- **状态管理**: Zustand
- **路由**: React Router v6
- **图标**: Lucide React + React Icons

## 📦 安装和运行

### 本地开发

```bash
# 克隆项目
git clone https://github.com/xiongtingping/wenpai.git
cd wenpai

# 安装依赖
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
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
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
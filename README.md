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

### Authing 配置

1. 在 [Authing 控制台](https://console.authing.cn) 创建应用
2. 复制应用 ID 和域名
3. 在 `src/config/authing.ts` 中配置:

```typescript
export const getAuthingConfig = () => ({
  appId: import.meta.env.VITE_AUTHING_APP_ID || 'your-app-id',
  host: import.meta.env.VITE_AUTHING_HOST || 'https://your-domain.authing.cn'
});
```

### 环境变量

创建 `.env.local` 文件:

```env
VITE_AUTHING_APP_ID=your-authing-app-id
VITE_AUTHING_HOST=https://your-domain.authing.cn
```

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
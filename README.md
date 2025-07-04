# 文派AI内容适配器

一个智能的内容适配工具，帮助您将内容适配到不同的平台和格式。

## 功能特性

- 🤖 支持多种AI模型（OpenAI、DeepSeek、Gemini）
- 📝 智能内容适配和优化
- 🎨 现代化UI设计
- 📱 响应式设计
- ⚡ 快速部署

## 技术栈

- **前端**: React + TypeScript + Vite
- **UI**: Radix UI + Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router
- **部署**: Netlify

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 部署到Netlify

### 自动部署

1. 访问 [Netlify](https://app.netlify.com/signup/start/connect/repos/xiongtingping%2Fwenpaiai626)
2. 点击 "Connect to Git"
3. 选择 GitHub 仓库 `xiongtingping/wenpaiai626`
4. 配置部署设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. 点击 "Deploy site"

### 环境变量配置

在Netlify控制台中配置以下环境变量：

- `OPENAI_API_KEY` - OpenAI API密钥
- `DEEPSEEK_API_KEY` - DeepSeek API密钥
- `GEMINI_API_KEY` - Gemini API密钥

### 手动部署

如果您想手动部署：

```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 登录Netlify
netlify login

# 部署
netlify deploy --prod
```

## 项目结构

```
wenpaiai626/
├── src/                    # 源代码
│   ├── components/         # React组件
│   ├── pages/             # 页面组件
│   ├── api/               # API服务
│   ├── store/             # 状态管理
│   └── lib/               # 工具函数
├── netlify/               # Netlify配置
│   └── functions/         # Netlify函数
├── public/                # 静态资源
├── dist/                  # 构建输出
├── netlify.toml           # Netlify配置
└── package.json           # 项目配置
```

## API端点

- `/api/basic` - 基本测试API
- `/api/proxy/openai` - OpenAI代理
- `/api/status/openai` - OpenAI状态检查

## 许可证

MIT License
# 文派 - 部署指南

## 🚀 快速部署到Netlify

### 方法一：拖拽部署（推荐）

1. **构建项目**
   ```bash
   npm install
   npm run build
   ```

2. **访问Netlify**
   - 打开 https://app.netlify.com/
   - 点击 "Add new site" → "Deploy manually"
   - 将 `dist` 文件夹拖拽到部署区域

3. **配置环境变量**
   - 在Netlify控制台中，进入 Site settings → Environment variables
   - 添加以下环境变量：
     - `OPENAI_API_KEY`: 你的OpenAI API密钥
     - `DEEPSEEK_API_KEY`: 你的DeepSeek API密钥
     - `GEMINI_API_KEY`: 你的Gemini API密钥

4. **部署Netlify函数**
   - 将 `netlify/functions/api.js` 文件上传到Netlify Functions
   - 或者通过Git连接自动部署

### 方法二：Git连接部署

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Netlify"
   git push origin main
   ```

2. **连接Netlify**
   - 在Netlify中点击 "Add new site" → "Import an existing project"
   - 选择你的GitHub仓库
   - 配置构建设置：
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Functions directory: `netlify/functions`

3. **配置环境变量**
   - 同上

### 方法三：使用Netlify CLI

1. **安装CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录和部署**
   ```bash
   netlify login
   netlify deploy --dir=dist --prod
   ```

## 🔧 环境变量配置

### 必需的API密钥

| 变量名 | 描述 | 获取地址 |
|--------|------|----------|
| `OPENAI_API_KEY` | OpenAI API密钥 | https://platform.openai.com/api-keys |
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | https://platform.deepseek.com/ |
| `GEMINI_API_KEY` | Google Gemini API密钥 | https://makersuite.google.com/app/apikey |

### 可选配置

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 环境模式 | `production` |
| `NODE_VERSION` | Node.js版本 | `18` |

## 📁 项目结构

```
wenpaiai626/
├── dist/                    # 构建输出目录
├── netlify/
│   └── functions/
│       └── api.js          # Netlify函数
├── src/                    # 源代码
├── netlify.toml           # Netlify配置
├── package.json           # 项目配置
└── vite.config.ts         # Vite配置
```

## 🧪 测试部署

部署完成后，可以访问以下页面进行测试：

- 主页: `https://your-site.netlify.app/`
- 测试页面: `https://your-site.netlify.app/test-deploy.html`
- API测试: `https://your-site.netlify.app/api-test`

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查Node.js版本是否为18.x
   - 确保所有依赖已安装
   - 查看构建日志

2. **API调用失败**
   - 确认环境变量已正确设置
   - 检查Netlify函数是否已部署
   - 验证API密钥是否有效

3. **页面404错误**
   - 确认重定向规则已配置
   - 检查React Router配置

### 调试步骤

1. 检查Netlify部署日志
2. 测试API端点: `/.netlify/functions/api`
3. 查看浏览器控制台错误
4. 验证环境变量设置

## 📞 支持

如果遇到问题，请：

1. 检查部署日志
2. 验证环境变量配置
3. 测试API连接
4. 查看浏览器控制台错误信息

---

**注意**: 确保API密钥的安全性，不要在代码中硬编码密钥。 
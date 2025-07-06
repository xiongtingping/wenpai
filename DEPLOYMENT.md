# 文派部署指南

## Netlify 部署详细步骤

### 1. 准备工作

确保你的项目已经推送到 GitHub 仓库，并且构建通过：

```bash
npm run build
```

### 2. Netlify 自动部署

#### 方法一：通过 Netlify 控制台

1. 访问 [Netlify](https://netlify.com) 并注册/登录
2. 点击 "New site from Git"
3. 选择 GitHub 并授权
4. 选择你的 `wenpai` 仓库
5. 配置构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. 点击 "Deploy site"

#### 方法二：通过 Netlify CLI

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录 Netlify
netlify login

# 初始化项目
netlify init

# 部署到生产环境
npm run deploy:netlify
```

### 3. 环境变量配置

在 Netlify 控制台中设置以下环境变量：

1. 进入你的站点设置
2. 点击 "Environment variables"
3. 添加以下变量：

```
VITE_AUTHING_APP_ID=你的Authing应用ID
VITE_AUTHING_HOST=https://你的域名.authing.cn
```

### 4. 域名配置

#### 自定义域名

1. 在 Netlify 控制台进入 "Domain settings"
2. 点击 "Add custom domain"
3. 输入你的域名
4. 按照提示配置 DNS 记录

#### HTTPS 配置

Netlify 会自动为你的站点配置 HTTPS 证书。

### 5. 部署验证

部署完成后，访问你的 Netlify 站点 URL，验证以下功能：

- ✅ 首页正常加载
- ✅ 登录/注册功能正常
- ✅ 多平台内容适配功能
- ✅ 新增的收藏夹、Emoji、朋友圈模板功能
- ✅ 响应式设计在不同设备上的表现

### 6. 持续部署

Netlify 会自动监听你的 GitHub 仓库变化：

- 每次推送到 `main` 分支会自动触发部署
- 可以设置分支部署预览
- 支持回滚到之前的版本

## 其他部署平台

### Vercel 部署

1. 访问 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. 配置构建命令：`npm run build`
4. 配置输出目录：`dist`
5. 设置环境变量
6. 点击部署

### GitHub Pages 部署

1. 在仓库设置中启用 GitHub Pages
2. 选择 `gh-pages` 分支作为源
3. 配置 GitHub Actions 自动构建和部署

### 服务器部署

1. 构建项目：`npm run build`
2. 将 `dist` 目录上传到服务器
3. 配置 Nginx 或 Apache
4. 设置反向代理处理 API 请求

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本（需要 18.x）
   - 确保所有依赖已安装
   - 检查 TypeScript 编译错误

2. **环境变量未生效**
   - 确保变量名以 `VITE_` 开头
   - 重新部署站点
   - 清除浏览器缓存

3. **路由问题**
   - 确保配置了 SPA 重定向规则
   - 检查 `netlify.toml` 中的 redirects 配置

4. **API 请求失败**
   - 检查 CORS 配置
   - 验证 API 端点是否正确
   - 检查网络连接

### 性能优化

1. **启用缓存**
   - 静态资源设置长期缓存
   - 启用 Gzip 压缩
   - 使用 CDN 加速

2. **代码分割**
   - 启用动态导入
   - 配置路由懒加载
   - 优化包大小

3. **监控和分析**
   - 集成 Google Analytics
   - 使用 Netlify Analytics
   - 监控错误和性能

## 维护和更新

### 定期维护

1. **依赖更新**
   ```bash
   npm update
   npm audit fix
   ```

2. **安全检查**
   - 定期检查安全漏洞
   - 更新依赖包
   - 审查第三方库

3. **性能监控**
   - 监控页面加载速度
   - 检查 Core Web Vitals
   - 优化用户体验

### 版本管理

1. **语义化版本**
   - 遵循 SemVer 规范
   - 记录更新日志
   - 标记重要版本

2. **回滚策略**
   - 保留多个版本
   - 快速回滚机制
   - 数据备份

## 联系支持

如果在部署过程中遇到问题，可以：

1. 查看 [Netlify 文档](https://docs.netlify.com)
2. 提交 GitHub Issue
3. 联系技术支持

---

部署完成后，你的文派平台就可以在互联网上访问了！🎉 
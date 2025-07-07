# 部署检查清单

## ✅ 本地构建检查

- [x] TypeScript 编译无错误
- [x] Vite 构建成功
- [x] 构建文件生成正常
- [x] 代码已推送到 GitHub

## 🔧 Netlify 部署配置

### 1. 基本配置
- [ ] 连接 GitHub 仓库：`xiongtingping/wenpai`
- [ ] 选择分支：`restore-caa083d` 或 `main`
- [ ] 构建命令：`npm run build`
- [ ] 发布目录：`dist`

### 2. 环境变量配置
在 Netlify 控制台 → Site settings → Environment variables 中添加：

```
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback
```

### 3. 域名配置
- [x] 记录 Netlify 分配的域名：`https://www.wenpai.xyz`
- [x] 配置自定义域名：`www.wenpai.xyz`

## 🔐 Authing 配置检查

### 1. Authing 控制台配置
登录 [Authing 控制台](https://console.authing.cn/)，在应用配置中添加：

**登录回调 URL：**
```
https://www.wenpai.xyz/callback
```

**登出回调 URL：**
```
https://www.wenpai.xyz
```

### 2. 应用配置
- [ ] 应用类型：单页应用 (SPA)
- [ ] 应用状态：已启用
- [ ] 域名白名单：包含你的 Netlify 域名

## 🧪 功能测试清单

### 1. 基础功能测试
- [ ] 访问首页：`https://www.wenpai.xyz/`
- [ ] 页面加载正常
- [ ] 样式显示正确
- [ ] 路由跳转正常

### 2. Authing 登录测试
- [ ] 访问登录页：`https://www.wenpai.xyz/authing-login`
- [ ] Authing Guard 组件正常显示
- [ ] 点击登录按钮
- [ ] 跳转到 Authing 登录页面
- [ ] 输入用户名密码登录
- [ ] 成功跳转回 `/callback` 页面
- [ ] 自动跳转到首页
- [ ] 用户信息正确显示

### 3. 受保护路由测试
- [ ] 未登录时访问 `/adapt`
- [ ] 自动重定向到登录页面
- [ ] 登录后访问 `/adapt`
- [ ] 正常显示页面内容
- [ ] 用户头像显示正确
- [ ] 登出功能正常

### 4. 认证测试页面
- [ ] 访问：`https://www.wenpai.xyz/auth-test`
- [ ] 显示认证状态
- [ ] 显示用户信息
- [ ] 功能测试按钮正常

## 🐛 常见问题排查

### 1. 构建失败
- [ ] 检查 Node.js 版本（需要 18.x）
- [ ] 检查环境变量配置
- [ ] 查看 Netlify 构建日志

### 2. 登录失败
- [ ] 检查 Authing AppID 是否正确
- [ ] 检查 Authing 域名配置
- [ ] 检查回调地址是否匹配
- [ ] 查看浏览器控制台错误

### 3. 回调失败
- [ ] 检查 Authing 控制台回调地址配置
- [ ] 确认 Netlify 域名正确
- [ ] 检查 HTTPS 协议

### 4. 页面显示异常
- [ ] 清除浏览器缓存
- [ ] 检查 CSS/JS 文件加载
- [ ] 查看网络请求状态

## 📱 移动端测试

- [ ] 手机浏览器访问
- [ ] 响应式布局正常
- [ ] 触摸操作正常
- [ ] 登录流程正常

## 🔍 性能检查

- [ ] 页面加载速度
- [ ] 图片和资源加载
- [ ] 首次内容绘制 (FCP)
- [ ] 最大内容绘制 (LCP)

## 📊 监控配置

### 1. Netlify 监控
- [ ] 启用构建通知
- [ ] 配置部署钩子
- [ ] 监控站点状态

### 2. Authing 监控
- [ ] 查看登录日志
- [ ] 监控异常登录
- [ ] 检查用户活跃度

## 🚀 优化建议

1. **性能优化**
   - 启用 Netlify 的图片优化
   - 配置 CDN 缓存
   - 启用 Gzip 压缩

2. **安全优化**
   - 配置 CSP 头
   - 启用 HSTS
   - 配置安全头

3. **SEO 优化**
   - 配置 meta 标签
   - 添加 sitemap
   - 配置 robots.txt

## 📞 技术支持

如果遇到问题，可以：
1. 查看 Netlify 构建日志
2. 检查浏览器开发者工具
3. 查看 Authing 控制台日志
4. 联系技术支持

---

**部署完成后，请按照此清单逐一检查，确保所有功能正常运行。** 
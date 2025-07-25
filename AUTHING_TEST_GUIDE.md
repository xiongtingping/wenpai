# Authing Guard 弹窗模式测试指南

## 测试目标

验证 Authing Guard 弹窗模式是否正常工作，特别是解决密码框焦点跳转问题。

## 测试页面

我们创建了三个测试页面，使用不同的加载方式：

### 1. 简化测试页面
- **地址**: `http://localhost:5179/test-authing-simple.html`
- **特点**: 使用动态导入，尝试多种 CDN
- **适用**: 快速测试基本功能

### 2. 本地包测试页面
- **地址**: `http://localhost:5179/test-authing-local.html`
- **特点**: 优先使用本地 node_modules 中的包
- **适用**: 测试本地安装的 Authing Guard

### 3. UMD 版本测试页面
- **地址**: `http://localhost:5179/test-authing-umd.html`
- **特点**: 使用 UMD 版本，兼容性最好
- **适用**: 最稳定的测试方式

### 4. 正确路径测试页面
- **地址**: `http://localhost:5179/test-authing-correct.html`
- **特点**: 使用正确的本地包路径和 CDN 版本
- **适用**: 测试本地安装的包和 CDN 加载

### 5. 最终测试页面
- **地址**: `http://localhost:5179/test-authing-final.html`
- **特点**: 使用 UMD 版本和完整的 CSS 样式
- **适用**: 最完整的测试体验

## 测试步骤

### 准备工作
1. 确保开发服务器正在运行: `npm run dev`
2. 确保服务器端口为 5179（或其他可用端口）

### 基本功能测试
1. 打开任意一个测试页面
2. 点击"显示登录弹窗"按钮
3. 观察弹窗是否正常显示
4. 检查调试信息是否显示"Guard 初始化成功"

### 密码框焦点测试
1. 在登录弹窗中点击密码输入框
2. **关键测试**: 确认焦点停留在密码框，不会跳转到账号输入框
3. 尝试输入密码，确认可以正常输入

### 登录流程测试
1. 输入有效的账号密码
2. 点击登录按钮
3. 观察弹窗是否在登录成功后自动关闭
4. 检查状态信息是否更新为"检测到登录成功"

### 状态检查测试
1. 点击"检查状态"按钮
2. 确认状态信息正确显示
3. 点击"隐藏登录弹窗"按钮
4. 确认弹窗正常隐藏

## 预期结果

### ✅ 正常情况
- 弹窗正常显示和隐藏
- 密码框焦点正常，不会跳转
- 登录成功后弹窗自动关闭
- 状态信息正确更新
- 调试信息显示详细过程

### ❌ 异常情况
- 弹窗无法显示
- 密码框点击后跳转到账号框
- 登录成功后弹窗不关闭
- 状态信息不更新
- 调试信息显示错误

## 问题排查

### 如果弹窗无法显示
1. 检查浏览器控制台是否有错误信息
2. 确认网络连接正常
3. 尝试不同的测试页面
4. 检查 Authing 配置是否正确

### 如果密码框仍然跳转
1. 确认配置中 `mode: 'modal'` 已设置
2. 检查 `skipComplateFileds: false` 配置
3. 确认 `skipComplateFiledsPlace: 'modal'` 配置
4. 尝试清除浏览器缓存

### 如果登录后弹窗不关闭
1. 检查定期状态检查是否正常工作
2. 确认 `guard.hide()` 方法被正确调用
3. 检查登录状态检查逻辑

## 配置验证

确保 Authing 配置包含以下关键参数：

```javascript
const config = {
    appId: '688237f7f9e118de849dc274',
    host: 'https://qutkgzkfaezk-demo.authing.cn',
    redirectUri: `${window.location.origin}/callback`,
    mode: 'modal', // 关键：弹窗模式
    defaultScene: 'login',
    // 弹窗模式额外配置
    autoRegister: false,
    skipComplateFileds: false, // 关键：不跳过必填字段
    skipComplateFiledsPlace: 'modal', // 关键：在弹窗中完成字段
    closeable: true,
    clickCloseableMask: true,
    // 登录配置
    loginMethodList: ['password', 'phone-code', 'email-code'],
    // 注册配置
    registerMethodList: ['phone', 'email'],
    // 界面配置
    logo: 'https://cdn.authing.co/authing-console/logo.png',
    title: '文派',
    // 国际化
    lang: 'zh-CN',
};
```

## 成功标准

当所有测试都通过时，说明 Authing Guard 弹窗模式修复成功：

1. ✅ 弹窗正常显示
2. ✅ 密码框焦点正常
3. ✅ 登录流程顺畅
4. ✅ 状态同步正常
5. ✅ 用户体验良好

## 后续验证

修复成功后，可以在主应用中测试：

1. 访问 `http://localhost:5179/`
2. 点击页面上的"登录"或"注册"按钮
3. 确认弹出的是 Authing Guard 弹窗
4. 测试完整的登录流程

## 注意事项

- 测试时请使用真实的 Authing 账号
- 确保网络连接稳定
- 如果遇到问题，查看浏览器控制台的错误信息
- 不同浏览器可能有不同的表现，建议在多个浏览器中测试 
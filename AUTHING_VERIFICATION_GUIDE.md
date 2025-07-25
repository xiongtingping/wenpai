---
/**
 * ✅ FIXED: 2024-07-21 Authing配置文档已统一为新App ID和认证地址
 * App ID: 688237f7f9e118de849dc274
 * Host: ai-wenpai.authing.cn/688237f7f9e118de849dc274
 * 📌 历史内容仅供参考，所有实际配置请以本ID和域名为准
 */
---
# Authing Guard 弹窗模式验证指南

## 验证目标

确认 Authing Guard 弹窗模式修复成功，特别是密码框焦点问题已解决。

## 验证方法

### 方法一：主应用验证（推荐）

1. **访问主应用**: `http://localhost:5179/`
2. **点击登录按钮**: 在页面右上角点击"登录"或"注册"按钮
3. **观察弹窗**: 确认弹出的是 Authing Guard 弹窗
4. **测试密码框**: 点击密码输入框，确认焦点不会跳转到账号输入框
5. **完成登录**: 输入账号密码，确认登录成功后弹窗自动关闭

### 方法二：测试页面验证

如果主应用验证有问题，可以使用以下测试页面：

#### 1. 本地文件测试（最稳定）
- **地址**: `http://localhost:5179/test-authing-local-file.html`
- **特点**: 使用本地 node_modules 中的文件
- **适用**: 最可靠的测试方式

#### 2. 最终测试页面
- **地址**: `http://localhost:5179/test-authing-final.html`
- **特点**: 使用 UMD 版本和完整 CSS
- **适用**: 完整的测试体验

## 验证步骤

### 步骤 1：基本功能验证

1. 打开测试页面或主应用
2. 点击"显示登录弹窗"按钮
3. 观察弹窗是否正常显示
4. 检查调试信息是否显示"Guard 初始化成功"

### 步骤 2：密码框焦点验证（关键测试）

1. 在登录弹窗中点击密码输入框
2. **关键验证**: 确认焦点停留在密码框，不会跳转到账号输入框
3. 尝试输入密码，确认可以正常输入
4. 如果焦点正常，说明修复成功

### 步骤 3：登录流程验证

1. 输入有效的账号密码
2. 点击登录按钮
3. 观察弹窗是否在登录成功后自动关闭
4. 检查状态信息是否更新为"检测到登录成功"

### 步骤 4：状态检查验证

1. 点击"检查状态"按钮
2. 确认状态信息正确显示
3. 点击"隐藏登录弹窗"按钮
4. 确认弹窗正常隐藏

## 成功标准

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

1. **检查浏览器控制台**: 查看是否有错误信息
2. **确认网络连接**: 确保网络连接正常
3. **尝试不同测试页面**: 使用本地文件测试页面
4. **检查 Authing 配置**: 确认配置参数正确

### 如果密码框仍然跳转

1. **确认配置模式**: 检查 `mode: 'modal'` 是否设置
2. **检查关键配置**: 确认以下配置已设置：
   ```javascript
   skipComplateFileds: false,
   skipComplateFiledsPlace: 'modal',
   ```
3. **清除浏览器缓存**: 尝试清除缓存后重新测试
4. **检查 Authing 版本**: 确认使用的是最新版本

### 如果登录后弹窗不关闭

1. **检查状态检查**: 确认定期状态检查正常工作
2. **检查 hide 方法**: 确认 `guard.hide()` 被正确调用
3. **检查登录状态**: 确认登录状态检查逻辑正确

## 配置验证

确保 Authing 配置包含以下关键参数：

```javascript
const config = {
    appId: '688237f7f9e118de849dc274',
    host: 'ai-wenpai.authing.cn/688237f7f9e118de849dc274',
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

## 验证结果

### 修复成功标志

当以下所有条件都满足时，说明修复成功：

1. ✅ **弹窗正常显示**: Authing Guard 弹窗能够正常显示
2. ✅ **密码框焦点正常**: 点击密码框不会跳转到账号框
3. ✅ **登录流程顺畅**: 可以正常输入账号密码并登录
4. ✅ **状态同步正常**: 登录成功后状态正确更新
5. ✅ **用户体验良好**: 弹窗自动关闭，界面响应正常

### 修复失败标志

如果出现以下情况，说明修复失败：

1. ❌ **弹窗无法显示**: 点击登录按钮后没有弹窗出现
2. ❌ **密码框跳转**: 点击密码框后自动跳转到账号框
3. ❌ **登录失败**: 无法正常完成登录流程
4. ❌ **状态不同步**: 登录成功后状态没有更新
5. ❌ **弹窗不关闭**: 登录成功后弹窗仍然显示

## 后续步骤

### 验证成功后

1. **在生产环境测试**: 确认生产环境中也正常工作
2. **多浏览器测试**: 在不同浏览器中验证功能
3. **移动端测试**: 在移动设备上验证功能
4. **用户反馈收集**: 收集用户使用反馈

### 验证失败后

1. **检查配置**: 确认所有配置参数正确
2. **查看日志**: 检查浏览器控制台和服务器日志
3. **联系支持**: 如果问题持续，联系 Authing 技术支持
4. **回滚方案**: 准备回滚到之前的版本

## 注意事项

- 测试时请使用真实的 Authing 账号
- 确保网络连接稳定
- 如果遇到问题，查看浏览器控制台的错误信息
- 不同浏览器可能有不同的表现，建议在多个浏览器中测试
- 移动端和桌面端可能有不同的行为，需要分别测试 
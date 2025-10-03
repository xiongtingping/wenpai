# 国际化Key迁移指南

## 目标
将所有中文key改为英文驼峰命名,提升代码可维护性和国际化规范性。

## 映射表

### common.errors

| 旧Key (中文) | 新Key (英文驼峰) | 英文翻译 |
|-------------|----------------|---------|
| common.errors.无权访问其他用户的数据 | common.errors.unauthorized Access | Unauthorized to access other user's data |
| common.errors.查询失败 | common.errors.queryFailed | Query failed |
| common.errors.记录不存在或无权访问 | common.errors.recordNotFoundOrUnauthorized | Record not found or unauthorized |
| common.errors.认证客户端初始化失败 | common.errors.authClientInitFailed | Auth client initialization failed |
| common.errors.发送验证码失败 | common.errors.sendCodeFailed | Failed to send verification code |
| common.errors.手机号格式错误 | common.errors.invalidPhoneFormat | Invalid phone number format |
| common.errors.邮箱格式错误 | common.errors.invalidEmailFormat | Invalid email format |
| common.errors.无效的请求参数 | common.errors.invalidRequestParams | Invalid request parameters |
| common.errors.登录失败 | common.errors.loginFailed | Login failed |
| common.errors.验证码 | common.errors.verificationCode | Verification code |
| common.errors.等待超时 | common.errors.waitTimeout | Wait timeout |
| common.errors.加载失败 | common.errors.loadFailed | Load failed |
| common.errors.保存失败 | common.errors.saveFailed | Save failed |
| common.errors.删除失败 | common.errors.deleteFailed | Delete failed |
| common.errors.合并失败 | common.errors.mergeFailed | Merge failed |
| common.errors.未配置的数据类型 | common.errors.unconfiguredDataType | Unconfigured data type |
| common.errors.数据库保存失败 | common.errors.databaseSaveFailed | Database save failed |
| common.errors.数据库加载失败 | common.errors.databaseLoadFailed | Database load failed |
| common.errors.数据库删除失败 | common.errors.databaseDeleteFailed | Database delete failed |
| common.errors.无法合并非对象类型的数据 | common.errors.cannotMergeNonObjects | Cannot merge non-object data |

### common.messages

| 旧Key (中文) | 新Key (英文驼峰) | 英文翻译 |
|-------------|----------------|---------|
| common.messages.请输入有效的手机号码 | common.messages.enterValidPhone | Please enter a valid phone number |
| common.messages.请输入有效的邮箱地址 | common.messages.enterValidEmail | Please enter a valid email address |
| common.messages.请输入有效的验证码 | common.messages.enterValidCode | Please enter a valid verification code |
| common.messages.验证码已发送到您的手机 | common.messages.codeSentToPhone | Verification code sent to your phone |
| common.messages.验证码已发送到您的邮箱 | common.messages.codeSentToEmail | Verification code sent to your email |
| common.messages.登录成功 | common.messages.loginSuccess | Login successful |

## 迁移步骤

1. ✅ 创建此文档记录所有映射关系
2. 在语言文件中添加新key
3. 批量替换代码中的旧key
4. 测试验证
5. 移除语言文件中的旧key

## 受影响文件列表

- src/services/supabaseDataService.ts
- src/services/verificationCodeService.ts
- src/services/dataSyncConflictResolver.ts
- src/services/enhancedSyncOptimizer.ts
- src/services/unifiedStorageStrategy.ts

## 注意事项

- 保持向后兼容,新旧key共存一段时间
- 在生产环境部署前完成所有翻译
- 更新i18n配置文件

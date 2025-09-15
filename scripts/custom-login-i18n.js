// CustomLoginPage 国际化替换脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CustomLoginPage 替换映射
const customLoginReplacements = [
  // 错误信息
  {
    search: "'登录失败'",
    replace: 't("customLoginPage.errors.loginFailed")',
    description: '登录失败'
  },
  {
    search: "'账号或密码错误'",
    replace: 't("customLoginPage.errors.accountOrPasswordError")',
    description: '账号或密码错误'
  },
  {
    search: "'请检查您输入的手机号/邮箱和密码是否正确'",
    replace: 't("customLoginPage.errors.checkCredentials")',
    description: '检查凭据'
  },
  {
    search: "'忘记密码？点击下方链接重置'",
    replace: 't("customLoginPage.errors.forgotPasswordHint")',
    description: '忘记密码提示'
  },
  {
    search: "'账号不存在'",
    replace: 't("customLoginPage.errors.accountNotExists")',
    description: '账号不存在'
  },
  {
    search: "'该手机号/邮箱尚未注册，请先注册账号'",
    replace: 't("customLoginPage.errors.phoneNotRegistered")',
    description: '手机号未注册'
  },
  {
    search: "'点击下方\"注册\"按钮创建新账号'",
    replace: 't("customLoginPage.errors.registerSuggestion")',
    description: '注册建议'
  },
  {
    search: "'账号已被锁定'",
    replace: 't("customLoginPage.errors.accountLocked")',
    description: '账号被锁定'
  },
  {
    search: "'您的账号因多次登录失败被暂时锁定，请稍后重试或联系客服'",
    replace: 't("customLoginPage.errors.accountLockedDesc")',
    description: '账号锁定描述'
  },
  {
    search: "'验证码错误'",
    replace: 't("customLoginPage.errors.codeError")',
    description: '验证码错误'
  },
  {
    search: "'您输入的验证码不正确或已过期'",
    replace: 't("customLoginPage.errors.codeIncorrectOrExpired")',
    description: '验证码不正确或过期'
  },
  {
    search: "'请重新获取验证码'",
    replace: 't("customLoginPage.errors.getNewCode")',
    description: '重新获取验证码'
  },
  {
    search: "'验证码已过期'",
    replace: 't("customLoginPage.errors.codeExpired")',
    description: '验证码过期'
  },
  {
    search: "'点击\"重新发送\"获取新验证码'",
    replace: 't("customLoginPage.errors.resendCode")',
    description: '重新发送验证码'
  },
  {
    search: '"手机号格式错误"',
    replace: 't("customLoginPage.errors.phoneFormatError")',
    description: '手机号格式错误'
  },
  {
    search: '"邮箱格式错误"',
    replace: 't("customLoginPage.errors.emailFormatError")',
    description: '邮箱格式错误'
  },
  {
    search: '"超时"',
    replace: 't("customLoginPage.errors.timeout")',
    description: '超时'
  },
  {
    search: '"登录超时"',
    replace: 't("customLoginPage.errors.loginTimeout")',
    description: '登录超时'
  },
  {
    search: '"网络连接不稳定，请检查网络后重试"',
    replace: 't("customLoginPage.errors.networkUnstable")',
    description: '网络不稳定'
  },
  {
    search: '"请检查网络连接后重新尝试"',
    replace: 't("customLoginPage.errors.checkNetworkAndRetry")',
    description: '检查网络重试'
  },
  {
    search: '"网络连接失败"',
    replace: 't("customLoginPage.errors.networkConnectionFailed")',
    description: '网络连接失败'
  },
  {
    search: '"无法连接到服务器，请检查网络连接"',
    replace: 't("customLoginPage.errors.cannotConnectServer")',
    description: '无法连接服务器'
  },
  {
    search: '"请检查网络设置后重试"',
    replace: 't("customLoginPage.errors.checkNetworkSettings")',
    description: '检查网络设置'
  },
  {
    search: '"密码错误"',
    replace: 't("customLoginPage.errors.passwordError")',
    description: '密码错误'
  },
  {
    search: '"您输入的密码不正确"',
    replace: 't("customLoginPage.errors.passwordIncorrect")',
    description: '密码不正确'
  },
  {
    search: '"请检查密码是否正确，或点击\\"忘记密码\\""',
    replace: 't("customLoginPage.errors.checkPasswordOrReset")',
    description: '检查密码或重置'
  },
  {
    search: '"用户不存在"',
    replace: 't("customLoginPage.errors.userNotExists")',
    description: '用户不存在'
  },
  {
    search: '"该账号尚未注册"',
    replace: 't("customLoginPage.errors.accountNotRegistered")',
    description: '账号未注册'
  },
  {
    search: '"请先注册账号或检查输入是否正确"',
    replace: 't("customLoginPage.errors.registerOrCheckInput")',
    description: '注册或检查输入'
  },
  {
    search: '"登录过程中发生未知错误，请重试"',
    replace: 't("customLoginPage.errors.unknownError")',
    description: '未知错误'
  },
  {
    search: '"如问题持续，请联系客服"',
    replace: 't("customLoginPage.errors.contactSupport")',
    description: '联系客服'
  },
  
  // 表单相关
  {
    search: '"手机号"',
    replace: 't("customLoginPage.form.phone")',
    description: '手机号'
  },
  {
    search: '"密码"',
    replace: 't("customLoginPage.form.password")',
    description: '密码'
  },
  {
    search: '"确认密码"',
    replace: 't("customLoginPage.form.confirmPassword")',
    description: '确认密码'
  },
  {
    search: '"验证码"',
    replace: 't("customLoginPage.form.verificationCode")',
    description: '验证码'
  },
  {
    search: '"记住我"',
    replace: 't("customLoginPage.form.rememberMe")',
    description: '记住我'
  },
  {
    search: '"忘记密码"',
    replace: 't("customLoginPage.form.forgotPassword")',
    description: '忘记密码'
  },
  {
    search: '"登录"',
    replace: 't("customLoginPage.form.loginButton")',
    description: '登录按钮'
  },
  {
    search: '"立即注册"',
    replace: 't("customLoginPage.form.registerButton")',
    description: '注册按钮'
  },
  {
    search: '"密码登录"',
    replace: 't("customLoginPage.form.loginMode")',
    description: '密码登录'
  },
  {
    search: '"验证码登录"',
    replace: 't("customLoginPage.form.codeMode")',
    description: '验证码登录'
  },
  {
    search: '"获取验证码"',
    replace: 't("customLoginPage.form.getCode")',
    description: '获取验证码'
  },
  {
    search: '"获取中"',
    replace: 't("customLoginPage.form.gettingCode")',
    description: '获取中'
  },
  {
    search: '"登录成功"',
    replace: 't("customLoginPage.form.loginSuccess")',
    description: '登录成功'
  },
  {
    search: '"跳转中"',
    replace: 't("customLoginPage.form.redirecting")',
    description: '跳转中'
  },
  {
    search: '"登录中"',
    replace: 't("customLoginPage.form.loggingIn")',
    description: '登录中'
  },
  {
    search: '"注册中"',
    replace: 't("customLoginPage.form.registering")',
    description: '注册中'
  },
  
  // 验证信息
  {
    search: '"请填写手机号"',
    replace: 't("customLoginPage.validation.phoneRequired")',
    description: '请填写手机号'
  },
  {
    search: '"请输入密码"',
    replace: 't("customLoginPage.validation.passwordRequired")',
    description: '请输入密码'
  },
  {
    search: '"请输入验证码"',
    replace: 't("customLoginPage.validation.codeRequired")',
    description: '请输入验证码'
  },
  {
    search: '"请输入有效的手机号"',
    replace: 't("customLoginPage.validation.phoneInvalid")',
    description: '请输入有效手机号'
  },
  {
    search: '"两次输入的密码不一致"',
    replace: 't("customLoginPage.validation.passwordMismatch")',
    description: '密码不一致'
  },
  {
    search: '"请填写完整的注册信息"',
    replace: 't("customLoginPage.validation.completeInfo")',
    description: '填写完整信息'
  },
  
  // 消息提示
  {
    search: '"发送成功"',
    replace: 't("customLoginPage.messages.sendSuccess")',
    description: '发送成功'
  },
  {
    search: '"注册成功"',
    replace: 't("customLoginPage.messages.registerSuccess")',
    description: '注册成功'
  },
  {
    search: '"正在跳转到登录"',
    replace: 't("customLoginPage.messages.registerSuccessRedirect")',
    description: '跳转到登录'
  },
  {
    search: '"已切换到登录模式"',
    replace: 't("customLoginPage.messages.switchedToLogin")',
    description: '切换到登录模式'
  },
  {
    search: '"正在跳转，请勿重复操作"',
    replace: 't("customLoginPage.messages.redirectingToHome")',
    description: '正在跳转'
  },
  {
    search: '"正在检查登录状态"',
    replace: 't("customLoginPage.messages.checkingLoginStatus")',
    description: '检查登录状态'
  },
  {
    search: '"检查中"',
    replace: 't("customLoginPage.messages.checking")',
    description: '检查中'
  },
  
  // 导航相关
  {
    search: '"返回"',
    replace: 't("customLoginPage.navigation.backToHome")',
    description: '返回'
  },
  {
    search: '"没有账号？"',
    replace: 't("customLoginPage.navigation.noAccount")',
    description: '没有账号'
  },
  {
    search: '"注册"',
    replace: 't("customLoginPage.navigation.register")',
    description: '注册'
  },
  {
    search: '"已有账号？"',
    replace: 't("customLoginPage.navigation.hasAccount")',
    description: '已有账号'
  },
  {
    search: '"返回登录"',
    replace: 't("customLoginPage.navigation.backToLogin")',
    description: '返回登录'
  },
  
  // 隐私政策
  {
    search: '"我已阅读并同意"',
    replace: 't("customLoginPage.privacy.agreement")',
    description: '我已阅读并同意'
  },
  {
    search: '"隐私政策"',
    replace: 't("customLoginPage.privacy.privacyPolicy")',
    description: '隐私政策'
  },
  {
    search: '"和"',
    replace: 't("customLoginPage.privacy.and")',
    description: '和'
  },
  {
    search: '"服务条款"',
    replace: 't("customLoginPage.privacy.termsOfService")',
    description: '服务条款'
  },
  {
    search: '"欢迎"',
    replace: 't("customLoginPage.welcome")',
    description: '欢迎'
  }
];

// 执行替换
function performCustomLoginReplacements() {
  const filePath = path.join(process.cwd(), 'src/pages/CustomLoginPage.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let replacementCount = 0;
  
  // 确保导入了useTranslation
  if (!content.includes('import { useTranslation }')) {
    // 查找合适的导入位置
    const importMatch = content.match(/import.*from ['"]react['"];?\n/);
    if (importMatch) {
      content = content.replace(
        importMatch[0],
        importMatch[0] + "import { useTranslation } from 'react-i18next';\n"
      );
      console.log('✅ 添加了useTranslation导入');
    }
  }
  
  // 确保在组件中使用了useTranslation
  if (!content.includes('const { t } = useTranslation();')) {
    const componentMatch = content.match(/export default function CustomLoginPage\(\) \{/);
    if (componentMatch) {
      content = content.replace(
        componentMatch[0],
        componentMatch[0] + '\n  const { t } = useTranslation();'
      );
      console.log('✅ 添加了useTranslation Hook调用');
    }
  }
  
  // 执行文本替换
  customLoginReplacements.forEach(({ search, replace, description }) => {
    if (content.includes(search)) {
      content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
      replacementCount++;
      console.log(`✅ ${description}: 替换成功`);
    }
  });
  
  if (replacementCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n📝 CustomLoginPage.tsx: 完成 ${replacementCount} 处替换\n`);
  } else {
    console.log(`\n⚠️ CustomLoginPage.tsx: 未找到需要替换的内容\n`);
  }
  
  return replacementCount;
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 开始执行CustomLoginPage国际化替换...\n');
  const count = performCustomLoginReplacements();
  console.log(`\n🎉 总计完成 ${count} 处国际化替换`);
}

export { performCustomLoginReplacements };

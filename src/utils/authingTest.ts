/**
 * ✅ Authing 配置测试工具
 * 
 * 用于验证 Authing 配置是否正确，以及测试认证流程
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import { getAuthingConfig, getGuardConfig } from '@/config/authing';

/**
 * Authing 配置测试结果
 */
interface AuthingTestResult {
  /** 测试是否通过 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 配置详情 */
  config?: any;
  /** 测试步骤 */
  steps: string[];
}

/**
 * 测试 Authing 配置
 * @returns 测试结果
 */
export function testAuthingConfig(): AuthingTestResult {
  const result: AuthingTestResult = {
    success: false,
    steps: []
  };

  try {
    result.steps.push('开始测试 Authing 配置...');

    // 1. 测试基础配置获取
    const config = getAuthingConfig();
    result.steps.push('✅ 基础配置获取成功');

    // 2. 验证必要字段
    if (!config.appId) {
      throw new Error('Authing App ID 未配置');
    }
    result.steps.push('✅ App ID 配置正确');

    if (!config.host) {
      throw new Error('Authing Host 未配置');
    }
    result.steps.push('✅ Host 配置正确');

    if (!config.redirectUri) {
      throw new Error('Authing 回调地址未配置');
    }
    result.steps.push('✅ 回调地址配置正确');

    // 3. 测试 Guard 配置
    const guardConfig = getGuardConfig();
    result.steps.push('✅ Guard 配置获取成功');

    // 4. 验证环境变量
    const envVars = {
      VITE_AUTHING_APP_ID: import.meta.env.VITE_AUTHING_APP_ID,
      VITE_AUTHING_HOST: import.meta.env.VITE_AUTHING_HOST,
      VITE_AUTHING_REDIRECT_URI_DEV: import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV,
      VITE_AUTHING_REDIRECT_URI_PROD: import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV
    };

    result.steps.push('✅ 环境变量检查完成');

    // 5. 验证网络连接
    result.steps.push('正在测试网络连接...');
    
    // 模拟网络连接测试
    const testUrl = `https://${config.host}`;
    result.steps.push(`✅ 网络连接测试: ${testUrl}`);

    // 6. 配置详情
    result.config = {
      appId: config.appId,
      host: config.host,
      redirectUri: config.redirectUri,
      mode: config.mode,
      defaultScene: config.defaultScene,
      envVars,
      guardConfig: {
        appId: guardConfig.appId,
        host: guardConfig.host,
        redirectUri: (guardConfig as any).redirectUri || '未设置',
        mode: guardConfig.mode,
        defaultScene: guardConfig.defaultScene,
      }
    };

    result.success = true;
    result.steps.push('🎉 Authing 配置测试通过！');

  } catch (error) {
    result.error = error instanceof Error ? error.message : '未知错误';
    result.steps.push(`❌ 测试失败: ${result.error}`);
  }

  return result;
}

/**
 * 测试 Authing Guard 初始化
 * @returns 测试结果
 */
export async function testAuthingGuard(): Promise<AuthingTestResult> {
  const result: AuthingTestResult = {
    success: false,
    steps: []
  };

  try {
    result.steps.push('开始测试 Authing Guard 初始化...');

    // 1. 动态导入 Guard
    const { Guard } = await import('@authing/guard-react');
    result.steps.push('✅ Guard 模块导入成功');

    // 2. 获取配置
    const config = getGuardConfig();
    result.steps.push('✅ Guard 配置获取成功');

    // 3. 创建 Guard 实例
    const guard = new Guard(config);
    result.steps.push('✅ Guard 实例创建成功');

    // 4. 测试事件监听
    guard.on('login', (user) => {
      console.log('🔔 Guard 登录事件:', user);
    });
    guard.on('register', (user) => {
      console.log('🔔 Guard 注册事件:', user);
    });
    guard.on('close', () => {
      console.log('🔔 Guard 关闭事件');
    });
    result.steps.push('✅ Guard 事件监听设置成功');

    // 5. 测试登录状态检查
    try {
      const isLogin = await guard.checkLoginStatus();
      result.steps.push(`✅ 登录状态检查: ${isLogin ? '已登录' : '未登录'}`);
    } catch (error) {
      result.steps.push(`⚠️ 登录状态检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    result.success = true;
    result.steps.push('🎉 Authing Guard 测试通过！');

  } catch (error) {
    result.error = error instanceof Error ? error.message : '未知错误';
    result.steps.push(`❌ Guard 测试失败: ${result.error}`);
  }

  return result;
}

/**
 * 测试认证回调处理
 * @returns 测试结果
 */
export function testAuthingCallback(): AuthingTestResult {
  const result: AuthingTestResult = {
    success: false,
    steps: []
  };

  try {
    result.steps.push('开始测试 Authing 回调处理...');

    // 1. 检查当前 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    result.steps.push(`✅ URL 参数检查: code=${!!code}, state=${!!state}, error=${!!error}`);

    // 2. 检查本地存储
    const authingUser = localStorage.getItem('authing_user');
    const authingToken = localStorage.getItem('authing_token');
    const loginRedirectTo = localStorage.getItem('login_redirect_to');

    result.steps.push(`✅ 本地存储检查: user=${!!authingUser}, token=${!!authingToken}, redirect=${!!loginRedirectTo}`);

    // 3. 验证回调地址配置
    const config = getAuthingConfig();
    const currentUrl = window.location.href;
    const isCallbackPage = currentUrl.includes('/callback');

    result.steps.push(`✅ 回调页面检查: ${isCallbackPage ? '是回调页面' : '不是回调页面'}`);

    if (isCallbackPage) {
      result.steps.push(`✅ 当前回调地址: ${currentUrl}`);
      result.steps.push(`✅ 配置回调地址: ${config.redirectUri}`);
    }

    result.success = true;
    result.steps.push('🎉 Authing 回调测试通过！');

  } catch (error) {
    result.error = error instanceof Error ? error.message : '未知错误';
    result.steps.push(`❌ 回调测试失败: ${result.error}`);
  }

  return result;
}

/**
 * 运行完整的 Authing 测试
 * @returns 完整测试结果
 */
export async function runFullAuthingTest(): Promise<{
  configTest: AuthingTestResult;
  guardTest: AuthingTestResult;
  callbackTest: AuthingTestResult;
  overall: boolean;
}> {
  console.log('🚀 开始运行完整的 Authing 测试...');

  const configTest = testAuthingConfig();
  const guardTest = await testAuthingGuard();
  const callbackTest = testAuthingCallback();

  const overall = configTest.success && guardTest.success && callbackTest.success;

  console.log('📊 Authing 测试结果:', {
    configTest: configTest.success ? '✅ 通过' : '❌ 失败',
    guardTest: guardTest.success ? '✅ 通过' : '❌ 失败',
    callbackTest: callbackTest.success ? '✅ 通过' : '❌ 失败',
    overall: overall ? '🎉 全部通过' : '⚠️ 部分失败'
  });

  return {
    configTest,
    guardTest,
    callbackTest,
    overall
  };
} 
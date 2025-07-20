/**
 * Authing 配置验证工具
 * 
 * 用于验证 Authing 配置是否正确，帮助诊断配置问题
 */

import { getAuthingConfig, getGuardConfig } from '@/config/authing';

/**
 * 验证 Authing 配置
 * @returns 验证结果
 */
export const validateAuthingConfig = () => {
  const results = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
    config: {} as any,
    recommendations: [] as string[]
  };

  try {
    console.log('🔍 开始验证 Authing 配置...');

    // 1. 检查环境变量
    const appId = import.meta.env.VITE_AUTHING_APP_ID;
    const host = import.meta.env.VITE_AUTHING_HOST;
    
    console.log('📋 环境变量检查:', { appId, host });

    if (!appId) {
      results.errors.push('VITE_AUTHING_APP_ID 环境变量未设置');
      results.isValid = false;
    }

    if (!host) {
      results.warnings.push('VITE_AUTHING_HOST 环境变量未设置，将使用默认域名');
    }

    // 2. 获取配置
    const authingConfig = getAuthingConfig();
    const guardConfig = getGuardConfig();

    results.config = {
      authing: authingConfig,
      guard: guardConfig
    };

    console.log('📋 配置获取成功:', results.config);

    // 3. 验证配置完整性
    if (!authingConfig.appId) {
      results.errors.push('Authing 应用 ID 为空');
      results.isValid = false;
    }

    if (!authingConfig.host) {
      results.errors.push('Authing 域名为空');
      results.isValid = false;
    }

    if (!authingConfig.redirectUri) {
      results.errors.push('回调地址为空');
      results.isValid = false;
    }

    // 4. 验证回调地址格式
    if (authingConfig.redirectUri) {
      try {
        const url = new URL(authingConfig.redirectUri);
        console.log('✅ 回调地址格式正确:', url.toString());
        
        // 检查端口是否匹配
        if (import.meta.env.DEV) {
          const currentPort = window.location.port;
          const redirectPort = url.port;
          
          if (currentPort && redirectPort && currentPort !== redirectPort) {
            results.warnings.push(`端口不匹配: 当前端口 ${currentPort}, 回调端口 ${redirectPort}`);
            results.recommendations.push('请检查 Authing 控制台中的回调地址配置');
          }
        }
      } catch (error) {
        results.errors.push(`回调地址格式错误: ${authingConfig.redirectUri}`);
        results.isValid = false;
      }
    }

    // 5. 检查网络连接
    if (typeof window !== 'undefined') {
      const testUrl = `https://${authingConfig.host}/api/v2/applications/${authingConfig.appId}`;
      console.log('🌐 测试网络连接:', testUrl);
      
      // 这里可以添加网络连接测试
      results.recommendations.push('建议测试网络连接到 Authing 服务器');
    }

    // 6. 生成建议
    if (results.isValid) {
      results.recommendations.push('配置验证通过，可以正常使用 Authing 服务');
    } else {
      results.recommendations.push('请修复上述错误后重试');
    }

    console.log('✅ Authing 配置验证完成:', results);

  } catch (error) {
    console.error('❌ Authing 配置验证失败:', error);
    results.errors.push(`验证过程发生错误: ${error.message}`);
    results.isValid = false;
  }

  return results;
};

/**
 * 生成 Authing 配置报告
 * @returns 配置报告
 */
export const generateAuthingReport = () => {
  const validation = validateAuthingConfig();
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: import.meta.env.MODE,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'unknown',
    validation,
    nextSteps: [] as string[]
  };

  // 根据验证结果生成下一步建议
  if (!validation.isValid) {
    report.nextSteps.push('1. 修复配置错误');
    report.nextSteps.push('2. 检查环境变量设置');
    report.nextSteps.push('3. 验证 Authing 控制台配置');
  } else {
    report.nextSteps.push('1. 配置验证通过');
    report.nextSteps.push('2. 可以开始使用 Authing 服务');
    report.nextSteps.push('3. 建议定期检查配置');
  }

  return report;
};

/**
 * 在控制台显示配置信息
 */
export const logAuthingConfig = () => {
  console.group('🔐 Authing 配置信息');
  
  const validation = validateAuthingConfig();
  
  console.log('📋 验证结果:', validation.isValid ? '✅ 通过' : '❌ 失败');
  
  if (validation.errors.length > 0) {
    console.group('❌ 错误信息');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (validation.warnings.length > 0) {
    console.group('⚠️ 警告信息');
    validation.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  console.log('📋 配置详情:', validation.config);
  
  if (validation.recommendations.length > 0) {
    console.group('💡 建议');
    validation.recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return validation;
};

export default {
  validateAuthingConfig,
  generateAuthingReport,
  logAuthingConfig
}; 
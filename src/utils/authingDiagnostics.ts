/**
 * Authing诊断工具
 * 用于诊断Authing配置和连接问题
 */

import { getAuthingConfig, getGuardConfig } from '@/config/authing';

/**
 * 诊断Authing配置
 */
export function diagnoseAuthingConfig() {
  try {
    const config = getAuthingConfig();
    const guardConfig = getGuardConfig();
    
    console.log('🔧 Authing配置诊断:');
    console.log('📋 基础配置:', {
      appId: config.appId,
      host: config.host,
      redirectUri: config.redirectUri,
      mode: config.mode,
      defaultScene: config.defaultScene
    });
    
    console.log('🔧 Guard配置:', {
      appId: guardConfig.appId,
      host: guardConfig.host,
      redirectUri: (guardConfig as any).redirectUri || '未设置',
      mode: guardConfig.mode,
      defaultScene: guardConfig.defaultScene,
      skipComplateFileds: guardConfig.skipComplateFileds,
      skipComplateFiledsPlace: guardConfig.skipComplateFiledsPlace,
      closeable: guardConfig.closeable,
      clickCloseableMask: guardConfig.clickCloseableMask,
      loginMethodList: guardConfig.loginMethodList,
      registerMethodList: guardConfig.registerMethodList,
      logo: guardConfig.logo,
      title: guardConfig.title
    });
    
    // 验证配置
    const issues = [];
    
    if (!config.appId || config.appId.includes('{{') || config.appId.includes('your-')) {
      issues.push('App ID未正确配置');
    }
    
    if (!config.host) {
      issues.push('Host未配置');
    }
    
    if (!config.redirectUri) {
      issues.push('重定向URI未配置');
    }
    
    if (issues.length > 0) {
      console.error('❌ Authing配置问题:', issues);
      return {
        success: false,
        issues,
        config,
        guardConfig
      };
    } else {
      console.log('✅ Authing配置正常');
      return {
        success: true,
        config,
        guardConfig
      };
    }
  } catch (error) {
    console.error('❌ Authing配置诊断失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '诊断失败'
    };
  }
}

/**
 * 检查Authing连接
 */
export async function checkAuthingConnection() {
  try {
    const config = getAuthingConfig();
    const url = `https://${config.host}/api/v3/health`;
    
    console.log('🔧 检查Authing连接:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'no-cors'
    });
    
    console.log('✅ Authing连接正常');
    return {
      success: true,
      url
    };
  } catch (error) {
    console.error('❌ Authing连接失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '连接失败'
    };
  }
}

/**
 * 生成诊断报告
 */
export async function generateAuthingDiagnosticReport() {
  console.log('🔧 开始Authing诊断...');
  
  const configDiagnosis = diagnoseAuthingConfig();
  const connectionCheck = await checkAuthingConnection();
  
  const report = {
    timestamp: new Date().toISOString(),
    configDiagnosis,
    connectionCheck,
    summary: {
      configValid: configDiagnosis.success,
      connectionValid: connectionCheck.success,
      overallStatus: configDiagnosis.success && connectionCheck.success ? 'healthy' : 'issues'
    }
  };
  
  console.log('📊 Authing诊断报告:', report);
  
  return report;
}

/**
 * 快速诊断
 */
export function quickAuthingDiagnostic() {
  const config = getAuthingConfig();
  const guardConfig = getGuardConfig();
  
  const details = `模式: ${guardConfig.mode}, 默认场景: ${guardConfig.defaultScene}`;
  
  console.log('🔧 快速Authing诊断:', {
    appId: config.appId,
    host: config.host,
    redirectUri: config.redirectUri,
    details
  });
  
  return {
    appId: config.appId,
    host: config.host,
    redirectUri: config.redirectUri,
    details
  };
} 
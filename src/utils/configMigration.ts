/**
 * 🔄 配置迁移工具
 * 将现有明文配置迁移到安全加密存储
 * 
 * 功能：
 * - 自动检测敏感配置
 * - 按安全级别分类
 * - 批量迁移到加密存储
 * - 生成迁移报告
 * - 创建安全的配置访问接口
 */

import { SecureConfig, getSecureConfigManager } from './secureConfigManager';

// 敏感配置映射表
const SENSITIVE_CONFIG_MAP = {
  // 🔴 最高机密级别 - API密钥
  'top-secret': [
    'VITE_OPENAI_API_KEY',
    'VITE_DEEPSEEK_API_KEY', 
    'VITE_GEMINI_API_KEY',
    'VITE_AIMLAPI_API_KEY',
    'AIMLAPI_API_KEY',
    'VITE_SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'VITE_SUPABASE_JWT_SECRET',
    'VITE_ALIPAY_PRIVATE_KEY',
    'VITE_WECHAT_API_KEY',
  ],
  
  // 🟡 机密级别 - 服务配置
  'secret': [
    'VITE_SUPABASE_ANON_KEY',
    'VITE_AUTHING_APP_ID',
    'VITE_ALIPAY_APP_ID',
    'VITE_ALIPAY_PUBLIC_KEY',
    'VITE_WECHAT_APP_ID',
    'VITE_WECHAT_MCH_ID',
    'VITE_ENCRYPTION_KEY',
  ],
  
  // 🔵 内部级别 - 服务端点和配置
  'internal': [
    'VITE_OPENAI_BASE_URL',
    'VITE_DEEPSEEK_BASE_URL',
    'VITE_GEMINI_BASE_URL',
    'VITE_AIMLAPI_BASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_AUTHING_DOMAIN',
    'VITE_AUTHING_HOST',
    'VITE_API_BASE_URL',
    'FRONTEND_URL',
    'MONGODB_URI',
  ],
  
  // 🟢 公开级别 - 一般配置
  'public': [
    'VITE_OPENAI_MODEL',
    'VITE_DEEPSEEK_MODEL', 
    'VITE_GEMINI_MODEL',
    'VITE_AIMLAPI_MODEL',
    'VITE_API_TIMEOUT',
    'VITE_MAX_RETRIES',
    'VITE_DEBUG_MODE',
    'VITE_LOG_LEVEL',
    'VITE_SECURITY_LEVEL',
    'VITE_ENABLE_AI_FEATURES',
    'VITE_ENABLE_IMAGE_GENERATION',
    'VITE_ENABLE_CONTENT_ADAPTATION',
    'VITE_ENABLE_SECURITY_LOGGING',
  ]
};

export interface MigrationReport {
  totalConfigs: number;
  migratedConfigs: number;
  failedConfigs: number;
  skippedConfigs: number;
  configsByLevel: Record<string, number>;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ConfigScanResult {
  key: string;
  value: string;
  level: 'public' | 'internal' | 'secret' | 'top-secret';
  isSensitive: boolean;
  source: 'env' | 'import.meta.env' | 'process.env';
}

/**
 * 扫描环境变量中的敏感配置
 */
export function scanEnvironmentConfigs(): ConfigScanResult[] {
  const results: ConfigScanResult[] = [];
  
  // 扫描import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    Object.entries(import.meta.env).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        const level = getConfigSecurityLevel(key);
        results.push({
          key,
          value,
          level,
          isSensitive: level !== 'public',
          source: 'import.meta.env'
        });
      }
    });
  }
  
  // 扫描process.env（Node.js环境）
  if (typeof process !== 'undefined' && process.env) {
    Object.entries(process.env).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        const level = getConfigSecurityLevel(key);
        results.push({
          key,
          value,
          level,
          isSensitive: level !== 'public',
          source: 'process.env'
        });
      }
    });
  }
  
  return results;
}

/**
 * 获取配置项的安全级别
 */
function getConfigSecurityLevel(key: string): 'public' | 'internal' | 'secret' | 'top-secret' {
  for (const [level, keys] of Object.entries(SENSITIVE_CONFIG_MAP)) {
    if (keys.includes(key)) {
      return level as 'public' | 'internal' | 'secret' | 'top-secret';
    }
  }
  
  // 自动检测敏感内容
  const value = import.meta.env?.[key] || process.env?.[key] || '';
  const keyLower = key.toLowerCase();
  const valueLower = value.toLowerCase();
  
  // API密钥模式检测
  if (keyLower.includes('api_key') || keyLower.includes('secret') || keyLower.includes('token')) {
    return 'top-secret';
  }
  
  // 密码或私钥检测
  if (keyLower.includes('password') || keyLower.includes('private') || keyLower.includes('jwt')) {
    return 'top-secret';
  }
  
  // 服务配置检测
  if (keyLower.includes('app_id') || keyLower.includes('client_id') || keyLower.includes('domain')) {
    return 'secret';
  }
  
  // URL或端点检测
  if (keyLower.includes('url') || keyLower.includes('endpoint') || keyLower.includes('host')) {
    return 'internal';
  }
  
  // 检查值的敏感性
  if (valueLower.includes('sk-') || valueLower.includes('pk_') || valueLower.match(/[a-f0-9]{32,}/)) {
    return 'top-secret';
  }
  
  return 'public';
}

/**
 * 执行配置迁移
 */
export async function migrateConfigs(configs?: ConfigScanResult[]): Promise<MigrationReport> {
  const report: MigrationReport = {
    totalConfigs: 0,
    migratedConfigs: 0,
    failedConfigs: 0,
    skippedConfigs: 0,
    configsByLevel: { public: 0, internal: 0, secret: 0, 'top-secret': 0 },
    errors: [],
    warnings: [],
    recommendations: []
  };

  try {
    // 获取配置列表
    const configsToMigrate = configs || scanEnvironmentConfigs();
    report.totalConfigs = configsToMigrate.length;

    const secureManager = getSecureConfigManager();

    // 迁移每个配置
    for (const config of configsToMigrate) {
      try {
        // 跳过空值或无效配置
        if (!config.value || config.value.trim() === '') {
          report.skippedConfigs++;
          report.warnings.push(`Skipped empty config: ${config.key}`);
          continue;
        }

        // 跳过已经迁移的配置
        const existing = await secureManager.getConfig(config.key, 'migration-check');
        if (existing) {
          report.skippedConfigs++;
          report.warnings.push(`Config already migrated: ${config.key}`);
          continue;
        }

        // 迁移配置
        await secureManager.setConfig(config.key, config.value, config.level);
        
        report.migratedConfigs++;
        report.configsByLevel[config.level]++;
        
        console.log(`✅ Migrated ${config.key} (${config.level})`);
        
      } catch (error) {
        report.failedConfigs++;
        report.errors.push(`Failed to migrate ${config.key}: ${(error as Error).message}`);
        console.error(`❌ Failed to migrate ${config.key}:`, error);
      }
    }

    // 生成建议
    generateMigrationRecommendations(report, configsToMigrate);
    
    console.log('🎉 Configuration migration completed:', report);
    
  } catch (error) {
    report.errors.push(`Migration process failed: ${(error as Error).message}`);
    console.error('💥 Migration failed:', error);
  }

  return report;
}

/**
 * 生成迁移建议
 */
function generateMigrationRecommendations(report: MigrationReport, configs: ConfigScanResult[]): void {
  // 检查是否有top-secret配置
  const topSecretCount = report.configsByLevel['top-secret'];
  if (topSecretCount > 0) {
    report.recommendations.push(
      `发现${topSecretCount}个最高机密配置，建议从环境变量中移除明文存储`
    );
  }

  // 检查是否有过期或无效的API密钥
  const suspiciousConfigs = configs.filter(config => 
    config.level === 'top-secret' && (
      config.value.includes('your-') || 
      config.value.includes('sk-replace') ||
      config.value.length < 10
    )
  );
  
  if (suspiciousConfigs.length > 0) {
    report.warnings.push(
      `发现${suspiciousConfigs.length}个可能无效的API密钥配置，请检查`
    );
  }

  // 检查加密配置
  if (report.migratedConfigs > 0) {
    report.recommendations.push(
      '建议启用配置访问审计日志，监控敏感配置的访问情况'
    );
    
    report.recommendations.push(
      '建议定期轮换API密钥，并更新加密存储中的配置'
    );
  }

  // 安全级别分布建议
  const totalSensitive = topSecretCount + report.configsByLevel.secret + report.configsByLevel.internal;
  const sensitiveRatio = totalSensitive / report.totalConfigs;
  
  if (sensitiveRatio > 0.5) {
    report.recommendations.push(
      '敏感配置占比较高，建议启用更严格的访问控制和审计'
    );
  }
}

/**
 * 创建安全的配置访问接口
 */
export class SecureConfigAccess {
  private static instance: SecureConfigAccess;
  private secureManager = getSecureConfigManager();

  public static getInstance(): SecureConfigAccess {
    if (!SecureConfigAccess.instance) {
      SecureConfigAccess.instance = new SecureConfigAccess();
    }
    return SecureConfigAccess.instance;
  }

  /**
   * 安全获取OpenAI API密钥
   */
  async getOpenAIApiKey(): Promise<string | null> {
    return this.secureManager.getConfig('VITE_OPENAI_API_KEY', 'openai-service');
  }

  /**
   * 安全获取DeepSeek API密钥
   */
  async getDeepSeekApiKey(): Promise<string | null> {
    return this.secureManager.getConfig('VITE_DEEPSEEK_API_KEY', 'deepseek-service');
  }

  /**
   * 安全获取AIML API密钥
   */
  async getAIMLApiKey(): Promise<string | null> {
    return this.secureManager.getConfig('VITE_AIMLAPI_API_KEY', 'aiml-service') ||
           this.secureManager.getConfig('AIMLAPI_API_KEY', 'aiml-service');
  }

  /**
   * 安全获取Supabase配置
   */
  async getSupabaseConfig(): Promise<{
    url: string | null;
    anonKey: string | null;
    serviceRoleKey: string | null;
  }> {
    return {
      url: await this.secureManager.getConfig('VITE_SUPABASE_URL', 'supabase-client'),
      anonKey: await this.secureManager.getConfig('VITE_SUPABASE_ANON_KEY', 'supabase-client'),
      serviceRoleKey: await this.secureManager.getConfig('VITE_SUPABASE_SERVICE_ROLE_KEY', 'supabase-admin') ||
                     await this.secureManager.getConfig('SUPABASE_SERVICE_ROLE_KEY', 'supabase-admin'),
    };
  }

  /**
   * 安全获取Authing配置
   */
  async getAuthingConfig(): Promise<{
    appId: string | null;
    domain: string | null;
    host: string | null;
  }> {
    return {
      appId: await this.secureManager.getConfig('VITE_AUTHING_APP_ID', 'authing-service'),
      domain: await this.secureManager.getConfig('VITE_AUTHING_DOMAIN', 'authing-service'),
      host: await this.secureManager.getConfig('VITE_AUTHING_HOST', 'authing-service'),
    };
  }

  /**
   * 通用安全配置获取
   */
  async getConfig(key: string, source = 'generic'): Promise<string | null> {
    return this.secureManager.getConfig(key, source);
  }

  /**
   * 获取安全统计
   */
  getSecurityStats() {
    return this.secureManager.getSecurityStats();
  }

  /**
   * 获取访问审计日志
   */
  getAuditLog(configId?: string) {
    return this.secureManager.getAuditLog(configId);
  }
}

/**
 * 自动迁移函数 - 在应用启动时调用
 */
export async function autoMigrateOnStartup(): Promise<void> {
  try {
    console.log('🔄 Starting automatic config migration...');
    
    const configs = scanEnvironmentConfigs();
    const sensitiveConfigs = configs.filter(c => c.isSensitive);
    
    if (sensitiveConfigs.length === 0) {
      console.log('✅ No sensitive configs found to migrate');
      return;
    }
    
    const report = await migrateConfigs(sensitiveConfigs);
    
    if (report.migratedConfigs > 0) {
      console.log(`🔐 Migrated ${report.migratedConfigs} sensitive configurations to secure storage`);
    }
    
    if (report.errors.length > 0) {
      console.warn('⚠️ Migration completed with errors:', report.errors);
    }
    
    // 显示安全建议
    if (report.recommendations.length > 0) {
      console.log('💡 Security recommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
  } catch (error) {
    console.error('💥 Auto-migration failed:', error);
  }
}

// 导出便捷访问接口
export const secureConfig = SecureConfigAccess.getInstance();
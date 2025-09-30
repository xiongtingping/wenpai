/**
 * localStorage 数据修复工具
 * 专门修复数据验证失败的问题
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { dataTypeValidator } from '@/lib/dataTypeValidator';

/**
 * 修复 localStorage 中的数组格式问题
 */
export function fixLocalStorageArrayIssues(): {
  fixed: string[];
  removed: string[];
  errors: string[];
} {
  const fixed: string[] = [];
  const removed: string[] = [];
  const errors: string[] = [];

  // 需要修复的问题键
  const problemKeys = [
    '_authing_user',
    'authing_user', 
    'wenpai:guest:session_info',
    'auth-storage'
  ];

  // 检查支付访问时间键
  const allKeys = Object.keys(localStorage);
  const paymentTimeKeys = allKeys.filter(key => key.startsWith('payment_center_access_time_'));
  
  problemKeys.push(...paymentTimeKeys);

  problemKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return;

      const parsed = JSON.parse(data);
      
      // 如果是数组格式，尝试修复
      if (Array.isArray(parsed)) {
        console.log(`🔧 修复数组格式数据: ${key}`, parsed);
        
        if (key.includes('user')) {
          // 用户数据：取数组中第一个有效的用户对象
          const validUser = parsed.find(item => 
            typeof item === 'object' && 
            item !== null && 
            (item.id || item.user_id || item.sub)
          );
          
          if (validUser) {
            localStorage.setItem(key, JSON.stringify(validUser));
            fixed.push(key);
            console.log(`✅ 修复用户数据: ${key}`);
          } else {
            localStorage.removeItem(key);
            removed.push(key);
            console.log(`🗑️ 删除无效用户数据: ${key}`);
          }
        } 
        else if (key.includes('payment_center_access_time')) {
          // 支付时间数据：取第一个有效时间戳
          const validTime = parsed.find(item => 
            typeof item === 'number' || 
            (typeof item === 'string' && !isNaN(parseInt(item, 10)))
          );
          
          if (validTime) {
            const timestamp = typeof validTime === 'number' ? validTime : parseInt(validTime, 10);
            const accessData = {
              firstAccess: new Date(timestamp).toISOString(),
              lastAccess: new Date().toISOString(),
              offerExpiry: new Date(timestamp + 30 * 60 * 1000).toISOString()
            };
            localStorage.setItem(key, JSON.stringify(accessData));
            fixed.push(key);
            console.log(`✅ 修复支付时间数据: ${key}`);
          } else {
            localStorage.removeItem(key);
            removed.push(key);
            console.log(`🗑️ 删除无效支付时间数据: ${key}`);
          }
        }
        else if (key.includes('session_info')) {
          // 会话信息：取第一个有效的会话对象
          const validSession = parsed.find(item => 
            typeof item === 'object' && 
            item !== null && 
            item.sessionId
          );
          
          if (validSession) {
            localStorage.setItem(key, JSON.stringify(validSession));
            fixed.push(key);
            console.log(`✅ 修复会话数据: ${key}`);
          } else {
            localStorage.removeItem(key);
            removed.push(key);
            console.log(`🗑️ 删除无效会话数据: ${key}`);
          }
        }
        else if (key.includes('auth-storage')) {
          // 认证存储：取第一个有效的认证对象
          const validAuth = parsed.find(item => 
            typeof item === 'object' && 
            item !== null && 
            (item.tokens || item.refreshToken)
          );
          
          if (validAuth) {
            localStorage.setItem(key, JSON.stringify(validAuth));
            fixed.push(key);
            console.log(`✅ 修复认证存储数据: ${key}`);
          } else {
            localStorage.removeItem(key);
            removed.push(key);
            console.log(`🗑️ 删除无效认证存储数据: ${key}`);
          }
        }
        else {
          // 其他数组数据：删除
          localStorage.removeItem(key);
          removed.push(key);
          console.log(`🗑️ 删除未知数组数据: ${key}`);
        }
      }
    } catch (error) {
      errors.push(`${key}: ${(error as Error).message}`);
      console.error(`❌ 修复数据失败: ${key}`, error);
    }
  });

  return { fixed, removed, errors };
}

/**
 * 验证所有 localStorage 数据
 */
export function validateAllLocalStorageData(): {
  total: number;
  valid: number;
  invalid: { key: string; errors: string[] }[];
} {
  const validator = dataTypeValidator;
  const result = validator.validateAllStorageData();
  
  console.log(`📊 数据验证结果:`, {
    总计: result.totalItems,
    有效: result.validItems,
    无效: result.invalidItems.length,
    已清理: result.sanitizedItems.length
  });

  return {
    total: result.totalItems,
    valid: result.validItems,
    invalid: result.invalidItems
  };
}

/**
 * 立即执行修复
 */
export function immediateFixLocalStorage(): void {
  console.log('🔧 开始修复 localStorage 数据...');
  
  const fixResult = fixLocalStorageArrayIssues();
  const validationResult = validateAllLocalStorageData();
  
  console.log('🎉 修复完成:', {
    修复: fixResult.fixed.length,
    删除: fixResult.removed.length,
    错误: fixResult.errors.length,
    总验证: validationResult.total,
    有效: validationResult.valid,
    无效: validationResult.invalid.length
  });

  if (fixResult.errors.length > 0) {
    console.error('🚨 修复过程中的错误:', fixResult.errors);
  }

  if (validationResult.invalid.length > 0) {
    console.warn('⚠️ 仍有无效数据:', validationResult.invalid);
    
    // 🔧 尝试清理剩余的无效数据项
    validationResult.invalid.forEach(({ key, errors }) => {
      console.log(`🧹 清理无效数据项: ${key}`, { errors });
      
      // 对于无法修复的数据，直接删除以避免持续报错
      if (errors.some(error => 
        error.includes('u64cdu4f5cu5931u8d25') || 
        error.includes('u64cdu4f5cu5931u8d25') ||
        error.includes('u64cdu4f5cu5931u8d25')
      )) {
        try {
          localStorage.removeItem(key);
          console.log(`✅ 已删除无效数据项: ${key}`);
        } catch (e) {
          console.error(`❌ 删除数据项失败: ${key}`, e);
        }
      }
    });
  }
}
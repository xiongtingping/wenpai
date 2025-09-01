/**
 * 🔄 数据迁移到安全存储脚本
 * 将现有的localStorage数据迁移到新的安全存储格式
 * 在浏览器开发者工具Console中运行
 */

console.log('🔄 开始数据迁移到安全存储格式...');

// 1. 备份现有数据
const backupData = {};
const allKeys = Object.keys(localStorage);
allKeys.forEach(key => {
  backupData[key] = localStorage.getItem(key);
});

console.log(`📋 备份了 ${allKeys.length} 项数据`);

// 2. 分析需要迁移的数据
const migrationMap = {
  // 品牌资产数据
  brand_assets_guest: { newFormat: 'wenpai:guest:SESSION_ID:brand_assets', type: 'guest' },
  brand_dimensions_guest: { newFormat: 'wenpai:guest:SESSION_ID:brand_dimensions', type: 'guest' },
  
  // 支付数据
  wenpai_payment_status_guest: { newFormat: 'wenpai:guest:SESSION_ID:payment:status', type: 'guest' },
  wenpai_payment_config_guest: { newFormat: 'wenpai:guest:SESSION_ID:payment:config', type: 'guest' },
  wenpai_payment_history_guest: { newFormat: 'wenpai:guest:SESSION_ID:payment:history', type: 'guest' },
  
  // 认证数据
  authing_user: { newFormat: 'wenpai:auth:USER_ID', type: 'auth', encrypt: true },
  
  // UI偏好
  theme: { newFormat: 'wenpai:ui:theme', type: 'ui' },
  ui_language: { newFormat: 'wenpai:ui:language', type: 'ui' },
  ui_sidebar_collapsed: { newFormat: 'wenpai:ui:sidebar_collapsed', type: 'ui' }
};

// 3. 生成访客会话ID
const guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
console.log(`👤 生成访客会话ID: ${guestSessionId}`);

// 4. 执行迁移
let migratedCount = 0;
let errorCount = 0;
const migrationLog = [];

Object.keys(migrationMap).forEach(oldKey => {
  const migration = migrationMap[oldKey];
  const data = localStorage.getItem(oldKey);
  
  if (!data) return;
  
  try {
    let newKey = migration.newFormat;
    
    // 替换占位符
    if (migration.type === 'guest') {
      newKey = newKey.replace('SESSION_ID', guestSessionId);
    } else if (migration.type === 'auth') {
      // 解析用户ID
      try {
        const userData = JSON.parse(data);
        if (userData.id) {
          newKey = newKey.replace('USER_ID', userData.id);
        } else {
          console.warn(`⚠️ 无法获取用户ID，跳过: ${oldKey}`);
          return;
        }
      } catch (e) {
        console.error(`❌ 解析认证数据失败: ${oldKey}`, e);
        errorCount++;
        return;
      }
    }
    
    // 迁移数据
    if (migration.encrypt) {
      // 对于加密数据，这里暂时保持明文，等待安全存储类处理
      localStorage.setItem(newKey, data);
    } else {
      localStorage.setItem(newKey, data);
    }
    
    // 删除旧键
    localStorage.removeItem(oldKey);
    
    migratedCount++;
    migrationLog.push({
      old: oldKey,
      new: newKey,
      type: migration.type,
      encrypted: !!migration.encrypt
    });
    
    console.log(`📦 迁移成功: ${oldKey} -> ${newKey}`);
  } catch (error) {
    console.error(`❌ 迁移失败: ${oldKey}`, error);
    errorCount++;
  }
});

// 5. 处理动态用户数据键 (包含用户ID的键)
allKeys.forEach(key => {
  if (migrationMap[key]) return; // 已处理
  
  // 匹配用户特定的键模式
  const userKeyPatterns = [
    /^brand_assets_([a-f0-9]{24})$/,
    /^brand_dimensions_([a-f0-9]{24})$/,
    /^wenpai_payment_(\w+)_([a-f0-9]{24})$/
  ];
  
  userKeyPatterns.forEach(pattern => {
    const match = key.match(pattern);
    if (match) {
      const data = localStorage.getItem(key);
      if (!data) return;
      
      try {
        let newKey;
        const userId = match[match.length - 1]; // 最后一个捕获组是用户ID
        
        if (key.startsWith('brand_assets_')) {
          newKey = `wenpai:user:${userId}:brand_assets`;
        } else if (key.startsWith('brand_dimensions_')) {
          newKey = `wenpai:user:${userId}:brand_dimensions`;
        } else if (key.startsWith('wenpai_payment_')) {
          const paymentType = match[1];
          newKey = `wenpai:user:${userId}:payment:${paymentType}`;
        }
        
        if (newKey) {
          localStorage.setItem(newKey, data);
          localStorage.removeItem(key);
          
          migratedCount++;
          migrationLog.push({
            old: key,
            new: newKey,
            type: 'user',
            userId: userId
          });
          
          console.log(`📦 用户数据迁移: ${key} -> ${newKey}`);
        }
      } catch (error) {
        console.error(`❌ 用户数据迁移失败: ${key}`, error);
        errorCount++;
      }
    }
  });
});

// 6. 输出迁移结果
console.log(`\n✅ 数据迁移完成！`);
console.log(`📊 迁移统计:`);
console.log(`   - 成功迁移: ${migratedCount} 项`);
console.log(`   - 迁移失败: ${errorCount} 项`);
console.log(`   - 访客会话ID: ${guestSessionId}`);

if (migrationLog.length > 0) {
  console.log(`\n📋 迁移详情:`);
  migrationLog.forEach(log => {
    console.log(`   ${log.old} -> ${log.new} (${log.type})`);
  });
}

// 7. 验证迁移结果
const newKeys = Object.keys(localStorage);
const wenpaiKeys = newKeys.filter(key => key.startsWith('wenpai:'));
const oldFormatKeys = newKeys.filter(key => 
  !key.startsWith('wenpai:') && 
  (key.includes('brand_') || key.includes('payment_') || key === 'authing_user')
);

console.log(`\n🔍 迁移验证:`);
console.log(`   - 新格式键: ${wenpaiKeys.length} 个`);
console.log(`   - 遗留旧格式键: ${oldFormatKeys.length} 个`);

if (oldFormatKeys.length > 0) {
  console.warn(`⚠️ 仍有遗留的旧格式键:`, oldFormatKeys);
}

// 8. 清理无关的旧数据
const cleanupKeys = newKeys.filter(key => 
  !key.startsWith('wenpai:') && 
  !key.startsWith('react-') && 
  !key.startsWith('vite-') &&
  key !== 'theme' &&
  key !== 'language'
);

if (cleanupKeys.length > 0) {
  console.log(`\n🧹 清理无关数据: ${cleanupKeys.length} 项`);
  cleanupKeys.forEach(key => {
    console.log(`🗑️ 清理: ${key}`);
    localStorage.removeItem(key);
  });
}

console.log(`\n✅ 数据迁移和清理全部完成！`);
console.log(`🔄 请刷新页面以使用新的安全存储系统`);

// 9. 设置访客会话ID
localStorage.setItem('wenpai:guest:session', guestSessionId);
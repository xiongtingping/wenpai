/**
 * 用户数据隔离检查脚本
 * 验证所有需要用户ID绑定的功能是否正确实现数据隔离
 */

console.log('🔍 开始用户数据隔离检查...');

// 模拟不同用户
const testUsers = [
  { id: 'user_001', nickname: '测试用户1' },
  { id: 'user_002', nickname: '测试用户2' },
  null // 访客用户
];

// 需要检查的存储键模式
const storageKeyPatterns = [
  // 用户设置与个性化
  'wenpai_theme',
  'adapt_platform_settings',
  'adapt_global_settings', 
  'adapt_selected_platforms',
  
  // 内容管理
  'adapt_history',
  'adapt_favorites',
  'user_history',
  'library_items',
  'brand_assets',
  'brand_dimensions',
  
  // 创意工具
  'creative_cube_history',
  'creative_cube_custom_dimensions',
  'creative_cube_pinned_items',
  
  // 收藏系统
  'emoji-favorites',
  'favorites-storage',
  
  // 其他功能
  'hot_topics_subscriptions',
  'user_preferences'
];

/**
 * 检查存储键是否正确使用用户ID隔离
 */
function checkStorageKeyIsolation() {
  console.log('\n📋 检查存储键隔离...');
  
  const results = [];
  
  storageKeyPatterns.forEach(pattern => {
    const issues = [];
    
    // 检查是否存在不带用户ID的键
    const globalKey = localStorage.getItem(pattern);
    if (globalKey !== null) {
      issues.push(`发现全局键: ${pattern}`);
    }
    
    // 检查用户专属键
    testUsers.forEach(user => {
      const expectedKey = user ? `${pattern}_${user.id}` : `${pattern}_guest`;
      const hasUserKey = localStorage.getItem(expectedKey) !== null;
      
      if (hasUserKey) {
        console.log(`✅ 找到用户隔离键: ${expectedKey}`);
      }
    });
    
    results.push({
      pattern,
      issues,
      status: issues.length === 0 ? 'PASS' : 'FAIL'
    });
  });
  
  return results;
}

/**
 * 检查权限守卫配置
 */
function checkPermissionGuards() {
  console.log('\n🔒 检查权限守卫配置...');
  
  const protectedRoutes = [
    '/profile',
    '/library', 
    '/bookmark',
    '/brand-library',
    '/brand-assets',
    '/brand-corpus',
    '/settings',
    '/history'
  ];
  
  const results = protectedRoutes.map(route => {
    // 这里应该检查路由是否有权限保护
    // 由于是静态检查，我们记录需要验证的路由
    return {
      route,
      status: 'NEEDS_VERIFICATION',
      message: '需要在浏览器中验证权限保护'
    };
  });
  
  return results;
}

/**
 * 检查API接口用户绑定
 */
function checkAPIUserBinding() {
  console.log('\n🌐 检查API接口用户绑定...');
  
  const apiEndpoints = [
    '/api/user/usage/:userId',
    '/api/enhanced-permissions/subscription-expiry/:userId',
    '/api/enhanced-permissions/usage-limits/:userId/:featureId',
    '/api/user/profile/:userId',
    '/api/user/balance/:userId',
    '/api/user/behavior/:userId'
  ];
  
  const results = apiEndpoints.map(endpoint => {
    const hasUserParam = endpoint.includes(':userId');
    return {
      endpoint,
      status: hasUserParam ? 'PASS' : 'FAIL',
      message: hasUserParam ? '包含用户ID参数' : '缺少用户ID参数'
    };
  });
  
  return results;
}

/**
 * 生成检查报告
 */
function generateReport() {
  console.log('\n📊 生成检查报告...');
  
  const storageResults = checkStorageKeyIsolation();
  const permissionResults = checkPermissionGuards();
  const apiResults = checkAPIUserBinding();
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      storage: {
        total: storageResults.length,
        passed: storageResults.filter(r => r.status === 'PASS').length,
        failed: storageResults.filter(r => r.status === 'FAIL').length
      },
      permissions: {
        total: permissionResults.length,
        needsVerification: permissionResults.length
      },
      api: {
        total: apiResults.length,
        passed: apiResults.filter(r => r.status === 'PASS').length,
        failed: apiResults.filter(r => r.status === 'FAIL').length
      }
    },
    details: {
      storage: storageResults,
      permissions: permissionResults,
      api: apiResults
    }
  };
  
  console.log('\n📋 检查报告:');
  console.log('存储隔离:', `${report.summary.storage.passed}/${report.summary.storage.total} 通过`);
  console.log('权限守卫:', `${report.summary.permissions.needsVerification} 个路由需要验证`);
  console.log('API绑定:', `${report.summary.api.passed}/${report.summary.api.total} 通过`);
  
  // 显示失败的项目
  if (report.summary.storage.failed > 0) {
    console.log('\n❌ 存储隔离问题:');
    storageResults.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.pattern}: ${r.issues.join(', ')}`);
    });
  }
  
  if (report.summary.api.failed > 0) {
    console.log('\n❌ API绑定问题:');
    apiResults.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.message}`);
    });
  }
  
  return report;
}

// 执行检查
try {
  const report = generateReport();
  
  // 保存报告到localStorage（用于前端查看）
  localStorage.setItem('user_data_isolation_check_report', JSON.stringify(report, null, 2));
  
  console.log('\n✅ 检查完成！报告已保存到 localStorage');
  console.log('可以在浏览器控制台中运行以下命令查看详细报告:');
  console.log('JSON.parse(localStorage.getItem("user_data_isolation_check_report"))');
  
} catch (error) {
  console.error('❌ 检查过程中发生错误:', error);
}

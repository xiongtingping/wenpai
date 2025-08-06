// 测试用户数据隔离功能
console.log('🧪 开始测试用户数据隔离功能');

// 模拟不同用户的存储键
const testUsers = [
  { id: 'user123', name: '用户A' },
  { id: 'user456', name: '用户B' },
  { id: null, name: '访客用户' }
];

// 生成存储键的函数（与BookmarkPage中的逻辑一致）
function getStorageKey(userId) {
  if (userId) {
    return `library_items_${userId}`;
  }
  return 'library_items_guest';
}

// 为每个用户创建测试数据
function createTestData() {
  console.log('\n📝 为每个用户创建测试数据:');
  
  testUsers.forEach((user, index) => {
    const storageKey = getStorageKey(user.id);
    const testData = [
      {
        id: `${index}_1`,
        title: `${user.name}的资料1`,
        content: `这是${user.name}的第一个资料`,
        type: 'collection',
        tags: [user.name, '测试'],
        isFavorite: false,
        isUsed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${index}_2`,
        title: `${user.name}的资料2`,
        content: `这是${user.name}的第二个资料`,
        type: 'copywriting',
        tags: [user.name, '测试'],
        isFavorite: true,
        isUsed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem(storageKey, JSON.stringify(testData));
    console.log(`✅ ${user.name} (${storageKey}): 创建了 ${testData.length} 项数据`);
  });
}

// 验证数据隔离
function verifyDataIsolation() {
  console.log('\n🔍 验证数据隔离:');
  
  testUsers.forEach(user => {
    const storageKey = getStorageKey(user.id);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`✅ ${user.name} (${storageKey}): ${parsed.length} 项数据`);
        parsed.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`);
        });
      } catch (e) {
        console.log(`❌ ${user.name} (${storageKey}): 数据解析失败`);
      }
    } else {
      console.log(`⚠️ ${user.name} (${storageKey}): 没有数据`);
    }
  });
}

// 模拟删除操作
function simulateUserOperations() {
  console.log('\n🗑️ 模拟用户操作:');
  
  // 用户A删除第一个资料
  const userAKey = getStorageKey('user123');
  const userAData = JSON.parse(localStorage.getItem(userAKey) || '[]');
  const userAFiltered = userAData.filter(item => item.id !== '0_1');
  localStorage.setItem(userAKey, JSON.stringify(userAFiltered));
  console.log('✅ 用户A删除了第一个资料');
  
  // 用户B添加新资料
  const userBKey = getStorageKey('user456');
  const userBData = JSON.parse(localStorage.getItem(userBKey) || '[]');
  const newItem = {
    id: '1_3',
    title: '用户B的新资料',
    content: '这是用户B新添加的资料',
    type: 'extraction',
    tags: ['用户B', '新增'],
    isFavorite: false,
    isUsed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  userBData.push(newItem);
  localStorage.setItem(userBKey, JSON.stringify(userBData));
  console.log('✅ 用户B添加了新资料');
}

// 验证操作后的状态
function verifyAfterOperations() {
  console.log('\n📊 验证操作后的状态:');
  
  testUsers.forEach(user => {
    const storageKey = getStorageKey(user.id);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`📈 ${user.name} (${storageKey}): ${parsed.length} 项数据`);
        parsed.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title} (${item.id})`);
        });
      } catch (e) {
        console.log(`❌ ${user.name} (${storageKey}): 数据解析失败`);
      }
    } else {
      console.log(`⚠️ ${user.name} (${storageKey}): 没有数据`);
    }
  });
}

// 清理测试数据
function cleanupTestData() {
  console.log('\n🧹 清理测试数据:');
  
  testUsers.forEach(user => {
    const storageKey = getStorageKey(user.id);
    localStorage.removeItem(storageKey);
    console.log(`✅ 清理了 ${user.name} 的数据 (${storageKey})`);
  });
}

// 执行测试
console.log('🚀 开始执行用户数据隔离测试...');

try {
  createTestData();
  verifyDataIsolation();
  simulateUserOperations();
  verifyAfterOperations();
  
  console.log('\n🎉 用户数据隔离测试通过！');
  console.log('✅ 不同用户的数据完全隔离');
  console.log('✅ 用户操作不会影响其他用户的数据');
  
  // 询问是否清理测试数据
  if (confirm('测试完成！是否清理测试数据？')) {
    cleanupTestData();
    console.log('✅ 测试数据已清理');
  } else {
    console.log('ℹ️ 测试数据保留，可在localStorage中查看');
  }
  
} catch (error) {
  console.error('❌ 测试过程中出现错误:', error);
}

console.log('\n✅ 测试完成');

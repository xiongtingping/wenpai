// 测试BookmarkPage的localStorage功能
console.log('🧪 开始测试BookmarkPage localStorage功能');

// 1. 检查localStorage中的数据
function checkLocalStorage() {
  console.log('\n📂 检查localStorage中的数据:');
  const keys = Object.keys(localStorage);
  const libraryKeys = keys.filter(key => key.startsWith('library_items_'));
  
  if (libraryKeys.length === 0) {
    console.log('❌ 没有找到任何资料库数据');
    return false;
  }
  
  libraryKeys.forEach(key => {
    const data = localStorage.getItem(key);
    try {
      const parsed = JSON.parse(data);
      console.log(`✅ ${key}: ${parsed.length} 项`);
      parsed.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} (${item.type})`);
      });
    } catch (e) {
      console.log(`❌ ${key}: 解析错误`);
    }
  });
  
  return true;
}

// 2. 模拟删除操作
function simulateDelete(itemId) {
  console.log(`\n🗑️ 模拟删除项目: ${itemId}`);
  
  const keys = Object.keys(localStorage);
  const libraryKeys = keys.filter(key => key.startsWith('library_items_'));
  
  libraryKeys.forEach(key => {
    const data = localStorage.getItem(key);
    try {
      const parsed = JSON.parse(data);
      const filtered = parsed.filter(item => item.id !== itemId);
      localStorage.setItem(key, JSON.stringify(filtered));
      console.log(`✅ 从 ${key} 中删除了项目 ${itemId}`);
      console.log(`📊 剩余项目数: ${filtered.length}`);
    } catch (e) {
      console.log(`❌ 处理 ${key} 时出错:`, e);
    }
  });
}

// 3. 验证删除后的状态
function verifyAfterDelete(itemId) {
  console.log(`\n🔍 验证删除后的状态:`);
  
  const keys = Object.keys(localStorage);
  const libraryKeys = keys.filter(key => key.startsWith('library_items_'));
  
  let found = false;
  libraryKeys.forEach(key => {
    const data = localStorage.getItem(key);
    try {
      const parsed = JSON.parse(data);
      const item = parsed.find(item => item.id === itemId);
      if (item) {
        console.log(`❌ 项目 ${itemId} 仍然存在于 ${key} 中!`);
        found = true;
      }
    } catch (e) {
      console.log(`❌ 检查 ${key} 时出错:`, e);
    }
  });
  
  if (!found) {
    console.log(`✅ 项目 ${itemId} 已成功删除`);
  }
  
  return !found;
}

// 执行测试
console.log('🚀 开始执行测试...');

// 检查初始状态
const hasData = checkLocalStorage();

if (hasData) {
  // 模拟删除第一个项目
  simulateDelete('1');
  
  // 验证删除结果
  const deleteSuccess = verifyAfterDelete('1');
  
  if (deleteSuccess) {
    console.log('\n🎉 测试通过！localStorage删除功能正常工作');
  } else {
    console.log('\n❌ 测试失败！localStorage删除功能有问题');
  }
  
  // 显示最终状态
  console.log('\n📊 最终状态:');
  checkLocalStorage();
} else {
  console.log('\n⚠️ 没有测试数据，请先访问BookmarkPage页面');
}

console.log('\n✅ 测试完成');

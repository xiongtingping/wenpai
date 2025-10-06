// 清除所有缓存并重新加载
console.log('🧹 开始清除缓存...');

// 1. 清除localStorage中的Token统计缓存
const store = JSON.parse(localStorage.getItem('wenpai-unified-store') || '{}');
if (store.state && store.state.tokenUsage) {
  console.log('📊 当前Token统计:', store.state.tokenUsage.currentStats);
  store.state.tokenUsage.currentStats = null;
  localStorage.setItem('wenpai-unified-store', JSON.stringify(store));
  console.log('✅ 已清除Token统计缓存');
}

// 2. 清除所有缓存键
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('token') || key.includes('usage') || key.includes('cache'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ 已删除:', key);
});

console.log('✅ 缓存清除完成，即将刷新页面...');
setTimeout(() => {
  location.reload();
}, 1000);


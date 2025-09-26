/**
 * 强制刷新Emoji翻译系统
 * 在浏览器控制台中运行此脚本
 */

console.log('🔄 强制刷新Emoji翻译系统...');

// 测试我们刚刚添加的翻译
const newTranslations = [
  'skull_crossbones',
  'slight_frown', 
  'slight_smile',
  'smile_cat',
  'smiley_cat',
  'smirk_cat',
  'space_invader',
  'sparkling_heart',
  'speak_no_evil',
  'two_hearts',
  'upside_down',
  'yum'
];

console.log('📝 新增翻译测试:', newTranslations);

// 清除可能的缓存
if (typeof localStorage !== 'undefined') {
  // 清除emoji相关的本地存储
  Object.keys(localStorage).forEach(key => {
    if (key.includes('emoji') || key.includes('unified')) {
      localStorage.removeItem(key);
      console.log(`🗑️ 清除缓存: ${key}`);
    }
  });
}

// 强制重新加载emoji系统
if (typeof window !== 'undefined' && window.location) {
  console.log('🔄 建议刷新页面以应用新翻译');
  console.log('💡 或者导航到创意魔方页面查看效果');
  console.log('📍 URL: ' + window.location.origin + '/creative-studio#emoji');
}

// 提供手动测试函数
window.testEmojiTranslations = function() {
  console.log('🧪 测试emoji翻译映射...');
  
  // 模拟翻译测试
  const testResults = newTranslations.map(name => ({
    original: name,
    expected: getExpectedTranslation(name),
    status: '待验证'
  }));
  
  console.table(testResults);
};

function getExpectedTranslation(name) {
  const translations = {
    'skull_crossbones': '骷髅交叉骨',
    'slight_frown': '轻微皱眉',
    'slight_smile': '轻微微笑',
    'smile_cat': '微笑猫',
    'smiley_cat': '笑脸猫',
    'smirk_cat': '得意猫',
    'space_invader': '太空侵略者',
    'sparkling_heart': '闪闪发光的心',
    'speak_no_evil': '不说邪恶',
    'two_hearts': '两颗心',
    'upside_down': '倒置脸',
    'yum': '美味'
  };
  return translations[name] || '未找到翻译';
}

console.log('✅ 刷新脚本准备完毕！');
console.log('🔧 运行 testEmojiTranslations() 来测试翻译映射');
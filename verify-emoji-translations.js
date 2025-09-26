/**
 * 验证Emoji翻译效果的脚本
 */

console.log('🔍 验证Emoji翻译效果...');

// 截图中发现的未翻译emoji名称
const targetEmojis = [
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
  'upside_down_face',
  'yum'
];

console.log('📋 待验证的emoji翻译:');
console.table(targetEmojis.map(name => ({
  英文名称: name,
  预期中文: getExpectedTranslation(name),
  状态: '待验证'
})));

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
    'upside_down_face': '倒置脸',
    'yum': '美味'
  };
  return translations[name] || '未定义';
}

console.log('');
console.log('🎯 验证步骤:');
console.log('1. 打开创意魔方页面: http://localhost:5173/creative-studio');
console.log('2. 点击Emoji头像生成工具');
console.log('3. 查看emoji网格中是否还有英文名称');
console.log('4. 确认上述emoji已显示为中文名称');
console.log('');
console.log('✅ 如果所有emoji都显示中文名称，说明翻译系统工作正常');
console.log('❌ 如果仍有英文名称，可能需要清除浏览器缓存或重新加载页面');

// 提供清除缓存的函数
window.clearEmojiCache = function() {
  console.log('🗑️ 清除emoji相关缓存...');
  
  if (typeof localStorage !== 'undefined') {
    let cleared = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.includes('emoji') || key.includes('unified') || key.includes('translation')) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
    console.log(`✅ 清除了 ${cleared} 个缓存项`);
  }
  
  if (typeof sessionStorage !== 'undefined') {
    let cleared = 0;
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('emoji') || key.includes('unified') || key.includes('translation')) {
        sessionStorage.removeItem(key);
        cleared++;
      }
    });
    console.log(`✅ 清除了 ${cleared} 个会话缓存项`);
  }
  
  console.log('🔄 建议刷新页面以重新加载emoji数据');
};

console.log('💡 运行 clearEmojiCache() 来清除缓存');
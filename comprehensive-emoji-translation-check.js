/**
 * 全面的Emoji翻译检查工具
 * 在浏览器控制台中运行，帮助发现还未翻译的emoji
 */

console.log('🔍 全面Emoji翻译检查工具');

// 已知的英文emoji名称模式
const englishPatterns = [
  /^[a-z_]+$/,           // 纯英文小写加下划线
  /\b(face|cat|heart|smile|frown|kiss|love|japanese|upside|down)\b/,  // 常见英文关键词
  /\b(monocle|nerd|pleading|relieved|scream|goblin|ogre)\b/,          // 特定英文词
];

// 常见的未翻译emoji名称（基于经验预测）
const likelyUntranslatedEmojis = [
  // 可能的表情系列
  'winking_face',
  'squinting_face', 
  'grimacing_face',
  'hushed_face',
  'flushed_face',
  'disappointed_face',
  'worried_face',
  'confused_face',
  'expressionless_face',
  'neutral_face',
  
  // 可能的动物系列
  'monkey_face',
  'dog_face', 
  'wolf_face',
  'fox_face',
  'cat_face',
  'lion_face',
  'tiger_face',
  'horse_face',
  'cow_face',
  'pig_face',
  
  // 可能的手势系列
  'thumbs_up',
  'thumbs_down',
  'clapping_hands',
  'raised_hands',
  'folded_hands',
  'crossed_fingers',
  'peace_sign',
  'ok_hand',
  'call_me_hand',
  'raised_fist',
  
  // 可能的心形系列
  'blue_heart',
  'green_heart', 
  'yellow_heart',
  'orange_heart',
  'purple_heart',
  'brown_heart',
  'black_heart',
  'white_heart',
  'broken_heart',
  
  // 可能的食物系列
  'green_apple',
  'red_apple',
  'hamburger',
  'pizza',
  'hot_dog',
  'taco',
  'burrito',
  'spaghetti',
  'ice_cream',
  'birthday_cake'
];

function checkEmojiTranslation() {
  console.log('🔍 开始检查emoji翻译状态...');
  
  // 模拟检查过程
  const results = {
    translated: [],
    untranslated: [],
    needsCheck: []
  };
  
  likelyUntranslatedEmojis.forEach(name => {
    // 这里是模拟逻辑，实际需要与翻译系统集成
    const hasTranslation = checkIfHasTranslation(name);
    
    if (hasTranslation) {
      results.translated.push(name);
    } else {
      results.untranslated.push(name);
    }
  });
  
  console.log('📊 检查结果:');
  console.log(`✅ 已翻译: ${results.translated.length} 个`);
  console.log(`❌ 未翻译: ${results.untranslated.length} 个`);
  
  if (results.untranslated.length > 0) {
    console.log('');
    console.log('🚨 发现可能未翻译的emoji:');
    results.untranslated.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
  }
  
  return results;
}

// 模拟检查翻译是否存在的函数
function checkIfHasTranslation(emojiName) {
  // 基于我们已知的翻译进行检查
  const knownTranslations = new Set([
    // 第一批已翻译
    'skull_crossbones', 'slight_frown', 'slight_smile', 'smile_cat', 
    'smiley_cat', 'smirk_cat', 'space_invader', 'sparkling_heart',
    'speak_no_evil', 'two_hearts', 'upside_down_face', 'yum',
    
    // 第二批已翻译  
    'heartpulse', 'japanese_goblin', 'japanese_ogre', 'kiss',
    'kissing_closed_eyes', 'love_letter', 'monocle', 'nerd',
    'pleading', 'relieved', 'scream',
    
    // 基础表情（应该已存在）
    'smile', 'grin', 'laughing', 'joy', 'wink', 'blush',
    'heart_eyes', 'kissing_heart', 'angry', 'cry', 'sob'
  ]);
  
  return knownTranslations.has(emojiName);
}

// 自动检查当前页面中的emoji
window.checkPageEmojis = function() {
  console.log('🔍 检查当前页面的emoji...');
  
  // 查找页面中可能的emoji元素
  const emojiElements = document.querySelectorAll('[class*="emoji"], [data-emoji], .emoji-item, .avatar-card');
  
  console.log(`📄 找到 ${emojiElements.length} 个可能的emoji元素`);
  
  let englishCount = 0;
  const englishEmojis = [];
  
  emojiElements.forEach((element, index) => {
    const text = element.textContent || element.title || element.alt || '';
    
    // 检查是否包含英文
    if (/[a-zA-Z]/.test(text) && englishPatterns.some(pattern => pattern.test(text))) {
      englishCount++;
      englishEmojis.push({
        index: index + 1,
        text: text.trim(),
        element: element
      });
    }
  });
  
  console.log(`🚨 发现 ${englishCount} 个可能未翻译的emoji`);
  
  if (englishEmojis.length > 0) {
    console.log('');
    console.log('📝 详细列表:');
    englishEmojis.slice(0, 10).forEach(({index, text}) => {
      console.log(`${index}. "${text}"`);
    });
    
    if (englishEmojis.length > 10) {
      console.log(`... 还有 ${englishEmojis.length - 10} 个`);
    }
  }
  
  return englishEmojis;
};

// 提供翻译建议
window.suggestTranslations = function() {
  console.log('💡 翻译建议生成器');
  
  const pageEmojis = window.checkPageEmojis();
  
  if (pageEmojis.length === 0) {
    console.log('✅ 页面中没有发现英文emoji名称');
    return;
  }
  
  console.log('');
  console.log('📝 翻译建议:');
  
  pageEmojis.slice(0, 5).forEach(({text}) => {
    const suggestion = generateTranslationSuggestion(text);
    console.log(`'${text.toLowerCase().replace(/\s+/g, '_')}': '${suggestion}',`);
  });
};

// 生成翻译建议
function generateTranslationSuggestion(englishName) {
  const translations = {
    'face': '脸',
    'smile': '微笑', 
    'frown': '皱眉',
    'heart': '心',
    'cat': '猫',
    'dog': '狗',
    'japanese': '日本',
    'upside': '倒置',
    'down': '向下',
    'closed': '闭合',
    'eyes': '眼睛',
    'letter': '信件',
    'love': '爱',
    'kiss': '亲吻'
  };
  
  let suggestion = englishName.toLowerCase();
  
  // 简单的词汇替换
  Object.keys(translations).forEach(eng => {
    suggestion = suggestion.replace(new RegExp(eng, 'g'), translations[eng]);
  });
  
  return suggestion || '需要人工翻译';
}

console.log('');
console.log('🎯 使用指南:');
console.log('1. checkEmojiTranslation() - 检查预设的emoji翻译状态');
console.log('2. checkPageEmojis() - 检查当前页面的emoji');
console.log('3. suggestTranslations() - 生成翻译建议');
console.log('');
console.log('💡 建议先运行 checkPageEmojis() 查看实际情况');
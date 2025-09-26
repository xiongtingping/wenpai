/**
 * 强制执行emoji翻译修复
 * 在浏览器控制台中执行
 */

console.log('🔧 强制执行emoji翻译修复...');

// 英文到中文的翻译映射（精简版）
const translationMap = {
  // 脸部表情
  'wink': '眨眼',
  'smile': '微笑',
  'grin': '咧嘴笑',
  'laughing': '大笑',
  'joy': '开心',
  'smiley': '笑脸',
  'happy': '开心',
  'blush': '脸红',
  'relaxed': '放松',
  'winking_face': '眨眼脸',
  'heart_eyes': '爱心眼',
  'kissing_heart': '飞吻',
  'kissing': '亲吻',
  'stuck_out_tongue': '吐舌头',
  'disappointed': '失望',
  'worried': '担心',
  'angry': '生气',
  'rage': '愤怒',
  'cry': '哭泣',
  'sob': '痛哭',
  'tired_face': '疲惫',
  'sleeping': '睡觉',
  'mask': '口罩',
  'sunglasses': '墨镜',
  'confused': '困惑',
  'innocent': '无辜',
  'smirk': '得意',
  'sweat_smile': '苦笑',
  
  // 动物
  'cat': '猫',
  'dog': '狗',
  'mouse': '老鼠',
  'hamster': '仓鼠',
  'rabbit': '兔子',
  'fox': '狐狸',
  'bear': '熊',
  'panda': '熊猫',
  'koala': '考拉',
  'tiger': '老虎',
  'lion': '狮子',
  'cow': '牛',
  'pig': '猪',
  'frog': '青蛙',
  'monkey': '猴子',
  'chicken': '鸡',
  'penguin': '企鹅',
  'bird': '鸟',
  'duck': '鸭子',
  'fish': '鱼',
  'whale': '鲸鱼',
  'dolphin': '海豚',
  'shark': '鲨鱼',
  'octopus': '章鱼',
  'bee': '蜜蜂',
  'butterfly': '蝴蝶',
  'spider': '蜘蛛',
  'snake': '蛇',
  'turtle': '乌龟',
  
  // 食物
  'apple': '苹果',
  'banana': '香蕉',
  'orange': '橙子',
  'strawberry': '草莓',
  'grapes': '葡萄',
  'watermelon': '西瓜',
  'peach': '桃子',
  'pineapple': '菠萝',
  'mango': '芒果',
  'lemon': '柠檬',
  'coconut': '椰子',
  'bread': '面包',
  'cheese': '奶酪',
  'hamburger': '汉堡',
  'pizza': '披萨',
  'hotdog': '热狗',
  'fries': '薯条',
  'popcorn': '爆米花',
  'doughnut': '甜甜圈',
  'cookie': '饼干',
  'cake': '蛋糕',
  'chocolate': '巧克力',
  'candy': '糖果',
  'ice_cream': '冰淇淋',
  'coffee': '咖啡',
  'tea': '茶',
  'milk': '牛奶',
  'beer': '啤酒',
  'wine': '红酒',
  
  // 物品
  'car': '汽车',
  'bike': '自行车',
  'bus': '公交车',
  'train': '火车',
  'airplane': '飞机',
  'ship': '船',
  'rocket': '火箭',
  'phone': '电话',
  'computer': '电脑',
  'watch': '手表',
  'camera': '相机',
  'book': '书',
  'pen': '笔',
  'key': '钥匙',
  'lock': '锁',
  'hammer': '锤子',
  'crown': '皇冠',
  'hat': '帽子',
  'glasses': '眼镜',
  'shoe': '鞋',
  'bag': '包',
  'umbrella': '雨伞',
  'ring': '戒指',
  
  // 自然
  'sun': '太阳',
  'moon': '月亮',
  'star': '星星',
  'cloud': '云',
  'rain': '雨',
  'snow': '雪',
  'fire': '火',
  'water': '水',
  'earth': '地球',
  'mountain': '山',
  'tree': '树',
  'flower': '花',
  'rose': '玫瑰',
  'leaves': '叶子',
  'grass': '草',
  
  // 手势
  'thumbs_up': '竖起大拇指',
  'thumbs_down': '大拇指向下',
  'clap': '鼓掌',
  'wave': '挥手',
  'peace_sign': '和平手势',
  'ok_hand': 'OK手势',
  'pray': '祈祷',
  'muscle': '肌肉',
  
  // 符号
  'heart': '爱心',
  'broken_heart': '心碎',
  'peace': '和平',
  'check': '勾选',
  'warning': '警告',
  'star': '星星'
};

// 智能翻译函数
function smartTranslate(name) {
  // 如果已经是中文，直接返回
  if (!/[a-zA-Z]/.test(name)) {
    return name;
  }
  
  // 清理名称
  const cleanName = name.toLowerCase().replace(/_/g, '_');
  
  // 直接翻译
  if (translationMap[cleanName]) {
    return translationMap[cleanName];
  }
  
  // 移除_face后缀再试
  const withoutFace = cleanName.replace(/_face$/, '');
  if (withoutFace !== cleanName && translationMap[withoutFace]) {
    return translationMap[withoutFace] + '脸';
  }
  
  // 处理颜色前缀
  const colorPrefixes = {
    'red_': '红色',
    'blue_': '蓝色', 
    'green_': '绿色',
    'yellow_': '黄色',
    'orange_': '橙色',
    'purple_': '紫色',
    'pink_': '粉色',
    'brown_': '棕色',
    'black_': '黑色',
    'white_': '白色'
  };
  
  for (const [prefix, chinese] of Object.entries(colorPrefixes)) {
    if (cleanName.startsWith(prefix)) {
      const baseWord = cleanName.substring(prefix.length);
      if (translationMap[baseWord]) {
        return chinese + translationMap[baseWord];
      }
    }
  }
  
  // 分词翻译
  const words = cleanName.split('_');
  if (words.length > 1) {
    const translated = words.map(word => translationMap[word] || word);
    const hasTranslation = translated.some(word => translationMap[word]);
    if (hasTranslation) {
      return translated.join('');
    }
  }
  
  // 返回格式化的英文名称
  return name.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// 强制执行翻译
async function forceTranslation() {
  try {
    console.log('🔄 尝试获取emoji数据...');
    
    // 尝试从emoji系统获取数据
    let emojis = [];
    try {
      const emojiModule = await import('./src/services/unifiedEmojiSystem.ts');
      emojis = emojiModule.getAllEmojis();
      console.log(`✅ 从emoji系统获取数据: ${emojis.length} 个`);
    } catch (error) {
      console.log('⚠️ 无法从emoji系统获取数据，尝试其他方法...');
      
      // 尝试从window全局对象获取
      if (window.debugEmojis) {
        emojis = window.debugEmojis;
        console.log(`✅ 从全局对象获取数据: ${emojis.length} 个`);
      } else {
        console.log('❌ 无法获取emoji数据');
        return;
      }
    }
    
    // 统计英文名称
    let englishCount = 0;
    let translatedCount = 0;
    const translations = [];
    
    emojis.forEach(emoji => {
      if (/[a-zA-Z]/.test(emoji.name)) {
        englishCount++;
        const originalName = emoji.name;
        const translatedName = smartTranslate(emoji.name);
        
        if (translatedName !== originalName) {
          emoji.name = translatedName;
          translatedCount++;
          translations.push({
            emoji: emoji.emoji,
            oldName: originalName,
            newName: translatedName
          });
        }
      }
    });
    
    console.log(`\n📊 翻译统计:`);
    console.log(`  发现英文名称: ${englishCount} 个`);
    console.log(`  成功翻译: ${translatedCount} 个`);
    
    if (translatedCount > 0) {
      console.log(`\n📝 翻译示例:`);
      translations.slice(0, 10).forEach(({ emoji, oldName, newName }) => {
        console.log(`  ${emoji} "${oldName}" → "${newName}"`);
      });
      
      if (translatedCount > 10) {
        console.log(`  ... 还有 ${translatedCount - 10} 个翻译`);
      }
      
      // 尝试更新数据
      try {
        const emojiModule = await import('./src/services/unifiedEmojiSystem.ts');
        emojiModule.updateEmojiData(emojis);
        console.log('✅ 数据已更新到emoji系统');
      } catch (error) {
        console.log('⚠️ 无法更新到emoji系统，但翻译已完成');
      }
      
      // 刷新页面
      console.log('\n🔄 3秒后刷新页面以查看效果...');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } else {
      console.log('🎉 所有emoji名称都已翻译或为中文！');
    }
    
  } catch (error) {
    console.error('❌ 强制翻译失败:', error);
  }
}

// 执行翻译
forceTranslation();

console.log('\n💡 强制翻译正在执行，请等待结果...');
/**
 * 强制emoji翻译修复工具
 * 直接在应用启动时执行翻译修复
 */

// 核心翻译映射表
const coreTranslations: Record<string, string> = {
  // 最常见的英文emoji名称
  'wink': '眨眼',
  'smile': '微笑', 
  'grin': '咧嘴笑',
  'laughing': '大笑',
  'joy': '开心',
  'smiley': '笑脸',
  'happy': '开心',
  'blush': '脸红',
  'heart_eyes': '爱心眼',
  'kissing_heart': '飞吻',
  'thumbs_up': '竖起大拇指',
  'thumbs_down': '大拇指向下',
  'clap': '鼓掌',
  'wave': '挥手',
  'ok_hand': 'OK手势',
  'peace_sign': '和平手势',
  'pray': '祈祷',
  'muscle': '肌肉',
  'heart': '爱心',
  'star': '星星',
  'fire': '火',
  'water': '水',
  'sun': '太阳',
  'moon': '月亮',
  'tree': '树',
  'flower': '花',
  'cat': '猫',
  'dog': '狗',
  'bear': '熊',
  'tiger': '老虎',
  'lion': '狮子',
  'monkey': '猴子',
  'apple': '苹果',
  'banana': '香蕉',
  'pizza': '披萨',
  'cake': '蛋糕',
  'car': '汽车',
  'phone': '电话',
  'book': '书'
};

/**
 * 检查是否为英文名称
 */
export function isEnglishName(name: string): boolean {
  return /[a-zA-Z]/.test(name);
}

/**
 * 简单翻译函数
 */
export function simpleTranslate(name: string): string {
  if (!isEnglishName(name)) {
    return name; // 已经是中文
  }
  
  const cleanName = name.toLowerCase().replace(/_/g, '_');
  
  // 直接映射
  if (coreTranslations[cleanName]) {
    return coreTranslations[cleanName];
  }
  
  // 移除_face后缀
  const withoutFace = cleanName.replace(/_face$/, '');
  if (withoutFace !== cleanName && coreTranslations[withoutFace]) {
    return coreTranslations[withoutFace] + '脸';
  }
  
  // 简单的分词翻译
  const words = cleanName.split('_');
  if (words.length === 2) {
    const [first, second] = words;
    const firstTranslated = coreTranslations[first];
    const secondTranslated = coreTranslations[second];
    
    if (firstTranslated && secondTranslated) {
      return firstTranslated + secondTranslated;
    } else if (firstTranslated) {
      return firstTranslated + second;
    } else if (secondTranslated) {
      return first + secondTranslated;
    }
  }
  
  // 返回原名称（优化格式）
  return name.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

/**
 * 强制执行emoji翻译修复
 */
export function forceEmojiTranslationFix(): void {
  console.log('🌐 强制executingemoji翻译fixing...');
  
  try {
    // 使用延迟执行，确保在DOM加载后执行
    setTimeout(() => {
      // 尝试从全局window对象获取emoji数据
      const checkAndTranslate = () => {
        // 检查是否有emoji相关的全局对象
        const possibleSources = [
          'emojiData',
          'unifiedEmojiData', 
          'allEmojis',
          '__EMOJI_DATA__'
        ];
        
        let emojiData: any[] = [];
        let foundSource = '';
        
        for (const source of possibleSources) {
          if ((window as any)[source] && Array.isArray((window as any)[source])) {
            emojiData = (window as any)[source];
            foundSource = source;
            break;
          }
        }
        
        if (emojiData.length === 0) {
          console.log('⚠️ not foundemojidata，尝试从localStoragegetting...');
          
          // 尝试从localStorage获取
          const storageKeys = ['emoji-data', 'unified-emoji-data', 'emojis'];
          for (const key of storageKeys) {
            const stored = localStorage.getItem(key);
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                  emojiData = parsed;
                  foundSource = `localStorage:${key}`;
                  break;
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
        
        if (emojiData.length === 0) {
          console.log('❌ none法找到emojidata源');
          return false;
        }
        
        console.log(`✅ 从 ${foundSource} 找到 ${emojiData.length} unitsemoji`);
        
        // 执行翻译
        let translatedCount = 0;
        const translations: Array<{emoji: string, oldName: string, newName: string}> = [];
        
        emojiData.forEach((emoji: any) => {
          if (emoji.name && isEnglishName(emoji.name)) {
            const originalName = emoji.name;
            const translatedName = simpleTranslate(emoji.name);
            
            if (translatedName !== originalName) {
              emoji.name = translatedName;
              translatedCount++;
              translations.push({
                emoji: emoji.emoji || '❓',
                oldName: originalName,
                newName: translatedName
              });
            }
          }
        });
        
        console.log(`🎯 completed翻译: ${translatedCount} unitsname`);
        
        if (translatedCount > 0) {
          console.log('📝 翻译example:');
          translations.slice(0, 5).forEach(({ emoji, oldName, newName }) => {
            console.log(`  ${emoji} "${oldName}" → "${newName}"`);
          });
          
          // 更新到相应的数据源
          if (foundSource.startsWith('localStorage:')) {
            const key = foundSource.split(':')[1];
            localStorage.setItem(key, JSON.stringify(emojiData));
            console.log(`✅ updated到 ${foundSource}`);
          } else {
            (window as any)[foundSource] = emojiData;
            console.log(`✅ updated到 window.${foundSource}`);
          }
          
          return true;
        }
        
        return false;
      };
      
      // 立即尝试一次
      const immediate = checkAndTranslate();
      
      if (!immediate) {
        // 如果立即执行失败，设置定时器重试
        let retryCount = 0;
        const maxRetries = 10;
        
        const retryInterval = setInterval(() => {
          retryCount++;
          console.log(`🔄 retrying翻译fixing (${retryCount}/${maxRetries})...`);
          
          const success = checkAndTranslate();
          
          if (success || retryCount >= maxRetries) {
            clearInterval(retryInterval);
            if (success) {
              console.log('✅ 翻译fixingsuccess！');
            } else {
              console.log('⚠️ 翻译fixingtimeout，请手动executing');
            }
          }
        }, 2000); // 每2秒重试一次
      }
      
    }, 1000); // 延迟1秒执行
    
  } catch (error) {
    console.error('❌ 强制翻译fixingfailed:', error);
  }
}

// 移除自动执行避免TDZ错误 - 改为手动调用
// 如需使用请手动调用 forceEmojiTranslationFix() 函数
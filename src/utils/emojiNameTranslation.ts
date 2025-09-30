/**
 * Emoji英文名称到中文名称的翻译映射系统
 * 用于解决ensureMinimumPerCategory函数中英文名称的国际化问题
 * 使用懒加载模式避免TDZ问题
 */

// 懒加载的翻译数据
let basicEmojiTranslations: Record<string, string> | null = null;
let categorySpecificTranslations: Record<string, Record<string, string>> | null = null;

async function loadTranslationData() {
  if (!basicEmojiTranslations || !categorySpecificTranslations) {
    const data = await import('./emojiTranslationData');
    basicEmojiTranslations = data.basicEmojiTranslations;
    categorySpecificTranslations = data.categorySpecificTranslations;
  }
  return { basicEmojiTranslations, categorySpecificTranslations };
}


/**
 * 将英文emoji名称翻译为中文
 */
export async function translateEmojiName(englishName: string, category?: string): Promise<string> {
  // 确保翻译数据已加载
  const { basicEmojiTranslations, categorySpecificTranslations } = await loadTranslationData();
  
  // 清理名称：移除下划线，转换为小写
  const cleanName = englishName.toLowerCase().replace(/_/g, '_');
  
  // 首先查找分类特定的翻译
  if (category && categorySpecificTranslations[category]) {
    const categoryTranslation = categorySpecificTranslations[category][cleanName];
    if (categoryTranslation) {
      return categoryTranslation;
    }
  }
  
  // 然后查找基础翻译
  const basicTranslation = basicEmojiTranslations[cleanName];
  if (basicTranslation) {
    return basicTranslation;
  }
  
  // 处理常见的变体和后缀
  const withoutFace = cleanName.replace(/_face$/, '');
  if (withoutFace !== cleanName) {
    const withoutFaceTranslation = basicEmojiTranslations[withoutFace];
    if (withoutFaceTranslation) {
      return withoutFaceTranslation + '脸';
    }
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
    'white_': '白色',
    'gray_': '灰色',
    'grey_': '灰色'
  };
  
  for (const [prefix, chinesePrefix] of Object.entries(colorPrefixes)) {
    if (cleanName.startsWith(prefix)) {
      const baseWord = cleanName.substring(prefix.length);
      const baseTranslation = basicEmojiTranslations[baseWord];
      if (baseTranslation) {
        return chinesePrefix + baseTranslation;
      }
    }
  }
  
  // 处理常见的后缀
  const suffixMappings = {
    '_symbol': '符号',
    '_sign': '标志',
    '_button': '按钮',
    '_emoji': '表情',
    '_face': '脸',
    '_with_': '带有',
    '_and_': '和',
    '_or_': '或',
    '_of_': '的'
  };
  
  let processedName = cleanName;
  for (const [suffix, chineseSuffix] of Object.entries(suffixMappings)) {
    if (processedName.includes(suffix)) {
      // 这里可以进行更复杂的处理，暂时简化
      const baseWord = processedName.replace(suffix, '');
      const baseTranslation = basicEmojiTranslations[baseWord];
      if (baseTranslation && suffix === '_face') {
        return baseTranslation + chineseSuffix;
      }
    }
  }
  
  // 如果都没有找到，尝试分词翻译
  const words = cleanName.split('_');
  if (words.length > 1) {
    const translatedWords = words.map(word => basicEmojiTranslations[word] || word);
    const hasTranslation = translatedWords.some(word => basicEmojiTranslations[word]);
    if (hasTranslation) {
      return translatedWords.join('');
    }
  }
  
  // 最后的fallback：返回优化后的英文名称（首字母大写，下划线转空格）
  return englishName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * 批量翻译emoji名称
 */
export async function batchTranslateEmojiNames(
  emojiList: Array<{ name: string; category?: string }>
): Promise<Array<{ originalName: string; translatedName: string; category?: string }>> {
  // 预加载翻译数据，避免每次调用都重新加载
  await loadTranslationData();
  
  const results = [];
  for (const emoji of emojiList) {
    const translatedName = await translateEmojiName(emoji.name, emoji.category);
    results.push({
      originalName: emoji.name,
      translatedName,
      category: emoji.category
    });
  }
  return results;
}

/**
 * 检查名称是否为英文（包含英文字母）
 */
export function isEnglishName(name: string): boolean {
  return /[a-zA-Z]/.test(name);
}

/**
 * 智能翻译：只翻译英文名称，保留中文名称
 */
export async function smartTranslateEmojiName(name: string, category?: string): Promise<string> {
  if (!isEnglishName(name)) {
    return name; // 已经是中文，直接返回
  }
  return await translateEmojiName(name, category);
}
/**
 * 立即执行emoji翻译修复脚本
 * 在浏览器控制台中执行以立即修复英文名称
 */

console.log('🚀 立即执行Emoji翻译修复...');

// 手动执行翻译修复
async function immediateTranslationFix() {
  try {
    // 1. 直接导入emoji系统
    const { getAllEmojis, updateEmojiData } = await import('./src/services/unifiedEmojiSystem.ts');
    
    console.log('🔧 获取所有emoji数据...');
    const allEmojis = getAllEmojis();
    console.log(`📊 总emoji数量: ${allEmojis.length}`);
    
    // 2. 导入翻译工具
    const { smartTranslateEmojiName, isEnglishName } = await import('./src/utils/emojiNameTranslation.ts');
    
    // 3. 统计当前英文名称
    let englishCount = 0;
    const englishEmojis = [];
    
    allEmojis.forEach(emoji => {
      if (isEnglishName(emoji.name)) {
        englishCount++;
        englishEmojis.push(emoji);
      }
    });
    
    console.log(`⚠️ 发现 ${englishCount} 个英文名称emoji`);
    
    if (englishCount > 0) {
      console.log('\n📝 英文名称示例:');
      englishEmojis.slice(0, 10).forEach(emoji => {
        console.log(`  ${emoji.emoji} "${emoji.name}" (${emoji.category})`);
      });
      
      // 4. 执行批量翻译
      console.log('\n🔄 开始批量翻译...');
      let translatedCount = 0;
      const translations = [];
      
      allEmojis.forEach(emoji => {
        if (isEnglishName(emoji.name)) {
          const originalName = emoji.name;
          const translatedName = smartTranslateEmojiName(emoji.name, emoji.category);
          
          if (translatedName !== originalName) {
            emoji.name = translatedName;
            translatedCount++;
            translations.push({
              emoji: emoji.emoji,
              oldName: originalName,
              newName: translatedName,
              category: emoji.category
            });
          }
        }
      });
      
      // 5. 更新数据
      updateEmojiData(allEmojis);
      
      console.log(`✅ 翻译完成! 共翻译 ${translatedCount} 个名称`);
      
      if (translatedCount > 0) {
        console.log('\n📝 翻译示例:');
        translations.slice(0, 10).forEach(({ emoji, oldName, newName, category }) => {
          console.log(`  ${emoji} "${oldName}" → "${newName}" (${category})`);
        });
        
        if (translatedCount > 10) {
          console.log(`  ... 还有 ${translatedCount - 10} 个翻译`);
        }
        
        // 6. 强制页面刷新以查看效果
        console.log('\n🔄 3秒后刷新页面以查看翻译效果...');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
      
    } else {
      console.log('🎉 所有emoji名称都已是中文！');
    }
    
    return {
      total: allEmojis.length,
      englishCount: englishCount,
      translatedCount: translatedCount || 0
    };
    
  } catch (error) {
    console.error('❌ 翻译修复失败:', error);
    console.error('错误详情:', error.stack);
    return null;
  }
}

// 立即执行
immediateTranslationFix().then(result => {
  if (result) {
    const { total, englishCount, translatedCount } = result;
    console.log(`\n📊 修复统计:`);
    console.log(`  总emoji数量: ${total}`);
    console.log(`  发现英文名称: ${englishCount}`);
    console.log(`  成功翻译: ${translatedCount}`);
    console.log(`  翻译率: ${((translatedCount / englishCount) * 100).toFixed(1)}%`);
  }
});

console.log('💡 正在执行翻译修复，请等待结果...');
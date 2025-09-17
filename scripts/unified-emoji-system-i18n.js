#!/usr/bin/env node

/**
 * UnifiedEmojiSystem 国际化自动替换脚本
 * 处理统一emoji系统的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const SERVICE_PATH = 'src/services/unifiedEmojiSystem.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class UnifiedEmojiSystemI18n {
  constructor() {
    this.replacements = [];
    this.zhTranslations = {};
    this.enTranslations = {};
    this.processedCount = 0;
  }

  /**
   * 运行国际化处理
   */
  async run() {
    console.log('😊 开始 UnifiedEmojiSystem 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理服务文件
      await this.processServiceFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ UnifiedEmojiSystem 国际化完成！`);
      console.log(`📊 处理了 ${this.processedCount} 处文本替换`);
      
    } catch (error) {
      console.error('❌ 国际化处理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载现有翻译文件
   */
  async loadExistingTranslations() {
    console.log('📖 加载现有翻译文件...');
    
    if (fs.existsSync(ZH_LOCALE_PATH)) {
      this.zhTranslations = JSON.parse(fs.readFileSync(ZH_LOCALE_PATH, 'utf8'));
    }
    
    if (fs.existsSync(EN_LOCALE_PATH)) {
      this.enTranslations = JSON.parse(fs.readFileSync(EN_LOCALE_PATH, 'utf8'));
    }
    
    console.log('✅ 翻译文件加载完成');
  }

  /**
   * 定义翻译映射
   */
  defineTranslations() {
    console.log('🔤 定义翻译映射...');

    // 确保emojiSystem部分存在
    if (!this.zhTranslations.emojiSystem) {
      this.zhTranslations.emojiSystem = {};
    }
    if (!this.enTranslations.emojiSystem) {
      this.enTranslations.emojiSystem = {};
    }

    // 注释
    this.zhTranslations.emojiSystem.comments = {
      animalEmojis: "扩展的动物类emoji（100个）",
      foodEmojis: "扩展的食物类emoji（100个）",
      objectEmojis: "扩展的物品类emoji（100个）",
      emotionEmojis: "情感类emoji（100个）",
      natureEmojis: "扩展的自然类emoji（100个）",
      newAnimalEmojis: "新增70个动物emoji",
      newFoodEmojis: "新增75个食物emoji",
      deduplication: "自然类去重：移除重复\"彩虹\""
    };

    this.enTranslations.emojiSystem.comments = {
      animalEmojis: "Extended animal emojis (100 items)",
      foodEmojis: "Extended food emojis (100 items)",
      objectEmojis: "Extended object emojis (100 items)",
      emotionEmojis: "Emotion emojis (100 items)",
      natureEmojis: "Extended nature emojis (100 items)",
      newAnimalEmojis: "70 new animal emojis added",
      newFoodEmojis: "75 new food emojis added",
      deduplication: "Nature deduplication: Remove duplicate \"rainbow\""
    };

    // 上下文类型
    this.zhTranslations.emojiSystem.contexts = {
      card: "卡片",
      icon: "图标",
      badge: "徽章",
      notification: "通知",
      status: "状态指示",
      reaction: "反应/表情回应",
      picker: "选择器"
    };

    this.enTranslations.emojiSystem.contexts = {
      card: "Card",
      icon: "Icon",
      badge: "Badge",
      notification: "Notification",
      status: "Status indicator",
      reaction: "Reaction/emoji response",
      picker: "Picker"
    };

    // 颜色
    this.zhTranslations.emojiSystem.colors = {
      orange: "橙色",
      brown: "棕色",
      white: "白色",
      blackWhite: "黑白",
      yellow: "黄色",
      pink: "粉色",
      green: "绿色",
      blue: "蓝色",
      red: "红色",
      gray: "灰色",
      black: "黑色",
      purple: "紫色"
    };

    this.enTranslations.emojiSystem.colors = {
      orange: "Orange",
      brown: "Brown",
      white: "White",
      blackWhite: "Black and white",
      yellow: "Yellow",
      pink: "Pink",
      green: "Green",
      blue: "Blue",
      red: "Red",
      gray: "Gray",
      black: "Black",
      purple: "Purple"
    };

    // 动物名称
    this.zhTranslations.emojiSystem.animals = {
      cat: "小猫",
      dog: "小狗",
      bear: "小熊",
      rabbit: "小兔",
      fox: "小狐狸",
      panda: "小熊猫",
      lion: "小狮子",
      cow: "小牛",
      pig: "小猪",
      frog: "小青蛙",
      chick: "小鸡",
      penguin: "小企鹅",
      bird: "小鸟",
      dragon: "小龙",
      unicorn: "小独角兽",
      koala: "小考拉",
      kangaroo: "小袋鼠",
      sheep: "小羊",
      horse: "小马",
      camel: "小骆驼",
      llama: "小羊驼",
      buffalo: "小水牛",
      bison: "小野牛",
      boar: "小野猪",
      mouse: "小鼠",
      hamster: "小仓鼠",
      squirrel: "小松鼠",
      raccoon: "小浣熊",
      badger: "小獾",
      otter: "小水獭",
      skunk: "小臭鼬",
      wombat: "小袋熊",
      sealion: "小海狮",
      seal: "小海豹",
      walrus: "小海象",
      shark: "小鲨鱼"
    };

    this.enTranslations.emojiSystem.animals = {
      cat: "Little Cat",
      dog: "Little Dog",
      bear: "Little Bear",
      rabbit: "Little Rabbit",
      fox: "Little Fox",
      panda: "Little Panda",
      lion: "Little Lion",
      cow: "Little Cow",
      pig: "Little Pig",
      frog: "Little Frog",
      chick: "Little Chick",
      penguin: "Little Penguin",
      bird: "Little Bird",
      dragon: "Little Dragon",
      unicorn: "Little Unicorn",
      koala: "Little Koala",
      kangaroo: "Little Kangaroo",
      sheep: "Little Sheep",
      horse: "Little Horse",
      camel: "Little Camel",
      llama: "Little Llama",
      buffalo: "Little Buffalo",
      bison: "Little Bison",
      boar: "Little Boar",
      mouse: "Little Mouse",
      hamster: "Little Hamster",
      squirrel: "Little Squirrel",
      raccoon: "Little Raccoon",
      badger: "Little Badger",
      otter: "Little Otter",
      skunk: "Little Skunk",
      wombat: "Little Wombat",
      sealion: "Little Sea Lion",
      seal: "Little Seal",
      walrus: "Little Walrus",
      shark: "Little Shark"
    };

    // 食物名称
    this.zhTranslations.emojiSystem.foods = {
      apple: "苹果",
      banana: "香蕉",
      tea: "茶",
      milk: "牛奶",
      juice: "果汁"
    };

    this.enTranslations.emojiSystem.foods = {
      apple: "Apple",
      banana: "Banana",
      tea: "Tea",
      milk: "Milk",
      juice: "Juice"
    };

    // 情感名称
    this.zhTranslations.emojiSystem.emotions = {
      happy: "开心",
      laugh: "大笑",
      loveEyes: "爱心眼",
      shy: "害羞",
      sleepy: "困倦",
      angry: "生气",
      crying: "哭泣",
      fear: "恐惧",
      positive: "积极",
      negative: "消极",
      love: "爱情",
      other: "其他"
    };

    this.enTranslations.emojiSystem.emotions = {
      happy: "Happy",
      laugh: "Laugh",
      loveEyes: "Love Eyes",
      shy: "Shy",
      sleepy: "Sleepy",
      angry: "Angry",
      crying: "Crying",
      fear: "Fear",
      positive: "Positive",
      negative: "Negative",
      love: "Love",
      other: "Other"
    };

    // 关键词
    this.zhTranslations.emojiSystem.keywords = {
      cute: "可爱",
      pet: "宠物",
      loyal: "忠诚",
      fluffy: "毛绒",
      jump: "跳跃",
      smart: "聪明",
      china: "中国",
      king: "王者",
      mane: "鬃毛",
      strength: "力量",
      farm: "农场",
      free: "自由",
      fly: "飞翔",
      myth: "神话",
      pure: "纯洁",
      australia: "澳洲",
      gentle: "温顺",
      run: "奔跑",
      elegant: "优雅",
      desert: "沙漠",
      hump: "驼峰",
      twoHumps: "两个驼峰",
      wild: "野性",
      grassland: "草原",
      tusk: "獠牙",
      small: "小",
      flexible: "灵活",
      ears: "耳朵",
      nuts: "坚果",
      tail: "尾巴",
      mask: "面具",
      dig: "挖掘",
      stripes: "条纹",
      swim: "游泳",
      smell: "气味",
      square: "方形",
      madagascar: "马达加斯加",
      bigEyes: "大眼",
      ocean: "海洋",
      performance: "表演",
      arctic: "北极",
      dangerous: "危险",
      fruit: "水果",
      drink: "饮品",
      boxed: "盒装",
      smile: "微笑",
      pleasant: "愉快",
      funny: "搞笑",
      tears: "眼泪",
      adore: "喜爱",
      infatuated: "迷恋",
      blush: "脸红",
      embarrassed: "尴尬",
      sleep: "睡觉",
      tired: "疲倦",
      anger: "愤怒",
      dissatisfied: "不满",
      sad: "伤心",
      scared: "害怕",
      frightened: "惊吓",
      meteor: "流星",
      wish: "许愿",
      nightSky: "夜空"
    };

    this.enTranslations.emojiSystem.keywords = {
      cute: "Cute",
      pet: "Pet",
      loyal: "Loyal",
      fluffy: "Fluffy",
      jump: "Jump",
      smart: "Smart",
      china: "China",
      king: "King",
      mane: "Mane",
      strength: "Strength",
      farm: "Farm",
      free: "Free",
      fly: "Fly",
      myth: "Myth",
      pure: "Pure",
      australia: "Australia",
      gentle: "Gentle",
      run: "Run",
      elegant: "Elegant",
      desert: "Desert",
      hump: "Hump",
      twoHumps: "Two humps",
      wild: "Wild",
      grassland: "Grassland",
      tusk: "Tusk",
      small: "Small",
      flexible: "Flexible",
      ears: "Ears",
      nuts: "Nuts",
      tail: "Tail",
      mask: "Mask",
      dig: "Dig",
      stripes: "Stripes",
      swim: "Swim",
      smell: "Smell",
      square: "Square",
      madagascar: "Madagascar",
      bigEyes: "Big eyes",
      ocean: "Ocean",
      performance: "Performance",
      arctic: "Arctic",
      dangerous: "Dangerous",
      fruit: "Fruit",
      drink: "Drink",
      boxed: "Boxed",
      smile: "Smile",
      pleasant: "Pleasant",
      funny: "Funny",
      tears: "Tears",
      adore: "Adore",
      infatuated: "Infatuated",
      blush: "Blush",
      embarrassed: "Embarrassed",
      sleep: "Sleep",
      tired: "Tired",
      anger: "Anger",
      dissatisfied: "Dissatisfied",
      sad: "Sad",
      scared: "Scared",
      frightened: "Frightened",
      meteor: "Meteor",
      wish: "Wish",
      nightSky: "Night sky"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 注释
      {
        search: /\/\/ 扩展的动物类emoji（100个）/g,
        replace: "// t('emojiSystem.comments.animalEmojis')"
      },
      {
        search: /\/\/ 扩展的食物类emoji（100个）/g,
        replace: "// t('emojiSystem.comments.foodEmojis')"
      },
      {
        search: /\/\/ 扩展的物品类emoji（100个）/g,
        replace: "// t('emojiSystem.comments.objectEmojis')"
      },
      {
        search: /\/\/ 新增70个动物emoji/g,
        replace: "// t('emojiSystem.comments.newAnimalEmojis')"
      },
      {
        search: /\/\/ 新增75个食物emoji/g,
        replace: "// t('emojiSystem.comments.newFoodEmojis')"
      },
      {
        search: /\/\/ 扩展的自然类emoji（100个）/g,
        replace: "// t('emojiSystem.comments.natureEmojis')"
      },

      // 上下文类型
      {
        search: /'卡片'/g,
        replace: "t('emojiSystem.contexts.card')"
      },
      {
        search: /'图标'/g,
        replace: "t('emojiSystem.contexts.icon')"
      },
      {
        search: /'徽章'/g,
        replace: "t('emojiSystem.contexts.badge')"
      },
      {
        search: /'通知'/g,
        replace: "t('emojiSystem.contexts.notification')"
      },
      {
        search: /'状态指示'/g,
        replace: "t('emojiSystem.contexts.status')"
      },
      {
        search: /'反应\/表情回应'/g,
        replace: "t('emojiSystem.contexts.reaction')"
      },
      {
        search: /'选择器'/g,
        replace: "t('emojiSystem.contexts.picker')"
      },

      // 颜色
      {
        search: /'橙色'/g,
        replace: "t('emojiSystem.colors.orange')"
      },
      {
        search: /'棕色'/g,
        replace: "t('emojiSystem.colors.brown')"
      },
      {
        search: /'白色'/g,
        replace: "t('emojiSystem.colors.white')"
      },
      {
        search: /'黑白'/g,
        replace: "t('emojiSystem.colors.blackWhite')"
      },
      {
        search: /'黄色'/g,
        replace: "t('emojiSystem.colors.yellow')"
      },
      {
        search: /'粉色'/g,
        replace: "t('emojiSystem.colors.pink')"
      },
      {
        search: /'绿色'/g,
        replace: "t('emojiSystem.colors.green')"
      },
      {
        search: /'蓝色'/g,
        replace: "t('emojiSystem.colors.blue')"
      },
      {
        search: /'红色'/g,
        replace: "t('emojiSystem.colors.red')"
      },
      {
        search: /'灰色'/g,
        replace: "t('emojiSystem.colors.gray')"
      },
      {
        search: /'黑色'/g,
        replace: "t('emojiSystem.colors.black')"
      },
      {
        search: /'紫色'/g,
        replace: "t('emojiSystem.colors.purple')"
      }
    ];
  }

  /**
   * 处理服务文件
   */
  async processServiceFile() {
    console.log('📝 处理服务文件...');
    
    if (!fs.existsSync(SERVICE_PATH)) {
      throw new Error(`服务文件不存在: ${SERVICE_PATH}`);
    }

    let content = fs.readFileSync(SERVICE_PATH, 'utf8');
    
    // 应用所有替换
    for (const replacement of this.replacements) {
      const matches = content.match(replacement.search);
      if (matches) {
        content = content.replace(replacement.search, replacement.replace);
        this.processedCount += matches.length;
      }
    }

    fs.writeFileSync(SERVICE_PATH, content, 'utf8');
    console.log(`✅ 服务文件处理完成，替换了 ${this.processedCount} 处文本`);
  }

  /**
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('📄 更新翻译文件...');
    
    // 更新中文翻译文件
    fs.writeFileSync(
      ZH_LOCALE_PATH,
      JSON.stringify(this.zhTranslations, null, 2),
      'utf8'
    );
    
    // 更新英文翻译文件
    fs.writeFileSync(
      EN_LOCALE_PATH,
      JSON.stringify(this.enTranslations, null, 2),
      'utf8'
    );
    
    console.log('✅ 翻译文件更新完成');
  }
}

// 运行脚本
const processor = new UnifiedEmojiSystemI18n();
processor.run().catch(console.error);

#!/usr/bin/env node

/**
 * IntelligentCategoryService 国际化自动替换脚本
 * 处理智能分类服务的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const SERVICE_PATH = 'src/services/intelligentCategoryService.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class IntelligentCategoryServiceI18n {
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
    console.log('🧠 开始 IntelligentCategoryService 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理服务文件
      await this.processServiceFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ IntelligentCategoryService 国际化完成！`);
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

    // 确保intelligentCategory部分存在
    if (!this.zhTranslations.intelligentCategory) {
      this.zhTranslations.intelligentCategory = {};
    }
    if (!this.enTranslations.intelligentCategory) {
      this.enTranslations.intelligentCategory = {};
    }

    // 注释
    this.zhTranslations.intelligentCategory.comments = {
      serviceDescription: "智能分类标签提取优化服务",
      problemDescription: "解决用户反馈的问题2：自动分类标签提取优化"
    };

    this.enTranslations.intelligentCategory.comments = {
      serviceDescription: "Intelligent category tag extraction optimization service",
      problemDescription: "Solving user feedback issue 2: Automatic category tag extraction optimization"
    };

    // 分类名称
    this.zhTranslations.intelligentCategory.categories = {
      technology: "科技",
      entertainment: "娱乐",
      sports: "体育",
      finance: "财经",
      politics: "政治",
      society: "社会",
      education: "教育",
      health: "健康",
      automotive: "汽车",
      military: "军事",
      livelihood: "民生"
    };

    this.enTranslations.intelligentCategory.categories = {
      technology: "Technology",
      entertainment: "Entertainment",
      sports: "Sports",
      finance: "Finance",
      politics: "Politics",
      society: "Society",
      education: "Education",
      health: "Health",
      automotive: "Automotive",
      military: "Military",
      livelihood: "Livelihood"
    };

    // 子分类
    this.zhTranslations.intelligentCategory.subCategories = {
      // 科技子分类
      artificialIntelligence: "人工智能",
      internet: "互联网",
      hardware: "硬件",
      software: "软件",
      communicationTech: "通信技术",
      emergingTech: "新兴技术",
      
      // 娱乐子分类
      filmTV: "影视",
      music: "音乐",
      gaming: "游戏",
      influencer: "网红",
      variety: "综艺",
      anime: "动漫",
      
      // 体育子分类
      football: "足球",
      basketball: "篮球",
      olympics: "奥运",
      otherSports: "其他运动",
      fitness: "健身",
      esports: "电竞",
      
      // 财经子分类
      stockMarket: "股市",
      investment: "投资",
      enterprise: "企业",
      realEstate: "房地产",
      macroEconomy: "宏观经济",
      financialPolicy: "金融政策",
      
      // 政治子分类
      domesticPolitics: "国内政治",
      internationalRelations: "国际关系",
      policyRegulation: "政策法规",
      diplomacy: "外交",
      localGovernment: "地方政府",
      
      // 社会子分类
      livelihood: "民生",
      publicWelfare: "公益",
      community: "社区",
      hotEvents: "热点事件",
      socialPhenomena: "社会现象",
      
      // 教育子分类
      basicEducation: "基础教育",
      higherEducation: "高等教育",
      vocationalEducation: "职业教育",
      onlineEducation: "在线教育",
      educationPolicy: "教育政策",
      
      // 健康子分类
      medical: "医疗",
      wellness: "养生",
      mentalHealth: "心理健康",
      diseasePrevention: "疾病防治",
      healthyLiving: "健康生活",
      
      // 汽车子分类
      newEnergyVehicles: "新能源车",
      traditionalCars: "传统汽车",
      autonomousDriving: "自动驾驶",
      autoTechnology: "汽车技术",
      mobilityServices: "出行服务",
      
      // 军事子分类
      nationalDefense: "国防建设",
      militaryEquipment: "军事装备",
      militaryExercises: "军事演习",
      militaryPersonnel: "军事人员",
      militaryTechnology: "军工科技",
      
      // 民生子分类
      housingIssues: "住房问题",
      employmentIssues: "就业问题",
      socialSecurity: "社会保障",
      publicWelfare: "民生福利",
      qualityOfLife: "生活质量"
    };

    this.enTranslations.intelligentCategory.subCategories = {
      // Technology subcategories
      artificialIntelligence: "Artificial Intelligence",
      internet: "Internet",
      hardware: "Hardware",
      software: "Software",
      communicationTech: "Communication Technology",
      emergingTech: "Emerging Technology",
      
      // Entertainment subcategories
      filmTV: "Film & TV",
      music: "Music",
      gaming: "Gaming",
      influencer: "Influencer",
      variety: "Variety Shows",
      anime: "Anime",
      
      // Sports subcategories
      football: "Football",
      basketball: "Basketball",
      olympics: "Olympics",
      otherSports: "Other Sports",
      fitness: "Fitness",
      esports: "Esports",
      
      // Finance subcategories
      stockMarket: "Stock Market",
      investment: "Investment",
      enterprise: "Enterprise",
      realEstate: "Real Estate",
      macroEconomy: "Macro Economy",
      financialPolicy: "Financial Policy",
      
      // Politics subcategories
      domesticPolitics: "Domestic Politics",
      internationalRelations: "International Relations",
      policyRegulation: "Policy & Regulation",
      diplomacy: "Diplomacy",
      localGovernment: "Local Government",
      
      // Society subcategories
      livelihood: "Livelihood",
      publicWelfare: "Public Welfare",
      community: "Community",
      hotEvents: "Hot Events",
      socialPhenomena: "Social Phenomena",
      
      // Education subcategories
      basicEducation: "Basic Education",
      higherEducation: "Higher Education",
      vocationalEducation: "Vocational Education",
      onlineEducation: "Online Education",
      educationPolicy: "Education Policy",
      
      // Health subcategories
      medical: "Medical",
      wellness: "Wellness",
      mentalHealth: "Mental Health",
      diseasePrevention: "Disease Prevention",
      healthyLiving: "Healthy Living",
      
      // Automotive subcategories
      newEnergyVehicles: "New Energy Vehicles",
      traditionalCars: "Traditional Cars",
      autonomousDriving: "Autonomous Driving",
      autoTechnology: "Auto Technology",
      mobilityServices: "Mobility Services",
      
      // Military subcategories
      nationalDefense: "National Defense",
      militaryEquipment: "Military Equipment",
      militaryExercises: "Military Exercises",
      militaryPersonnel: "Military Personnel",
      militaryTechnology: "Military Technology",
      
      // Livelihood subcategories
      housingIssues: "Housing Issues",
      employmentIssues: "Employment Issues",
      socialSecurity: "Social Security",
      publicWelfare: "Public Welfare",
      qualityOfLife: "Quality of Life"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 修复导入语句中的错误
      {
        search: /import { DailyHotItem } from '@\/api\/hotTopicsServicei18n\.t\('services\.label\.expor_1wf'\)科技'/g,
        replace: "import { DailyHotItem } from '@/api/hotTopicsService';\n\n// 分类配置\nconst categoryConfig = {\n  [t('intelligentCategory.categories.technology')]"
      },

      // 修复其他格式错误
      {
        search: /i18n\.t\(i18n\.t\('services\.error\.services_5ae'\)\)/g,
        replace: "'失败'"
      },
      {
        search: /'体育i18n\.t\('services\.error\._90w'\)财经'/g,
        replace: "t('intelligentCategory.categories.sports'): [\n        /比赛|赛事|冠军|胜利|失败|成绩|纪录|训练|教练|队员|联赛|锦标赛/,\n        /奥运|世界杯|欧洲杯|亚洲杯|联赛|锦标赛/,\n        /运动员|教练|裁判|观众|粉丝|球迷/,\n        /体育场|赛场|训练场|健身房|运动场/\n      ],\n      [t('intelligentCategory.categories.finance')]"
      },

      // 分类名称替换
      {
        search: /'科技':/g,
        replace: "[t('intelligentCategory.categories.technology')]:"
      },
      {
        search: /'娱乐':/g,
        replace: "[t('intelligentCategory.categories.entertainment')]:"
      },
      {
        search: /'体育':/g,
        replace: "[t('intelligentCategory.categories.sports')]:"
      },
      {
        search: /'财经':/g,
        replace: "[t('intelligentCategory.categories.finance')]:"
      },
      {
        search: /'政治':/g,
        replace: "[t('intelligentCategory.categories.politics')]:"
      },
      {
        search: /'社会':/g,
        replace: "[t('intelligentCategory.categories.society')]:"
      },
      {
        search: /'教育':/g,
        replace: "[t('intelligentCategory.categories.education')]:"
      },
      {
        search: /'健康':/g,
        replace: "[t('intelligentCategory.categories.health')]:"
      },
      {
        search: /'汽车':/g,
        replace: "[t('intelligentCategory.categories.automotive')]:"
      },
      {
        search: /'军事':/g,
        replace: "[t('intelligentCategory.categories.military')]:"
      },
      {
        search: /'民生':/g,
        replace: "[t('intelligentCategory.categories.livelihood')]:"
      },

      // 条件判断中的分类名称
      {
        search: /category === '科技'/g,
        replace: "category === t('intelligentCategory.categories.technology')"
      },
      {
        search: /category === '财经'/g,
        replace: "category === t('intelligentCategory.categories.finance')"
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
const processor = new IntelligentCategoryServiceI18n();
processor.run().catch(console.error);

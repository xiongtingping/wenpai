#!/usr/bin/env node

/**
 * AboutPage 国际化自动替换脚本
 * 将硬编码的中文文本替换为 i18n 调用
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/pages/AboutPage.tsx');

// 文本替换映射
const replacements = [
  // 页面标题和描述
  { from: 'title="关于我们"', to: 'title={t("about.title")}' },
  { from: 'description="了解文派的使命和团队"', to: 'description={t("about.description")}' },
  
  // 主标题
  { from: '"文派 - AI内容创作平台"', to: 't("about.hero.title")' },
  { from: '"我们致力于为创作者提供最智能、最高效的AI内容创作工具，让每个人都能轻松创作出优质内容。"', to: 't("about.hero.description")' },
  
  // 核心价值
  { from: '"创新驱动"', to: 't("about.values.innovation.title")' },
  { from: '"持续探索AI技术在内容创作领域的无限可能"', to: 't("about.values.innovation.description")' },
  { from: '"用户至上"', to: 't("about.values.userFirst.title")' },
  { from: '"以用户需求为中心，不断优化产品体验"', to: 't("about.values.userFirst.description")' },
  { from: '"高效便捷"', to: 't("about.values.efficiency.title")' },
  { from: '"简化创作流程，让AI成为最得力的创作助手"', to: 't("about.values.efficiency.description")' },
  { from: '"品质第一"', to: 't("about.values.quality.title")' },
  { from: '"严格把控每一个功能的质量和用户体验"', to: 't("about.values.quality.description")' },
  
  // 产品特色
  { from: '产品特色', to: '{t("about.features.title")}' },
  { from: '"文派平台的核心优势和特色功能"', to: 't("about.features.description")' },
  { from: '"AI内容适配"', to: 't("about.features.contentAdapter.title")' },
  { from: '"智能适配各大平台，一键生成多平台内容"', to: 't("about.features.contentAdapter.description")' },
  { from: '"全网热点聚合"', to: 't("about.features.hotTopics.title")' },
  { from: '"实时抓取热点话题，把握内容创作时机"', to: 't("about.features.hotTopics.description")' },
  { from: '"品牌资产管理"', to: 't("about.features.brandManagement.title")' },
  { from: '"统一管理品牌素材，保持内容风格一致"', to: 't("about.features.brandManagement.description")' },
  { from: '"创意工作室"', to: 't("about.features.creativeStudio.title")' },
  { from: '"集成多种创意工具，激发无限创作灵感"', to: 't("about.features.creativeStudio.description")' },
  { from: '"团队协作"', to: 't("about.features.teamwork.title")' },
  { from: '"支持多人协作，提升团队创作效率"', to: 't("about.features.teamwork.description")' },
  { from: '"智能推荐"', to: 't("about.features.smartRecommendation.title")' },
  { from: '"基于AI算法，提供个性化内容建议"', to: 't("about.features.smartRecommendation.description")' },
  
  // 发展历程
  { from: '发展历程', to: '{t("about.timeline.title")}' },
  { from: '"文派平台的重要发展节点"', to: 't("about.timeline.description")' },
  { from: '"项目启动"', to: 't("about.timeline.projectStart.title")' },
  { from: '"确定产品定位，开始AI内容创作平台的开发"', to: 't("about.timeline.projectStart.description")' },
  { from: '"核心功能上线"', to: 't("about.timeline.coreFeatures.title")' },
  { from: '"AI内容适配、热点聚合等核心功能正式发布"', to: 't("about.timeline.coreFeatures.description")' },
  { from: '"功能完善"', to: 't("about.timeline.featureEnhancement.title")' },
  { from: '"增加创意工具、品牌管理等高级功能"', to: 't("about.timeline.featureEnhancement.description")' },
  { from: '"持续优化"', to: 't("about.timeline.continuousOptimization.title")' },
  { from: '"基于用户反馈持续优化产品体验"', to: 't("about.timeline.continuousOptimization.description")' },
  { from: '"进行中"', to: 't("about.timeline.ongoing")' },
  
  // 联系我们
  { from: '"联系我们"', to: 't("about.contact.title")' },
  { from: '"我们期待听到您的声音"', to: 't("about.contact.description")' },
  { from: '"如果您有任何问题、建议或合作意向，欢迎随时联系我们。"', to: 't("about.contact.message")' },
  { from: '意见反馈', to: '{t("about.contact.feedback")}' },
  { from: '商务合作', to: '{t("about.contact.business")}' },
  { from: '技术支持', to: '{t("about.contact.support")}' }
];

function processFile() {
  try {
    console.log('🔄 开始处理 AboutPage.tsx 国际化...');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;
    
    // 首先添加 useTranslation 导入
    if (!content.includes('useTranslation')) {
      content = content.replace(
        "import { PageNavigation } from '@/components/layout/PageNavigation';",
        "import { PageNavigation } from '@/components/layout/PageNavigation';\nimport { useTranslation } from 'react-i18next';"
      );
      changeCount++;
      console.log('✅ 添加 useTranslation 导入');
    }
    
    // 添加 useTranslation hook
    if (!content.includes('const { t } = useTranslation();')) {
      content = content.replace(
        'const AboutPage: React.FC = () => {',
        'const AboutPage: React.FC = () => {\n  const { t } = useTranslation();'
      );
      changeCount++;
      console.log('✅ 添加 useTranslation hook');
    }
    
    // 应用所有替换
    replacements.forEach((replacement, index) => {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
        changeCount++;
        console.log(`✅ [${index + 1}/${replacements.length}] 替换: ${replacement.from.substring(0, 30)}...`);
      } else {
        console.log(`⚠️ [${index + 1}/${replacements.length}] 未找到: ${replacement.from.substring(0, 30)}...`);
      }
    });
    
    // 写入文件
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n🎉 AboutPage 国际化处理完成！`);
    console.log(`📊 总替换数: ${changeCount}/${replacements.length + 2}`);
    console.log(`📁 文件: ${filePath}`);
    
  } catch (error) {
    console.error('❌ 处理失败:', error);
    process.exit(1);
  }
}

// 执行处理
processFile();

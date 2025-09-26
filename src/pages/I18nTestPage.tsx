import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const I18nTestPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>国际化功能测试 / Internationalization Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>当前语言 / Current Language:</strong> {i18n.language}</p>
            <Button onClick={toggleLanguage} className="mt-2">
              切换语言 / Switch Language
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">关于页面测试 / About Page Test</h3>
            <p>{t('about.hero.title', t('pages.labels.关于我们'))}</p>
            <p>{t('about.hero.subtitle', t('pages.labels.了解文派的故事'))}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">创意魔方测试 / Creative Cube Test</h3>
            <p>{t('creativeCube.title', t('pages.labels.九宫格创意魔方'))}</p>
            <p>{t('creativeCube.description', t('pages.messages.智能内容创作工具'))}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">标题生成器测试 / Title Generator Test</h3>
            <p>{t('titleGenerator.title', t('pages.labels.智能标题生成器'))}</p>
            <p>{t('titleGenerator.buttons.generate', t('pages.labels.生成标题'))}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">朋友圈文案生成器测试 / Moments Generator Test</h3>
            <p>{t('momentsGenerator.title', t('pages.labels.朋友圈文案生成器'))}</p>
            <p>{t('momentsGenerator.tabs.templates', t('pages.messages.文案模板'))}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">提示词系统测试 / Prompt System Test</h3>
            <p>{t('promptSystem.success.moduleInit', t('pages.messages.提示词系统'))}</p>
            <p></p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">内容方案测试 / Content Schemes Test</h3>
            <p>{t('contentSchemes.globalAdaptation.name', t('pages.messages.全域内容适配方案'))}</p>
            <p>{t('contentSchemes.styles.professional.name', t('pages.messages.专业风格'))}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">创意魔方测试 / Creative Studio Test</h3>
            <p>{t('creativeStudio.title', t('pages.labels.创意魔方'))}</p>
            <p>{t('creativeStudio.tabs.creativeCube', t('pages.messages.创意魔方'))}</p>
            <p>{t('creativeStudio.tabs.marketingCalendar', t('pages.messages.营销日历'))}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">热门话题测试 / Hot Topics Test</h3>
            <p>{t('hotTopics.title', t('pages.labels.热门话题'))}</p>
            <p>{t('hotTopics.tabs.trending', t('pages.messages.热门趋势'))}</p>
            <p>{t('hotTopics.platforms.xiaohongshu', t('pages.messages.小红书'))}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AI提供者测试 / AI Providers Test</h3>
            <p></p>
            <p></p>
            <p></p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AI提示词测试 / AI Prompts Test</h3>
            <p>{t('aiPrompts.titleGeneration.targetPlatform', '目标平台')}</p>
            <p></p>
            <p></p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">品牌库测试 / Brand Library Test</h3>
            <p></p>
            <p>{t('brandLibraryPage.dimensions.brandName.title', '品牌名称')}</p>
            <p>{t('brandLibraryPage.status.analyzed', '已分析')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default I18nTestPage;

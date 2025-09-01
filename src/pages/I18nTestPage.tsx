import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function I18nTestPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>国际化功能测试 / Internationalization Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">语言切换测试 / Language Switch Test</h3>
              <div className="flex gap-4">
                <Button onClick={() => changeLanguage('zh-CN')}>中文</Button>
                <Button onClick={() => changeLanguage('en-US')}>English</Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                当前语言 / Current Language: {i18n.language}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">翻译键测试 / Translation Key Test</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">导航 / Navigation</h4>
                  <ul className="text-sm space-y-1">
                    <li>{t('nav.home')}</li>
                    <li>{t('nav.adapt')}</li>
                    <li>{t('nav.creative')}</li>
                    <li>{t('nav.hotTopics')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">认证 / Authentication</h4>
                  <ul className="text-sm space-y-1">
                    <li>{t('auth.login')}</li>
                    <li>{t('auth.logout')}</li>
                    <li>{t('auth.register')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">首页内容测试 / Home Content Test</h3>
              <div className="space-y-2">
                <p><strong>英雄标题:</strong> {t('home.heroTitle')}</p>
                <p><strong>英雄副标题:</strong> {t('home.heroSubtitle')}</p>
                <p><strong>开始按钮:</strong> {t('home.getStarted')}</p>
                <p><strong>了解更多:</strong> {t('home.learnMore')}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">功能特性测试 / Features Test</h3>
              <div className="space-y-2">
                <p><strong>内容适配:</strong> {t('home.features.adapt.title')}</p>
                <p><strong>创意魔方:</strong> {t('home.features.creative.title')}</p>
                <p><strong>全网雷达:</strong> {t('home.features.radar.title')}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">定价方案测试 / Pricing Test</h3>
              <div className="space-y-2">
                <p><strong>标题:</strong> {t('home.pricing.title')}</p>
                <p><strong>免费版:</strong> {t('home.pricing.free.name')}</p>
                <p><strong>专业版:</strong> {t('home.pricing.pro.name')}</p>
                <p><strong>企业版:</strong> {t('home.pricing.premium.name')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
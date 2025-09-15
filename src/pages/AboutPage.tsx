import { Clock } from "lucide-react";
/**
 * 关于我们页面
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Users, Zap, Target, Star, Globe, Lightbulb, Award } from 'lucide-react';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 关于我们页面组件
 */
const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <PageNavigation
        title={t('pages.labels.关于我们') }
        description={t('pages.descriptions.关于我们页面')}
        showAdaptButton={false}
        actions={<div></div>}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 团队介绍 */}
        <Card variant="gradient" className="rounded-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4"></h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 核心价值 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="soft" className="text-center rounded-xl">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 shadow-e0">
                <Lightbulb className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{t('about.values.innovation.title')}</h3>
              <p className="text-muted-foreground text-sm"></p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2"></h3>
              <p className="text-muted-foreground text-sm"></p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('about.values.efficiency.title')}</h3>
              <p className="text-muted-foreground text-sm"></p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2"></h3>
              <p className="text-muted-foreground text-sm"></p>
            </CardContent>
          </Card>
        </div>

        {/* 产品特色 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              产品特色
            </CardTitle>
            <CardDescription>
              {t('about.features.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1"></h4>
                    <p className="text-muted-foreground text-sm"></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1"></h4>
                    <p className="text-muted-foreground text-sm">{t('about.features.hotTopics.description')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1"></h4>
                    <p className="text-muted-foreground text-sm"></p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1"></h4>
                    <p className="text-muted-foreground text-sm">{t('about.features.creativeStudio.description')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1"></h4>
                    <p className="text-muted-foreground text-sm"></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1"></h4>
                    <p className="text-muted-foreground text-sm">{t('about.features.smartRecommendation.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 发展历程 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              发展历程
            </CardTitle>
            <CardDescription>
              
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold"></h4>
                  <p className="text-muted-foreground text-sm"></p>
                  <Badge variant="outline" className="mt-1">2024.Q1</Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">{t('about.timeline.coreFeatures.title')}</h4>
                  <p className="text-muted-foreground text-sm"></p>
                  <Badge variant="outline" className="mt-1">2024.Q2</Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold"></h4>
                  <p className="text-muted-foreground text-sm"></p>
                  <Badge variant="outline" className="mt-1">2024.Q3</Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">{t('about.timeline.continuousOptimization.title')}</h4>
                  <p className="text-muted-foreground text-sm"></p>
                  <Badge variant="outline" className="mt-1"></Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 联系我们 */}
        <Card>
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription>
              {t('about.contact.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {t('about.contact.message')}
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline">
                  意见反馈
                </Button>
                <Button variant="outline">
                  商务合作
                </Button>
                <Button variant="outline">
                  技术支持
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;

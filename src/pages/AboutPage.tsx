/**
 * 🎨 关于我们页面 - 优化后的版本
 * 
 * 功能特点：
 * - 完整的i18n国际化支持
 * - 现代化的视觉设计
 * - 响应式布局
 * - 优雅的动画效果
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Users, 
  Zap, 
  Target, 
  Star, 
  Globe, 
  Lightbulb, 
  Award,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  ArrowRight,
  Sparkles,
  Shield,
  Rocket
} from 'lucide-react';
import PageNavigation from '@/components/layout/PageNavigation';
import { ThemeAwareLogo } from '@/components/ui/ThemeAwareLogo';

/**
 * 关于我们页面组件 - 完全重构版本
 */
const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <PageNavigation
        title={t('about.title')}
        description={t('about.description')}
        showAdaptButton={false}
        actions={<div></div>}
      />

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* 🎨 英雄区域 - 品牌展示 */}
        <Card className="overflow-hidden">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-6">
                <ThemeAwareLogo size="xl" showBackground={false} />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                {t('about.hero.title')}
                <Sparkles className="w-8 h-8 text-primary" />
              </h1>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {t('about.hero.description')}
              </p>
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-6 py-2 text-sm font-medium">
                  <Rocket className="w-4 h-4 mr-2" />
                  AI驱动的内容创作平台
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🌟 核心价值观 */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">核心价值观</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              我们坚持的理念，塑造着文派的每一个功能和体验
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Lightbulb,
                title: t('about.values.innovation.title'),
                description: t('about.values.innovation.description'),
                color: 'bg-gradient-to-br from-yellow-500 to-orange-600'
              },
              {
                icon: Users,
                title: t('about.values.userFirst.title'),
                description: t('about.values.userFirst.description'),
                color: 'bg-gradient-to-br from-blue-500 to-purple-600'
              },
              {
                icon: Zap,
                title: t('about.values.efficiency.title'),
                description: t('about.values.efficiency.description'),
                color: 'bg-gradient-to-br from-green-500 to-teal-600'
              },
              {
                icon: Shield,
                title: t('about.values.quality.title'),
                description: t('about.values.quality.description'),
                color: 'bg-gradient-to-br from-red-500 to-pink-600'
              }
            ].map((value, index) => (
              <Card key={index} className="text-center group transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 🚀 产品特色 */}
        <section>
          <Card>
            <CardHeader className="text-center pb-8">
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <Target className="w-8 h-8 text-primary" />
                {t('about.features.title')}
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                {t('about.features.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-12 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {[
                  {
                    icon: Zap,
                    title: t('about.features.contentAdapter.title'),
                    description: t('about.features.contentAdapter.description'),
                    color: 'text-yellow-600'
                  },
                  {
                    icon: Globe,
                    title: t('about.features.hotTopics.title'),
                    description: t('about.features.hotTopics.description'),
                    color: 'text-blue-600'
                  },
                  {
                    icon: Heart,
                    title: t('about.features.brandManagement.title'),
                    description: t('about.features.brandManagement.description'),
                    color: 'text-pink-600'
                  },
                  {
                    icon: Award,
                    title: t('about.features.creativeStudio.title'),
                    description: t('about.features.creativeStudio.description'),
                    color: 'text-purple-600'
                  },
                  {
                    icon: Users,
                    title: t('about.features.teamwork.title'),
                    description: t('about.features.teamwork.description'),
                    color: 'text-green-600'
                  },
                  {
                    icon: Star,
                    title: t('about.features.smartRecommendation.title'),
                    description: t('about.features.smartRecommendation.description'),
                    color: 'text-orange-600'
                  }
                ].map((feature, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-primary/5 border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className={`w-8 h-8 ${feature.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">{feature.title}</h4>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-base leading-relaxed">{feature.description}</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 📅 发展历程 */}
        <section>
          <Card className="overflow-hidden">
            <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-primary/5 pb-8">
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <Clock className="w-8 h-8 text-primary" />
                {t('about.timeline.title')}
              </CardTitle>
              <CardDescription className="text-lg">
                {t('about.timeline.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-12">
              <div className="relative">
                {/* 时间线背景线 */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>
                
                <div className="space-y-12">
                  {[
                    {
                      phase: '1',
                      title: t('about.timeline.projectStart.title'),
                      description: t('about.timeline.projectStart.description'),
                      date: '2024.Q1',
                      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
                    },
                    {
                      phase: '2',
                      title: t('about.timeline.coreFeatures.title'),
                      description: t('about.timeline.coreFeatures.description'),
                      date: '2024.Q2',
                      color: 'bg-gradient-to-br from-green-500 to-green-600'
                    },
                    {
                      phase: '3',
                      title: t('about.timeline.featureEnhancement.title'),
                      description: t('about.timeline.featureEnhancement.description'),
                      date: '2024.Q3',
                      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
                    },
                    {
                      phase: '4',
                      title: t('about.timeline.continuousOptimization.title'),
                      description: t('about.timeline.continuousOptimization.description'),
                      date: t('about.timeline.ongoing'),
                      color: 'bg-gradient-to-br from-orange-500 to-orange-600'
                    }
                  ].map((milestone, index) => (
                    <div key={index} className="flex items-start gap-6 relative">
                      <div className={`w-16 h-16 ${milestone.color} text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg z-10`}>
                        {milestone.phase}
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-xl text-foreground">{milestone.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {milestone.date}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 📞 联系我们 */}
        <section>
          <Card>
            <CardHeader className="text-center pb-8">
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <Mail className="w-8 h-8 text-primary" />
                {t('about.contact.title')}
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                {t('about.contact.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-12 pb-12">
              <div className="text-center space-y-8">
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {t('about.contact.message')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {[
                    {
                      icon: MessageSquare,
                      title: t('about.contact.feedback'),
                      color: 'hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-600'
                    },
                    {
                      icon: Phone,
                      title: t('about.contact.business'),
                      color: 'hover:border-green-500 hover:bg-green-500/10 hover:text-green-600'
                    },
                    {
                      icon: Mail,
                      title: t('about.contact.support'),
                      color: 'hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-600'
                    }
                  ].map((contact, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className={`h-auto p-6 flex-col gap-3 transition-all duration-300 ${contact.color} group`}
                      onClick={() => {
                        if (index === 0) {
                          // 意见反馈 - 发送邮件
                          window.location.href = 'mailto:feedback@wenpai.xyz';
                        } else if (index === 1) {
                          // 商务合作 - 发送邮件
                          window.location.href = 'mailto:business@wenpai.xyz';
                        } else if (index === 2) {
                          // 技术支持 - 发送邮件
                          window.location.href = 'mailto:support@wenpai.xyz';
                        }
                      }}
                    >
                      <contact.icon className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold">{contact.title}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

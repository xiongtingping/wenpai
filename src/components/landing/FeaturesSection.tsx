/**
 * 功能特性展示区域
 * 展示平台核心功能和特色
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from '@/hooks/useAuth';
import {
  Zap,
  Sparkles,
  TrendingUp,
  FolderOpen,
  Users,
  Download,
  Target,
  Lightbulb,
  Palette,
  Globe,
  Shield,
  Clock,
  BarChart3,
  MessageCircle,
  Upload,
  Smile,
  Bookmark,
  Settings,
  Calendar,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Crown,
  Play
} from 'lucide-react';

/**
 * 主要功能数据构建函数
 */
const getMainFeatures = (t: any) => [
  {
    title: `🎯 ${t('home.featuresSection.mainFeatures.contentAdapter.title')}`,
    description: t('home.featuresSection.mainFeatures.contentAdapter.description'),
    icon: Zap,
    path: '/new-adapt',
    color: 'bg-gradient-to-br from-yellow-500 to-orange-600 text-background',
    bgColor: 'bg-accent',
    borderColor: 'border-border',
    hoverColor: 'hover:bg-accent/80',
    badge: `🔥 ${t('home.featuresSection.mainFeatures.contentAdapter.badge')}`,
    badgeColor: 'bg-gradient-to-r from-red-500 to-orange-500 text-background',
    features: t('home.featuresSection.mainFeatures.contentAdapter.features', { returnObjects: true })
  },
  {
    title: `✨ ${t('home.featuresSection.mainFeatures.creativeCube.title')}`,
    description: t('home.featuresSection.mainFeatures.creativeCube.description'),
    icon: Sparkles,
    path: '/creative-studio',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-background',
    bgColor: 'bg-accent',
    borderColor: 'border-border',
    hoverColor: 'hover:bg-accent/80',
    badge: `💎 ${t('home.featuresSection.mainFeatures.creativeCube.badge')}`,
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-background',
    features: t('home.featuresSection.mainFeatures.creativeCube.features', { returnObjects: true })
  },
  {
    title: `📡 ${t('home.featuresSection.mainFeatures.hotRadar.title')}`,
    description: t('home.featuresSection.mainFeatures.hotRadar.description'),
    icon: TrendingUp,
    path: '/hot-topics',
    color: 'bg-gradient-to-br from-green-500 to-emerald-600 text-background',
    bgColor: 'bg-accent',
    borderColor: 'border-border',
    hoverColor: 'hover:bg-accent/80',
    badge: `🔥 ${t('home.featuresSection.mainFeatures.hotRadar.badge')}`,
    badgeColor: 'bg-gradient-to-r from-green-500 to-teal-500 text-background',
    features: t('home.featuresSection.mainFeatures.hotRadar.features', { returnObjects: true })
  },
  {
    title: `📚 ${t('home.featuresSection.mainFeatures.myLibrary.title')}`,
    description: t('home.featuresSection.mainFeatures.myLibrary.description'),
    icon: FolderOpen,
    path: '/brand-library',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-background',
    bgColor: 'bg-accent',
    borderColor: 'border-border',
    hoverColor: 'hover:bg-accent/80',
    badge: `💡 ${t('home.featuresSection.mainFeatures.myLibrary.badge')}`,
    badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-background',
    features: t('home.featuresSection.mainFeatures.myLibrary.features', { returnObjects: true })
  },
  {
    title: `🏢 ${t('home.featuresSection.mainFeatures.brandLibrary.title')}`,
    description: t('home.featuresSection.mainFeatures.brandLibrary.description'),
    icon: Users,
    path: '/brand-library',
    color: 'bg-gradient-to-br from-rose-500 to-pink-600 text-background',
    bgColor: 'bg-accent',
    borderColor: 'border-border',
    hoverColor: 'hover:bg-accent/80',
    badge: `👑 ${t('home.featuresSection.mainFeatures.brandLibrary.badge')}`,
    badgeColor: 'bg-gradient-to-r from-rose-500 to-pink-500 text-background',
    features: t('home.featuresSection.mainFeatures.brandLibrary.features', { returnObjects: true })
  },
];

/**
 * 快速工具数据构建函数
 */
const getQuickTools = (t: any) => [
  {
    title: `😊 ${t('home.featuresSection.quickTools.emojiGenerator.title')}`,
    description: t('home.featuresSection.quickTools.emojiGenerator.description'),
    icon: Smile,
    path: '/emoji',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-background',
    theme: 'warm',
  },
  {
    title: `💬 ${t('home.featuresSection.quickTools.wechatTemplate.title')}`,
    description: t('home.featuresSection.quickTools.wechatTemplate.description'),
    icon: MessageCircle,
    path: '/wechat-templates',
    color: 'bg-gradient-to-br from-green-400 to-emerald-500 text-background',
    theme: 'nature',
  },
  {
    title: `📊 ${t('home.featuresSection.quickTools.history.title')}`,
    description: t('home.featuresSection.quickTools.history.description'),
    icon: Clock,
    path: '/history',
    color: 'bg-gradient-to-br from-purple-400 to-indigo-500 text-background',
    theme: 'elegant',
  },
  {
    title: `⚙️ ${t('home.featuresSection.quickTools.settings.title')}`,
    description: t('home.featuresSection.quickTools.settings.description'),
    icon: Settings,
    path: '/settings',
    color: 'bg-gradient-to-br from-gray-400 to-slate-500 text-background',
    theme: 'neutral',
  },
];

/**
 * 平台优势数据构建函数
 */
const getAdvantages = (t: any) => [
  {
    title: `🤖 ${t('home.featuresSection.advantages.aiPowered.title')}`,
    description: t('home.featuresSection.advantages.aiPowered.description'),
    icon: Target,
    color: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-background',
    bgColor: 'bg-accent',
  },
  {
    title: `🌐 ${t('home.featuresSection.advantages.multiPlatform.title')}`,
    description: t('home.featuresSection.advantages.multiPlatform.description'),
    icon: Globe,
    color: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-background',
    bgColor: 'bg-accent',
  },
  {
    title: `🎨 ${t('home.featuresSection.advantages.professionalTools.title')}`,
    description: t('home.featuresSection.advantages.professionalTools.description'),
    icon: Palette,
    color: 'bg-gradient-to-br from-pink-500 to-rose-600 text-background',
    bgColor: 'bg-accent',
  },
  {
    title: `🔒 ${t('home.featuresSection.advantages.security.title')}`,
    description: t('home.featuresSection.advantages.security.description'),
    icon: Shield,
    color: 'bg-gradient-to-br from-emerald-500 to-green-600 text-background',
    bgColor: 'bg-accent',
  },
];

/**
 * 功能特性展示区域组件
 */
export const FeaturesSection: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // 使用翻译函数构建数据
  const mainFeatures = getMainFeatures(t);
  const quickTools = getQuickTools(t);
  const advantages = getAdvantages(t);

  return (
    <section className="py-10 relative overflow-hidden">
      {/* 移除背景装饰层 */}
      
      <div className="container mx-auto px-4 relative z-10">
        {/* 1️⃣ Banner 标题区域优化 */}
        <div className="text-center py-16 px-4">
          {/* 左侧「核心功能」按钮优化 */}
          <div className="flex items-center justify-center mb-6">
            <Badge 
              variant="outline" 
              className="text-sm px-3 py-1 rounded-full bg-card text-foreground border-border shadow-sm hover:bg-card/80 transition-colors duration-300 animate-fadeInDown"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              🚀 
            </Badge>
          </div>
          
          {/* 2️⃣ 主标题「专业的新媒体创作工具」优化 */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-fadeInUp">
            <span className="text-foreground">
              {t('home.featuresSection.professionalTools')}
            </span>
          </h2>
          
          {/* 3️⃣ 副标题（描述文本）优化 */}
          <p className="text-base text-muted-foreground leading-relaxed max-w-4xl mx-auto mt-4 mb-10 animate-fadeInUp features-subtitle"
             style={{ '--animation-delay': 'var(--features-subtitle-delay)' } as React.CSSProperties}>
            {t('home.featuresSection.toolsDescription')}
          </p>
        </div>

        {/* 主要功能区域 */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">{t('home.featuresSection.mainFeaturesTitle')}</h3>
            <p className="text-muted-foreground">{t('home.featuresSection.mainFeaturesSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <Card
                key={index}
                variant="soft"
                className="group animate-slideUp rounded-xl features-main-card"
                style={{ '--animation-delay': `${index * parseInt(getComputedStyle(document.documentElement).getPropertyValue('--features-main-delay-step')) + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--features-main-delay-base'))}ms` } as React.CSSProperties}
              >
                <CardHeader className="relative">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={'homepage-icon main-feature-icon p-3 rounded-lg ' + feature.color + ' shadow-lg group-hover:shadow-xl transition-all duration-300'}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <Badge className={feature.badgeColor + ' border-0 shadow-sm'}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground mb-2 group-hover:text-foreground transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {feature.features.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-foreground flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className={'w-full border-2 ' + feature.borderColor + ' hover:bg-gradient-to-r ' + feature.hoverColor + ' transition-all duration-300 group-hover:shadow-md'}
                    onClick={(event) => {
                      console.log('功能区按钮被点击:', feature.title, feature.path);
                      console.log('当前认证状态:', isAuthenticated);
                      
                      // 修复跳转逻辑：直接使用login方法
                      if (isAuthenticated) {
                        console.log('用户已登录，直接跳转到:', feature.path);
                        navigate(feature.path);
                      } else {
                        console.log('用户未登录，直接弹出Authing Guard弹窗');
                        // 🔧 防止页面跳转到底部的修复
                        event.preventDefault();
                        event.stopPropagation();
                        login(feature.path);
                      }
                    }}
                  >
                    
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 快速工具区域 */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">{t('home.featuresSection.quickToolsTitle')}</h3>
            <p className="text-muted-foreground">{t('home.featuresSection.quickToolsSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickTools.map((tool, index) => (
              <Card 
                key={index} 
                variant="soft"
                className="group text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-zoomIn features-tools-card"
                style={{ '--animation-delay': `${index * parseInt(getComputedStyle(document.documentElement).getPropertyValue('--features-tools-delay-step')) + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--features-tools-delay-base'))}ms` } as React.CSSProperties}
              >
                <CardContent className="p-6">
                  <div className={'quick-tool-icon quick-tool-' + tool.theme + ' inline-flex items-center justify-center w-12 h-12 rounded-lg ' + tool.color + ' mb-4 shadow-md group-hover:shadow-lg transition-all duration-300'}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 group-hover:text-foreground transition-colors duration-300">
                    {tool.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  <Link to={tool.path}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full hover:bg-accent/50 transition-colors duration-300"
                    >
                      
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 3️⃣ 平台优势区域优化 */}
        <div className="pt-16 pb-8">
          {/* 标题部分优化 */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-2">{t('home.featuresSection.platformAdvantagesTitle')}</h3>
            <p className="text-muted-foreground text-base mt-2 mb-8">
              {t('home.featuresSection.platformAdvantagesSubtitle')}
            </p>
          </div>
          
          {/* 优势卡片网格布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <Card 
                key={index}
                className="group text-center py-6 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 animate-slideUp min-h-[220px] flex flex-col justify-center features-advantages-card"
                style={{ '--animation-delay': `${index * parseInt(getComputedStyle(document.documentElement).getPropertyValue('--features-advantages-delay-step')) + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--features-advantages-delay-base'))}ms` } as React.CSSProperties}
              >
                <CardContent className="p-0">
                  {/* 图标区域 */}
                  <div className={'homepage-icon advantage-icon inline-flex items-center justify-center w-12 h-12 rounded-full ' + advantage.color + ' mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl'}>
                    <advantage.icon className="w-6 h-6" />
                  </div>
                  
                  {/* 标题 */}
                  <h4 className="text-lg font-semibold text-foreground mb-1 group-hover:text-foreground transition-colors duration-300">
                    {advantage.title}
                  </h4>
                  
                  {/* 描述文字 */}
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
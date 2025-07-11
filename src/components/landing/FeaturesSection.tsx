/**
 * 功能特性展示区域
 * 展示平台核心功能和特色
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Zap,
  Sparkles,
  TrendingUp,
  FolderOpen,
  Users,
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
 * 主要功能数据
 */
const mainFeatures = [
  {
    title: 'AI内容适配器',
    description: '智能分析内容，一键适配多平台格式，提升内容传播效果',
    icon: Zap,
    path: '/adapt',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:from-blue-100 hover:to-cyan-100',
    badge: '热门',
    badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    features: ['智能内容分析', '多平台格式适配', '一键生成优化建议', '实时预览效果']
  },
  {
    title: '创意魔方',
    description: 'AI驱动的创意生成工具，激发灵感，创造独特内容',
    icon: Sparkles,
    path: '/creative-studio',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:from-purple-100 hover:to-pink-100',
    badge: '推荐',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    features: ['AI创意生成', '多种创意模板', '灵感库管理', '创意协作']
  },
  {
    title: '全网雷达',
    description: '实时监控热点话题，把握趋势，抢占内容先机',
    icon: TrendingUp,
    path: '/hot-topics',
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:from-orange-100 hover:to-red-100',
    badge: '开发中',
    badgeColor: 'bg-gradient-to-r from-orange-500 to-red-500',
    features: ['实时热点监控', '趋势分析报告', '竞品内容追踪', '话题预测']
  },
  {
    title: '我的资料库',
    description: '个人内容管理中心，收藏整理，随时调用',
    icon: FolderOpen,
    path: '/library',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:from-green-100 hover:to-emerald-100',
    badge: '实用',
    badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
    features: ['内容收藏管理', '智能分类标签', '快速搜索检索', '云端同步']
  },
  {
    title: '品牌库',
    description: '品牌资产管理系统，统一管理，提升品牌一致性',
    icon: Users,
    path: '/brand-library',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'from-indigo-50 to-blue-50',
    borderColor: 'border-indigo-200',
    hoverColor: 'hover:from-indigo-100 hover:to-blue-100',
    badge: '专业',
    badgeColor: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    features: ['品牌资产管理', '视觉规范统一', '团队协作', '版本控制']
  },
];

/**
 * 快速工具数据
 */
const quickTools = [
  {
    title: 'Emoji生成器',
    description: '智能生成表情符号，让内容更有趣',
    icon: Smile,
    path: '/emoji-generator',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    title: '一键转发',
    description: '多平台内容分发，提升传播效率',
    icon: Upload,
    path: '/share-manager',
    color: 'from-teal-400 to-cyan-400',
  },
  {
    title: '朋友圈模板',
    description: '精美模板快速生成，提升内容质量',
    icon: MessageCircle,
    path: '/wechat-templates',
    color: 'from-pink-400 to-rose-400',
  },
  {
    title: '历史记录',
    description: '查看使用历史，追踪创作轨迹',
    icon: Clock,
    path: '/history',
    color: 'from-gray-400 to-slate-400',
  },
];

/**
 * 平台优势数据
 */
const advantages = [
  {
    title: 'AI驱动',
    description: '先进的AI技术，智能分析内容，提供精准建议',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: '多平台适配',
    description: '一键适配微信、微博、抖音等主流平台',
    icon: Globe,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: '专业工具',
    description: '丰富的专业工具，满足不同内容创作需求',
    icon: Palette,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: '安全可靠',
    description: '企业级安全保障，数据加密存储',
    icon: Shield,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

/**
 * 功能特性展示区域组件
 */
export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700">
            <Sparkles className="w-3 h-3 mr-1" />
            核心功能
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            专业的新媒体创作工具
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            从内容创作到分发管理，文派提供全方位的AI驱动工具，助力创作者提升效率和质量
          </p>
        </div>

        {/* 主要功能区域 */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">主要功能</h3>
            <p className="text-muted-foreground">专业工具，助力创作</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <Link key={feature.path} to={feature.path}>
                <Card className={`group relative overflow-hidden border-2 ${feature.borderColor} bg-gradient-to-br ${feature.bgColor} hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer h-full`}>
                  {/* 背景装饰 */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500`}></div>
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <Badge className={`${feature.badgeColor} text-white border-0 text-xs`}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    {/* 功能列表 */}
                    <div className="space-y-2 mb-6">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        立即体验
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 快速工具区域 */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">快速工具</h3>
            <p className="text-muted-foreground">常用工具，快速访问</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickTools.map((tool) => (
              <Link key={tool.path} to={tool.path}>
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-gray-100 hover:border-gray-200 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${tool.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <tool.icon className="w-8 h-8" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                      {tool.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 平台优势区域 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">为什么选择文派？</h3>
            <p className="text-muted-foreground">专业的AI驱动内容创作平台</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex p-6 rounded-2xl ${advantage.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <advantage.icon className={`w-10 h-10 ${advantage.color}`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {advantage.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 行动召唤区域 */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
            <CardContent className="relative p-12">
              <div className="mb-6">
                <Award className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-3xl font-bold mb-4">开始你的创作之旅</h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                  加入文派，体验AI驱动的智能内容创作，让创意无限可能
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold">
                    <Play className="w-5 h-5 mr-2" />
                    免费开始
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                    <Crown className="w-5 h-5 mr-2" />
                    升级专业版
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
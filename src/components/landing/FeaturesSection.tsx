/**
 * 功能特性展示区域
 * 展示平台核心功能和特色
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
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
    title: '🎯 AI内容适配器',
    description: '智能分析内容，一键适配多平台格式，让您的创意在不同平台绽放光彩',
    icon: Zap,
    path: '/adapt',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:from-blue-100 hover:to-cyan-100',
    badge: '🔥 热门',
    badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    features: ['智能内容分析', '多平台格式适配', '一键生成优化建议', '实时预览效果']
  },
  {
    title: '✨ 创意魔方',
    description: 'AI驱动的创意生成工具，激发无限灵感，创造独特而富有吸引力的内容',
    icon: Sparkles,
    path: '/creative-studio',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:from-purple-100 hover:to-pink-100',
    badge: '⭐ 推荐',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    features: ['AI创意生成', '多种创意模板', '灵感库管理', '创意协作']
  },
  {
    title: '📡 全网雷达',
    description: '实时监控热点话题，精准把握趋势脉搏，抢占内容传播先机',
    icon: TrendingUp,
    path: '/hot-topics',
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:from-orange-100 hover:to-red-100',
    badge: '🚧 开发中',
    badgeColor: 'bg-gradient-to-r from-orange-500 to-red-500',
    features: ['实时热点监控', '趋势分析报告', '竞品内容追踪', '话题预测']
  },
  {
    title: '📚 我的资料库',
    description: '个人内容管理中心，智能收藏整理，随时调用，让创作素材触手可及',
    icon: FolderOpen,
    path: '/library',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:from-green-100 hover:to-emerald-100',
    badge: '💡 实用',
    badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
    features: ['内容收藏管理', '智能分类标签', '快速搜索检索', '云端同步']
  },
  {
    title: '🏢 品牌库',
    description: '专业品牌资产管理系统，统一管理品牌元素，提升品牌一致性和识别度',
    icon: Users,
    path: '/brand-library',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'from-indigo-50 to-blue-50',
    borderColor: 'border-indigo-200',
    hoverColor: 'hover:from-indigo-100 hover:to-blue-100',
    badge: '👑 高级版',
    badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    features: ['品牌资产管理', '视觉规范统一', '团队协作', '版本控制']
  },
];

/**
 * 快速工具数据
 */
const quickTools = [
  {
    title: '😊 Emoji生成器',
    description: '智能生成生动表情符号，让内容更有趣更有感染力',
    icon: Smile,
    path: '/emoji-generator',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    title: '🚀 一键转发',
    description: '多平台内容智能分发，最大化传播效果和影响力',
    icon: Upload,
    path: '/share-manager',
    color: 'from-teal-400 to-cyan-400',
  },
  {
    title: '💬 朋友圈模板',
    description: '精美模板快速生成，让您的朋友圈内容脱颖而出',
    icon: MessageCircle,
    path: '/wechat-templates',
    color: 'from-pink-400 to-rose-400',
  },
  {
    title: '📊 历史记录',
    description: '智能追踪创作轨迹，优化内容策略和创作方向',
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
    title: '🤖 AI驱动',
    description: '先进的AI技术，智能分析内容，提供精准建议和优化方案',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: '🌐 多平台适配',
    description: '一键适配微信、微博、抖音等主流平台，覆盖全媒体矩阵',
    icon: Globe,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: '🎨 专业工具',
    description: '丰富的专业工具套件，满足不同内容创作场景和需求',
    icon: Palette,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: '🔒 安全可靠',
    description: '企业级安全保障，数据加密存储，保护您的创作成果',
    icon: Shield,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

/**
 * 功能特性展示区域组件
 */
export const FeaturesSection: React.FC = () => {
  const { login, isAuthenticated } = useUnifiedAuth();
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* 背景装饰 - 顶部淡渐变色块 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50/30 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* 1️⃣ Banner 标题区域优化 */}
        <div className="text-center py-16 px-4">
          {/* 左侧「核心功能」按钮优化 */}
          <div className="flex items-center justify-center mb-6">
            <Badge 
              variant="outline" 
              className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200 transition-colors duration-300 animate-fadeInDown"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              🚀 核心功能
            </Badge>
          </div>
          
          {/* 2️⃣ 主标题「专业的新媒体创作工具」优化 */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-fadeInUp">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
              专业的新媒体创作工具
            </span>
          </h2>
          
          {/* 3️⃣ 副标题（描述文本）优化 */}
          <p className="text-base text-gray-500 leading-relaxed max-w-4xl mx-auto mt-4 mb-10 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            从内容创作到分发管理，文派提供全方位的
            <span className="text-blue-600 font-semibold">AI驱动工具</span>，
            助力创作者提升效率和质量
          </p>
        </div>

        {/* 主要功能区域 */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">主要功能</h3>
            <p className="text-muted-foreground">探索文派的核心功能，提升您的内容创作效率</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <Card 
                key={index} 
                variant="interactive" 
                className="group animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="relative overflow-hidden">
                  {/* 背景装饰 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <Badge className={`${feature.badgeColor} text-white border-0 shadow-sm`}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3 mb-6">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className={`w-full border-2 ${feature.borderColor} hover:bg-gradient-to-r ${feature.hoverColor} transition-all duration-300 group-hover:shadow-md`}
                    onClick={() => {
                      console.log('功能区按钮被点击:', feature.title, feature.path);
                      console.log('当前认证状态:', isAuthenticated);
                      
                      // 修复跳转逻辑：直接使用login方法
                      if (isAuthenticated) {
                        console.log('用户已登录，直接跳转到:', feature.path);                   navigate(feature.path);
                      } else {
                        console.log('用户未登录，直接弹出Authing Guard弹窗');
                        login(feature.path);
                      }
                    }}
                  >
                    立即体验
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 快速工具区域 */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">快速工具</h3>
            <p className="text-muted-foreground">便捷的小工具，让创作更加高效</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickTools.map((tool, index) => (
              <Card 
                key={index} 
                variant="soft" 
                className="group text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-zoomIn"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} text-white mb-4 shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    {tool.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  <Link to={tool.path}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full hover:bg-accent/50 transition-colors duration-300"
                    >
                      使用工具
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 3️⃣ 平台优势区域优化 */}
        <div className="py-16">
          {/* 标题部分优化 */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">平台优势</h3>
            <p className="text-gray-500 text-base mt-2 mb-8">
              为什么选择文派？我们为您提供最优质的服务
            </p>
          </div>
          
          {/* 优势卡片网格布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <Card 
                key={index} 
                className="group text-center py-6 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 animate-slideUp min-h-[220px] flex flex-col justify-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  {/* 图标区域 */}
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${advantage.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <advantage.icon className={`w-5 h-5 ${advantage.color}`} />
                  </div>
                  
                  {/* 标题 */}
                  <h4 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors duration-300">
                    {advantage.title}
                  </h4>
                  
                  {/* 描述文字 */}
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
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
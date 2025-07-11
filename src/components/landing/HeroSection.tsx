/**
 * 英雄区域组件
 * 展示平台主要价值主张和行动召唤
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UpgradeButton } from '@/components/ui/upgrade-button';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Sparkles,
  ArrowRight,
  Play,
  Crown,
  CheckCircle,
  Star,
  Zap,
  Target,
  Lightbulb,
  Award
} from 'lucide-react';

/**
 * 英雄区域组件
 */
export const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { hasRole } = usePermissions();
  const isPro = hasRole('premium') || hasRole('pro') || hasRole('admin');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90 py-20 sm:py-32">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* 徽章 */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-300">
              <Sparkles className="w-3 h-3 mr-1" />
              AI驱动的新媒体创作平台
            </Badge>
            {isPro && (
              <Badge variant="premium" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-pulse">
                <Crown className="w-3 h-3 mr-1" />
                PRO用户
              </Badge>
            )}
          </div>

          {/* 主标题 */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <span className="text-6xl sm:text-7xl animate-bounce">🎯</span>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                文派
              </h1>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-relaxed">
              让内容创作更
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 智能</span>
              、更
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> 高效</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AI驱动的智能内容适配、创意生成和多平台分发工具，助力新媒体创作者提升内容质量和传播效果
            </p>
          </div>

          {/* 功能亮点 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: Zap, text: 'AI智能分析' },
              { icon: Target, text: '多平台适配' },
              { icon: Lightbulb, text: '创意生成' },
              { icon: Award, text: '专业工具' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                <item.icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>

          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold">
                    <Sparkles className="w-6 h-6 mr-3" />
                    免费开始创作
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:bg-accent/50 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                    登录账户
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/adapt">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold">
                    <Zap className="w-6 h-6 mr-3" />
                    开始创作
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                {!isPro && <UpgradeButton size="lg" className="px-8 py-4 text-lg font-semibold" />}
              </div>
            )}
          </div>

          {/* 演示按钮 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button variant="ghost" size="lg" className="group hover:bg-accent/50 transition-all duration-300">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              观看演示
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>4.9/5 用户评分</span>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { number: '10K+', label: '活跃用户', color: 'text-blue-600' },
              { number: '50K+', label: '内容生成', color: 'text-purple-600' },
              { number: '99.9%', label: '服务可用性', color: 'text-green-600' },
              { number: '24/7', label: '技术支持', color: 'text-orange-600' },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
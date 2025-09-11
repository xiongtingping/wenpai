/**
 * 增强版全网雷达页面
 * 集成 RSSHub 和 DailyHot 数据源，提供更全面的热点追踪
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Globe,
  Target,
  BarChart3,
  Settings,
  Info,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import EnhancedHotTopics from '@/components/hot-topics/EnhancedHotTopics';
// import RSSHubIntegration from '@/components/hot-topics/RSSHubIntegration';

export default function EnhancedHotTopicsPage() {
  const [activeMode, setActiveMode] = useState<'enhanced' | 'rsshub' | 'comparison'>('enhanced');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Zap className="h-8 w-8 text-warning" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            增强版全网雷达
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          融合 RSSHub 和 DailyHot 双重数据源，提供更全面、更准确的全网热点追踪体验
        </p>
      </div>

      {/* 功能特性展示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-3">
              <Globe className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg">RSSHub 集成</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              接入 RSSHub API，获取微博、知乎、GitHub、B站等平台的实时热点数据
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>实时数据更新</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>多平台覆盖</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>智能分类标签</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="h-8 w-8 text-success" />
              <h3 className="font-semibold text-lg">数据融合</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              智能融合多个数据源，去重排序，提供最优质的热点内容
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>智能去重算法</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>热度评分系统</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>趋势分析</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-3">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <h3 className="font-semibold text-lg">高级分析</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              提供深度数据分析、分类统计、趋势预测等高级功能
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>分类统计分析</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>数据源对比</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>自定义配置</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 模式选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>显示模式</span>
          </CardTitle>
          <CardDescription>
            选择不同的显示模式来查看热点数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={activeMode === 'enhanced' ? 'default' : 'outline'}
              onClick={() => setActiveMode('enhanced')}
              className="flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>融合模式</span>
              <Badge variant="secondary">推荐</Badge>
            </Button>
            <Button
              variant={activeMode === 'rsshub' ? 'default' : 'outline'}
              onClick={() => setActiveMode('rsshub')}
              className="flex items-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span>RSSHub 模式</span>
            </Button>
            <Button
              variant={activeMode === 'comparison' ? 'default' : 'outline'}
              onClick={() => setActiveMode('comparison')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>对比模式</span>
              <Badge variant="outline">开发中</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 使用提示 */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-2">使用提示</h4>
              <div className="space-y-1 text-sm text-amber-700">
                <p>• <strong>融合模式</strong>：智能整合多个数据源，提供最全面的热点视图</p>
                <p>• <strong>RSSHub 模式</strong>：专注于 RSSHub 数据源，支持平台管理和详细配置</p>
                <p>• <strong>自动刷新</strong>：开启后每5分钟自动更新数据，保持信息时效性</p>
                <p>• <strong>搜索过滤</strong>：支持按关键词、分类、数据源等多维度筛选</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容区域 */}
      <div className="space-y-6">
        {activeMode === 'enhanced' && (
          <EnhancedHotTopics className="w-full" />
        )}

        {activeMode === 'rsshub' && (
          <div className="text-center text-muted-foreground py-8">
            RSSHub 集成功能开发中...
          </div>
        )}

        {activeMode === 'comparison' && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <AlertTriangle className="h-8 w-8" />
                <h3 className="text-xl font-medium">对比模式开发中</h3>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto">
                对比模式将提供 RSSHub 和 DailyHot 数据源的并排对比视图，
                帮助您更好地理解不同数据源的特点和差异。
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <span>预计完成时间：Phase 3</span>
                <ArrowRight className="h-4 w-4" />
                <span>敬请期待</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 技术说明 */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>技术架构</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">数据源</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">RSSHub API</Badge>
                  <span>实时RSS聚合服务</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">DailyHot API</Badge>
                  <span>热榜数据聚合服务</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">数据融合层</Badge>
                  <span>智能去重与排序</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">核心功能</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">实时更新</Badge>
                  <span>5分钟自动刷新</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">智能缓存</Badge>
                  <span>减少API调用频率</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">多维筛选</Badge>
                  <span>分类、来源、关键词</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

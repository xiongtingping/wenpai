/**
 * 全网热门话题页面
 * 显示各平台热门话题和趋势
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Users, Hash, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 全网热门话题页面组件
 * @returns React 组件
 */
export default function HotTopicsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="热点话题"
        description="实时监控各平台热门话题，为内容创作提供灵感"
        actions={
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            开发中
          </Badge>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 功能预览卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                实时趋势监控
              </CardTitle>
              <CardDescription>
                监控小红书、微博、抖音等平台热门话题
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                实时抓取各平台热搜榜、热门话题，为内容创作提供最新趋势参考。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                话题标签分析
              </CardTitle>
              <CardDescription>
                分析热门话题的关键词和标签
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                智能分析热门话题的关键词、标签使用频率，帮助优化内容标签。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                受众兴趣洞察
              </CardTitle>
              <CardDescription>
                分析不同平台的用户兴趣偏好
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                基于热门话题数据，分析各平台用户的兴趣偏好和关注焦点。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                时效性提醒
              </CardTitle>
              <CardDescription>
                及时获取话题热度变化提醒
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                设置话题监控，当相关话题热度上升时及时收到提醒。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                内容建议
              </CardTitle>
              <CardDescription>
                基于热门话题生成内容创作建议
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                AI分析热门话题，为您的品牌提供相关的内容创作建议和方向。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                竞品分析
              </CardTitle>
              <CardDescription>
                监控竞品在热门话题中的表现
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                跟踪竞品在热门话题中的参与度和表现，了解市场动态。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">即将上线</h3>
          <p className="text-blue-700">
            全网热门话题功能正在开发中，将为您提供实时的平台热点监控、话题分析和内容创作建议。
            敬请期待！
          </p>
        </div>
      </div>
    </div>
  );
} 
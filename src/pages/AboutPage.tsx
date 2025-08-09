import { Clock } from "lucide-react";
/**
 * 关于我们页面
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Users, Zap, Target, Star, Globe, Lightbulb, Award } from 'lucide-react';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 关于我们页面组件
 */
const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageNavigation
        title="关于我们"
        description="了解文派的使命和团队"
        showAdaptButton={false}
        actions={<div></div>}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 团队介绍 */}
        <Card variant="gradient" className="rounded-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">文派 - AI内容创作平台</h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                我们致力于为创作者提供最智能、最高效的AI内容创作工具，让每个人都能轻松创作出优质内容。
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
              <h3 className="font-semibold mb-2">创新驱动</h3>
              <p className="text-muted-foreground text-sm">持续探索AI技术在内容创作领域的无限可能</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">用户至上</h3>
              <p className="text-muted-foreground text-sm">以用户需求为中心，不断优化产品体验</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">高效便捷</h3>
              <p className="text-muted-foreground text-sm">简化创作流程，让AI成为最得力的创作助手</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">品质第一</h3>
              <p className="text-muted-foreground text-sm">严格把控每一个功能的质量和用户体验</p>
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
              文派平台的核心优势和特色功能
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
                    <h4 className="font-semibold mb-1">AI内容适配</h4>
                    <p className="text-muted-foreground text-sm">智能适配各大平台，一键生成多平台内容</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">全网热点聚合</h4>
                    <p className="text-muted-foreground text-sm">实时抓取热点话题，把握内容创作时机</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">品牌资产管理</h4>
                    <p className="text-muted-foreground text-sm">统一管理品牌素材，保持内容风格一致</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">创意工作室</h4>
                    <p className="text-muted-foreground text-sm">集成多种创意工具，激发无限创作灵感</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">团队协作</h4>
                    <p className="text-muted-foreground text-sm">支持多人协作，提升团队创作效率</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">智能推荐</h4>
                    <p className="text-muted-foreground text-sm">基于AI算法，提供个性化内容建议</p>
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
              文派平台的重要发展节点
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">项目启动</h4>
                  <p className="text-muted-foreground text-sm">确定产品定位，开始AI内容创作平台的开发</p>
                  <Badge variant="outline" className="mt-1">2024.Q1</Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">核心功能上线</h4>
                  <p className="text-muted-foreground text-sm">AI内容适配、热点聚合等核心功能正式发布</p>
                  <Badge variant="outline" className="mt-1">2024.Q2</Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">功能完善</h4>
                  <p className="text-muted-foreground text-sm">增加创意工具、品牌管理等高级功能</p>
                  <Badge variant="outline" className="mt-1">2024.Q3</Badge>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">持续优化</h4>
                  <p className="text-muted-foreground text-sm">基于用户反馈持续优化产品体验</p>
                  <Badge variant="outline" className="mt-1">进行中</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 联系我们 */}
        <Card>
          <CardHeader>
            <CardTitle>联系我们</CardTitle>
            <CardDescription>
              我们期待听到您的声音
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                如果您有任何问题、建议或合作意向，欢迎随时联系我们。
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
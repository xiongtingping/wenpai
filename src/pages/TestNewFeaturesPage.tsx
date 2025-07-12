import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Smile, MessageCircle, ArrowRight } from 'lucide-react';

/**
 * 新功能测试页面
 */
const TestNewFeaturesPage: React.FC = () => {
  const features = [
    {
      title: '网络信息收藏区',
      description: '支持分类整理、时间、来源、分类等，网页支持跳转、支持备注批注、有复选框勾选是否已用等功能',
      icon: Bookmark,
      path: '/bookmarks',
      color: 'bg-blue-500'
    },
    {
      title: 'Emoji图片区',
      description: '参考thiings.co网站风格，支持点击下载、复制、粘贴。所有图片由AI生成，要求风格和这个网站的一模一样',
      icon: Smile,
      path: '/emojis',
      color: 'bg-green-500'
    },
    {
      title: '微信朋友圈文案颜文字模版',
      description: '点击可以修改、复制、文案。要求有设计感、有emoj、节日、字数要求符合微信朋友圈最佳的展示字数',
      icon: MessageCircle,
      path: '/wechat-templates',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">新功能展示</h1>
        <p className="text-muted-foreground">以下是刚刚实现的三个新功能模块</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = feature.path}
                >
                  <span className="flex items-center justify-center">
                    立即体验
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">功能特点</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">分类管理</h3>
            <p className="text-sm text-muted-foreground">支持多种分类和标签管理</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">AI生成</h3>
            <p className="text-sm text-muted-foreground">Emoji图片由AI智能生成</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">一键复制</h3>
            <p className="text-sm text-muted-foreground">支持快速复制和下载</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">响应式设计</h3>
            <p className="text-sm text-muted-foreground">适配各种设备屏幕</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNewFeaturesPage; 
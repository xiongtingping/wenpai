/**
 * 扩展推广横幅组件
 * 在首页显著位置引导用户下载安装浏览器扩展
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Chrome, Download, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ExtensionPromoBanner() {
  const { t } = useTranslation();

  const features = [
    '支持18个主流平台',
    '自动填充标题、内容、标签',
    '提升10倍发布效率'
  ];

  return (
    <div className="w-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-6 md:p-8 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">

          {/* 左侧图标区域 */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 shadow-2xl">
                <Chrome className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
            </div>
          </div>

          {/* 中间内容区域 */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600 uppercase tracking-wider">
                浏览器扩展
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              文派一键转发助手
            </h3>

            <p className="text-muted-foreground mb-4 text-base">
              安装Chrome扩展,实现真正的一键转发 - 自动打开平台并填充内容,告别重复复制粘贴
            </p>

            {/* 特性列表 */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧按钮区域 */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
              onClick={() => {
                // TODO: 替换为实际的Chrome Web Store链接
                window.open('https://chrome.google.com/webstore', '_blank');
              }}
            >
              <Download className="w-5 h-5 mr-2" />
              立即安装
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-purple-600/50 hover:bg-purple-600/10"
              onClick={() => {
                // 滚动到功能介绍区域
                document.getElementById('extension-guide')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              了解更多
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 扩展功能详细说明组件
 * 展示扩展的详细功能和使用方法
 */
export function ExtensionGuideSection() {
  const steps = [
    {
      number: '01',
      title: '安装扩展',
      description: '点击"立即安装"按钮,从Chrome Web Store安装扩展',
      icon: Download
    },
    {
      number: '02',
      title: '生成内容',
      description: '在文派网站使用AI内容适配功能生成多平台内容',
      icon: Zap
    },
    {
      number: '03',
      title: '一键转发',
      description: '点击"使用扩展一键填充",自动打开各平台并填充内容',
      icon: Chrome
    },
    {
      number: '04',
      title: '确认发布',
      description: '在各平台检查内容后,点击发布按钮即可',
      icon: CheckCircle2
    }
  ];

  const platforms = [
    '小红书', '微博', '知乎', '抖音', 'B站', '快手',
    '今日头条', '百家号', '网易号', '微信公众号', '微信视频号',
    'Twitter/X', 'Facebook', 'LinkedIn', '掘金', 'CSDN', '少数派'
  ];

  return (
    <div id="extension-guide" className="w-full py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">

        {/* 标题区域 */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 rounded-full mb-4">
            <Chrome className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">浏览器扩展</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            如何使用文派一键转发助手
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            4步完成多平台内容发布,提升10倍工作效率
          </p>
        </div>

        {/* 使用步骤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* 连接线 */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-600/50 to-transparent -translate-x-1/2 z-0" />
              )}

              <div className="relative bg-card border border-border rounded-xl p-6 hover:border-purple-600/50 transition-all duration-300 hover:shadow-lg h-full">
                {/* 步骤编号 */}
                <div className="text-6xl font-bold text-purple-600/10 mb-4">
                  {step.number}
                </div>

                {/* 图标 */}
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600/10 rounded-lg mb-4">
                  <step.icon className="w-6 h-6 text-purple-600" />
                </div>

                {/* 标题和描述 */}
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 支持平台 */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">
            支持18个主流平台
          </h3>

          <div className="flex flex-wrap justify-center gap-3">
            {platforms.map((platform, index) => (
              <span
                key={index}
                className="inline-flex items-center px-4 py-2 bg-purple-600/10 text-purple-600 rounded-full text-sm font-medium hover:bg-purple-600/20 transition-colors"
              >
                {platform}
              </span>
            ))}
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-medium">
              持续更新中...
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg text-lg px-8 py-6"
            onClick={() => {
              window.open('https://chrome.google.com/webstore', '_blank');
            }}
          >
            <Download className="w-5 h-5 mr-2" />
            立即安装扩展
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            完全免费 · 不收集数据 · 开源透明
          </p>
        </div>
      </div>
    </div>
  );
}

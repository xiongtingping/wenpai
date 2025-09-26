/**
 * 创意魔方页面 - 测试版本
 * 使用原生HTML替代Radix UI Tabs来隔离问题
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Sparkles,
  Smile,
  FileText,
  FolderOpen,
} from 'lucide-react';
import { Header } from '@/components/landing/Header';
import PageNavigation from '@/components/layout/PageNavigation';
import { useAuth } from '@/hooks/useAuth';
import { RoleBasedUpgradePrompt } from '@/components/ui/RoleBasedUpgradePrompt';
import { EnhancedUnifiedPermissionGuard } from '@/components/auth/EnhancedUnifiedPermissionGuard';

// 懒加载组件
const MD2WeChatPage = React.lazy(() => import('@/components/creative/MD2WeChatPage'));
const CreativeCube = React.lazy(() => import('@/components/creative/CreativeCube'));
const MarketingCalendar = React.lazy(() => import('@/components/creative/MarketingCalendar'));

export default function CreativeStudioPageTest() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  
  const isPremiumUser = user?.subscription?.tier === 'premium' || 
                       user?.tier === 'premium' || 
                       user?.vipLevel === 'premium' ||
                       (user?.isVip && (user?.vipLevel === 'premium' || user?.subscription?.tier === 'premium'));

  const tabs = [
    { id: 'calendar', label: '营销日历', icon: Calendar },
    { id: 'cube', label: '创意魔方', icon: Sparkles },
    { id: 'emoji', label: 'Emoji图库', icon: Smile },
    { id: 'md2wechat', label: 'Markdown排版工具', icon: FileText },
    { id: 'md2card', label: 'MD2Card卡片生成', icon: FolderOpen },
  ];

  const handleTabClick = (tabId: string) => {
    console.log('🎯 Tab点击:', tabId);
    
    // 记录点击前Header位置
    const header = document.querySelector('header');
    const beforeRect = header?.getBoundingClientRect();
    console.log('📍 点击前Header位置:', beforeRect);
    
    setActiveTab(tabId);
    
    // 检查点击后位置
    setTimeout(() => {
      const afterRect = header?.getBoundingClientRect();
      const topDiff = afterRect && beforeRect ? afterRect.top - beforeRect.top : 0;
      const leftDiff = afterRect && beforeRect ? afterRect.left - beforeRect.left : 0;
      
      console.log('📍 点击后Header位置:', afterRect);
      console.log('📊 位置变化:', { topDiff, leftDiff });
      
      if (Math.abs(topDiff) > 1 || Math.abs(leftDiff) > 1) {
        console.log('🚨 原生Tab测试: 检测到Header位移！');
      } else {
        console.log('✅ 原生Tab测试: Header位置稳定');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: '64px' }}>
      {/* 主导航栏 */}
      <Header />

      {/* 页面导航 */}
      <PageNavigation
        title="创意魔方 (测试版)"
        description="使用原生Tab替代Radix UI来测试下沉问题"
        showAdaptButton={false}
        showUpgradeButton={false}
        actions={
          !isPremiumUser ? (
            <RoleBasedUpgradePrompt
              requiredTier="pro"
              featureName="创意魔方"
              description="该功能区为专业版/高级版专属"
              mode="compact"
            />
          ) : null
        }
      />

      <EnhancedUnifiedPermissionGuard
        requiredPermission="feature:creative-studio"
        mode="overlay"
        overlayIntensity="medium"
        enableLogging={true}
      >
        <div className="container mx-auto px-4 py-8">
          {/* 原生Tab切换 */}
          <div className="w-full">
            {/* Tab列表 */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 p-1 bg-background/5 backdrop-blur-lg border border-border rounded-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex flex-col items-center gap-1 p-3 h-auto min-h-[60px] rounded-full transition-all ${
                      activeTab === tab.id 
                        ? 'bg-primary/10 text-primary shadow' 
                        : 'text-muted-foreground hover:bg-background/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-xs text-center leading-tight">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab内容 */}
            <div className="mt-8">
              {/* 营销日历 */}
              {activeTab === 'calendar' && (
                <div className="creative-studio-module">
                  <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <MarketingCalendar />
                  </React.Suspense>
                </div>
              )}

              {/* 创意魔方 */}
              {activeTab === 'cube' && (
                <div className="creative-studio-module">
                  <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <CreativeCube />
                  </React.Suspense>
                </div>
              )}

              {/* Emoji图库 */}
              {activeTab === 'emoji' && (
                <div className="creative-studio-module">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smile className="w-5 h-5" />
                        Emoji图库
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Emoji图库功能开发中...</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Markdown排版工具 */}
              {activeTab === 'md2wechat' && (
                <div className="creative-studio-module">
                  <React.Suspense fallback={
                    <div className="flex items-center justify-center p-8" style={{height: 'calc(100vh - 216px)', minHeight: '400px'}}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }>
                    <MD2WeChatPage />
                  </React.Suspense>
                </div>
              )}

              {/* MD2Card卡片生成 */}
              {activeTab === 'md2card' && (
                <div className="creative-studio-module">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        MD2Card卡片生成
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>MD2Card功能开发中...</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </EnhancedUnifiedPermissionGuard>
    </div>
  );
}
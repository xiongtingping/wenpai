/**
 * 创意工作室页面
 * Creative Studio Page
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  CheckSquare,
  Square,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Save,
  RefreshCw,
  Sparkles,
  Lightbulb,
  FileText,
  Clock,
  Tag,
  Star,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
  FolderOpen,
  Smile
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CreativeCube } from '@/components/creative/CreativeCube';
import MarketingCalendar from '@/components/creative/MarketingCalendar';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
import { PermissionAwareContainer } from '@/components/auth/PermissionAwareContainer';
import { PermissionProtectedInput } from '@/components/auth/PermissionProtectedInput';
import { EnhancedUnifiedPermissionGuard } from '@/components/auth/EnhancedUnifiedPermissionGuard';
import { RoleBasedUpgradePrompt } from '@/components/ui/RoleBasedUpgradePrompt';
import { Header } from '@/components/landing/Header';

// 使用懒加载避免循环依赖
const WechatTemplatePage = React.lazy(() => import('@/pages/WechatTemplatePage'));
const EmojiPage = React.lazy(() => import('@/pages/EmojiPage'));
const MD2WeChatPage = React.lazy(() => import('@/components/creative/MD2WeChatPage'));
const MD2CardPage = React.lazy(() => import('@/components/creative/MD2CardPage'));
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 创意工作室页面组件
 * @returns React 组件
 */
export default function CreativeStudioPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-height, var(--spacing-24))' }}>
        {/* 主导航栏 */}
        <Header />

        {/* 页面导航 */}
        <PageNavigation
          title="创意工作室"
          description="包含营销日历、创意魔方、Emoji图库、Markdown排版等多种创意工具"
          showAdaptButton={false}
          showUpgradeButton={false}
          actions={
            <RoleBasedUpgradePrompt
              requiredTier="pro"
              featureName={t('pages.labels.创意魔方')}
              description="该功能区为专业版/高级版专属，包含九宫格创意魔方、营销日历、朋友圈模板等专业创意工具"
              mode="compact"
            />
          }
        />

        <EnhancedUnifiedPermissionGuard
          requiredPermission="feature:creative-studio"
          mode="overlay"
          overlayIntensity="medium"
        >
          <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* 子模块切换 */}
            <div className="flex flex-col gap-4 mb-6">
              <TabsList className="unified-tabs-list grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
                <TabsTrigger value="calendar" className="unified-tab-trigger flex flex-col items-center gap-1 p-3 h-auto min-h-[60px]">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs text-center leading-tight">营销日历</span>
                </TabsTrigger>
                <TabsTrigger value="cube" className="unified-tab-trigger flex flex-col items-center gap-1 p-3 h-auto min-h-[60px]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs text-center leading-tight">创意魔方</span>
                </TabsTrigger>
                {/* 暂时隐藏朋友圈文案功能
                <TabsTrigger value="wechat" className="unified-tab-trigger flex flex-col items-center gap-1 p-3 h-auto min-h-[60px]">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs text-center leading-tight">朋友圈文案</span>
                </TabsTrigger>
                */}
                <TabsTrigger value="emoji" className="unified-tab-trigger flex flex-col items-center gap-1 p-3 h-auto min-h-[60px]">
                  <Smile className="w-4 h-4" />
                  <span className="text-xs text-center leading-tight">Emoji图库</span>
                </TabsTrigger>
                <TabsTrigger value="md2wechat" className="unified-tab-trigger flex flex-col items-center gap-1 p-3 h-auto min-h-[60px]">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs text-center leading-tight">Markdown排版工具</span>
                </TabsTrigger>
                <TabsTrigger value="md2card" className="unified-tab-trigger flex flex-col items-center gap-1 p-3 h-auto min-h-[60px]">
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-xs text-center leading-tight">MD2Card卡片生成</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 营销日历 */}
            <TabsContent value="calendar" className="mt-8">
              <div className="creative-studio-module">
                <MarketingCalendar />
              </div>
            </TabsContent>

            {/* 九宫格创意魔方 */}
            <TabsContent value="cube" className="mt-8">
              <div className="creative-studio-module">
                <CreativeCube />
              </div>
            </TabsContent>

            {/* 暂时隐藏朋友圈文案功能
            <TabsContent value="wechat" className="mt-8">
              <div className="creative-studio-module">
                <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <WechatTemplatePage />
                </React.Suspense>
              </div>
            </TabsContent>
            */}

            {/* Emoji图库 */}
            <TabsContent value="emoji" className="mt-8">
              <div className="creative-studio-module">
                <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <EmojiPage />
                </React.Suspense>
              </div>
            </TabsContent>

            {/* Markdown排版工具 */}
            <TabsContent value="md2wechat" className="mt-8">
              <div className="creative-studio-module">
                <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <MD2WeChatPage />
                </React.Suspense>
              </div>
            </TabsContent>

            {/* MD2Card卡片生成 */}
            <TabsContent value="md2card" className="mt-8">
              <div className="creative-studio-module">
                <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <MD2CardPage />
                </React.Suspense>
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </EnhancedUnifiedPermissionGuard>
      </div>
  );
}

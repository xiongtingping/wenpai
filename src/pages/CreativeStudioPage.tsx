/**
 * 创意工作室页面
 * 包含九宫格创意魔方、营销日历、朋友圈模板和Emoji生成器
 */

import React, { useState, useEffect } from 'react';
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

import { UnifiedPermissionGuard } from '@/components/auth/UnifiedPermissionGuard';
import { RoleBasedUpgradePrompt } from '@/components/ui/RoleBasedUpgradePrompt';

// 使用懒加载避免循环依赖
const WechatTemplatePage = React.lazy(() => import('@/pages/WechatTemplatePage'));
const EmojiPage = React.lazy(() => import('@/pages/EmojiPage'));
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 创意工作室页面组件
 * @returns React 组件
 */
export default function CreativeStudioPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');



  return (
    <div className="min-h-screen bg-background">
        {/* 页面导航 */}
        <PageNavigation
          title="创意魔方"
          description="激发创意灵感，快速生成高质量内容"
          showAdaptButton={false}
          showUpgradeButton={false}
          actions={
            <RoleBasedUpgradePrompt
              requiredTier="pro"
              featureName="创意魔方"
              description="该功能区为专业版/高级版专属，包含九宫格创意魔方、营销日历、文案模板等创意工具"
              mode="compact"
            />
          }
        />

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* 子模块切换 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="unified-tabs-list grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
                <TabsTrigger value="calendar" className="unified-tab-trigger">
                  <Calendar className="tab-icon" />
                  <span className="tab-text-mobile">日历</span>
                  <span className="tab-text-desktop">营销日历</span>
                </TabsTrigger>
                <TabsTrigger value="cube" className="unified-tab-trigger">
                  <Sparkles className="tab-icon" />
                  <span className="tab-text-mobile">魔方</span>
                  <span className="tab-text-desktop">九宫格创意魔方</span>
                </TabsTrigger>
                <TabsTrigger value="wechat" className="unified-tab-trigger">
                  <MessageCircle className="tab-icon" />
                  <span className="tab-text-mobile">文案</span>
                  <span className="tab-text-desktop">微信朋友圈文案模板</span>
                </TabsTrigger>
                <TabsTrigger value="emoji" className="unified-tab-trigger">
                  <Smile className="tab-icon" />
                  <span className="tab-text-mobile">Emoji</span>
                  <span className="tab-text-desktop">Emoji图库</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 营销日历 */}
            <TabsContent value="calendar" className="mt-6">
              <UnifiedPermissionGuard
                requiredPermission="feature:marketing-calendar"
                featureName="营销日历"
                description="智能营销日历和任务管理，帮助您规划营销活动"
              >
                <MarketingCalendar />
              </UnifiedPermissionGuard>
            </TabsContent>

            {/* 九宫格创意魔方法 */}
            <TabsContent value="cube" className="mt-6">
              <UnifiedPermissionGuard
                requiredPermission="feature:creative-studio"
                featureName="九宫格创意魔方"
                description="专业版/高级版专属功能，可以帮助您快速生成高质量的创意内容，提升内容创作效率。"
              >
                <CreativeCube />
              </UnifiedPermissionGuard>
            </TabsContent>

            {/* 朋友圈文案 */}
            <TabsContent value="wechat" className="mt-6">
              <UnifiedPermissionGuard
                requiredPermission="feature:creative-studio"
                featureName="微信朋友圈文案模板"
                description="专业版/高级版专属功能，专业设计的社交媒体文案模板库，快速生成高质量文案"
              >
                <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <WechatTemplatePage />
                </React.Suspense>
              </UnifiedPermissionGuard>
            </TabsContent>

            {/* Emoji生成器 */}
            <TabsContent value="emoji" className="mt-6">
              <UnifiedPermissionGuard
                requiredPermission="feature:creative-studio"
                featureName="Emoji生成器"
                description="智能生成个性化Emoji图片和推荐"
                allowPreview={true}
              >
                <div className="bg-card rounded-lg border border-border">
                  <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <EmojiPage />
                  </React.Suspense>
                </div>
              </UnifiedPermissionGuard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
} 
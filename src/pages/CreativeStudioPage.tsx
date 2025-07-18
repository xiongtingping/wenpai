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
import PreviewGuard from '@/components/auth/PreviewGuard';
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
    <PreviewGuard
      featureId="creative-studio"
      featureName="创意魔方"
      featureDescription="AI驱动的创意内容生成工具，包含九宫格创意魔方、营销日历、朋友圈模板和Emoji生成器"
      allowClose={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* 页面导航 */}
        <PageNavigation
          title="创意魔方"
          description="激发创意灵感，快速生成高质量内容"
          showAdaptButton={false}
        />

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* 子模块切换 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
                <TabsTrigger value="calendar" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">营销日历</span>
                  <span className="sm:hidden">日历</span>
                </TabsTrigger>
                <TabsTrigger value="cube" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">九宫格创意魔方</span>
                  <span className="sm:hidden">魔方</span>
                </TabsTrigger>
                <TabsTrigger value="wechat" className="flex items-center gap-2 text-xs sm:text-sm">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">朋友圈文案</span>
                  <span className="sm:hidden">文案</span>
                </TabsTrigger>
                <TabsTrigger value="emoji" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Smile className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Emoji生成器</span>
                  <span className="sm:hidden">Emoji</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 营销日历 */}
            <TabsContent value="calendar" className="mt-6">
              <MarketingCalendar />
            </TabsContent>

            {/* 九宫格创意魔方法 */}
            <TabsContent value="cube" className="mt-6">
              <CreativeCube />
            </TabsContent>

            {/* 朋友圈文案 */}
            <TabsContent value="wechat" className="mt-6">
              <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                <WechatTemplatePage />
              </React.Suspense>
            </TabsContent>

            {/* Emoji生成器 */}
            <TabsContent value="emoji" className="mt-6">
              <div className="bg-white rounded-lg">
                <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                  <EmojiPage />
                </React.Suspense>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PreviewGuard>
  );
} 
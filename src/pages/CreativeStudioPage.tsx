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
import WechatTemplatePage from '@/pages/WechatTemplatePage';
import EmojiPage from '@/pages/EmojiPage';
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
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="创意魔方"
        description="激发创意灵感，快速生成高质量内容"
        actions={
          <Button variant="outline" onClick={() => navigate('/library')}>
            <FolderOpen className="w-4 h-4 mr-2" />
            我的资料库
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* 子模块切换 */}
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                营销日历
              </TabsTrigger>
              <TabsTrigger value="cube" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                九宫格创意魔方
              </TabsTrigger>
              <TabsTrigger value="wechat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                朋友圈文案
              </TabsTrigger>
              <TabsTrigger value="emoji" className="flex items-center gap-2">
                <Smile className="w-4 h-4" />
                Emoji生成器
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
            <WechatTemplatePage />
          </TabsContent>

          {/* Emoji生成器 */}
          <TabsContent value="emoji" className="mt-6">
            <div className="bg-white rounded-lg">
              <EmojiPage />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
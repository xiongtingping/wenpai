/**
 * 创意工作室页面
 * 包含九宫格创意魔方、文案保存区、营销日历和代办事项
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
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CreativeCube } from '@/components/creative/CreativeCube';
import { MemoManager } from '@/components/creative/MemoManager';
import { MarketingCalendar } from '@/components/creative/MarketingCalendar';
import { TodoList } from '@/components/creative/TodoList';

/**
 * 创意工作室页面组件
 * @returns React 组件
 */
export default function CreativeStudioPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>
      </div>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">创意工作室</h1>
        <p className="text-gray-600">
          九宫格创意魔方、文案管理、营销日历、代办事项一体化创意工具
        </p>
      </div>

      {/* 功能标签页 */}
      <Tabs defaultValue="cube" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cube" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            创意魔方
          </TabsTrigger>
          <TabsTrigger value="memo" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            文案管理
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            营销日历
          </TabsTrigger>
          <TabsTrigger value="todo" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            代办事项
          </TabsTrigger>
        </TabsList>

        {/* 九宫格创意魔方 */}
        <TabsContent value="cube" className="mt-6">
          <CreativeCube />
        </TabsContent>

        {/* 文案管理 */}
        <TabsContent value="memo" className="mt-6">
          <MemoManager />
        </TabsContent>

        {/* 营销日历 */}
        <TabsContent value="calendar" className="mt-6">
          <MarketingCalendar />
        </TabsContent>

        {/* 代办事项 */}
        <TabsContent value="todo" className="mt-6">
          <TodoList />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
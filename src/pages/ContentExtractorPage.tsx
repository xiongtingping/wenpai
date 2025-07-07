/**
 * 内容抓取工具页面
 * 支持 Markdown、JSON、HTML、图片、网页内容提取和AI自动总结
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText,
  Globe,
  Image,
  Download,
  Upload,
  Copy,
  RefreshCw,
  Sparkles,
  Search,
  Filter,
  Eye,
  EyeOff,
  Link,
  File,
  Code,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ContentExtractor } from '@/components/extractor/ContentExtractor';
import { AISummarizer } from '@/components/extractor/AISummarizer';
import { ContentPreview } from '@/components/extractor/ContentPreview';

/**
 * 内容抓取工具页面组件
 * @returns React 组件
 */
export default function ContentExtractorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/adapt'}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回内容适配器
        </Button>
      </div>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">内容抓取工具</h1>
        <p className="text-gray-600">
          支持多种格式的内容提取、AI自动总结和智能分析
        </p>
      </div>

      {/* 功能标签页 */}
      <Tabs defaultValue="extract" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="extract" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            内容提取
          </TabsTrigger>
          <TabsTrigger value="summarize" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI总结
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            内容预览
          </TabsTrigger>
        </TabsList>

        {/* 内容提取 */}
        <TabsContent value="extract" className="mt-6">
          <ContentExtractor />
        </TabsContent>

        {/* AI总结 */}
        <TabsContent value="summarize" className="mt-6">
          <AISummarizer />
        </TabsContent>

        {/* 内容预览 */}
        <TabsContent value="preview" className="mt-6">
          <ContentPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
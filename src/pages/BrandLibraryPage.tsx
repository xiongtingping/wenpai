/**
 * 品牌资料库页面组件
 * @description 多维品牌语料库，支持AI自动分析和用户自定义修改
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Database, Upload, FileText, File, FileImage, 
  AlertCircle, Info, Search, Check, Clock, Trash2,
  SortAsc, Filter, Download, Eye, Edit, Copy,
  Globe, Users, Target, Zap, Brain, Sparkles,
  BookOpen, Palette, MessageSquare, Shield,
  Plus, X, RotateCcw, Save, FileUp, FolderOpen,
  Tag, Hash, Heart, Star, Lightbulb, Award,
  TrendingUp, Users2, Package, Share2, MoreHorizontal,
  Loader2, Crown, Lock
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageNavigation from '@/components/layout/PageNavigation';
import PreviewGuard from '@/components/auth/PreviewGuard';

/**
 * 品牌语料库维度接口
 */
interface BrandDimension {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  keywords: string[];
  isRequired: boolean;
  category: 'basic' | 'identity' | 'content' | 'voice';
}

/**
 * 品牌资料库页面组件
 * @description 多维品牌语料库，支持AI自动分析和用户自定义修改
 */
export default function BrandLibraryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 使用PreviewGuard组件进行权限检查
  return (
    <PreviewGuard
      featureId="brand-library"
      featureName="品牌库功能"
      featureDescription="多维品牌语料库，支持AI自动分析和用户自定义修改"
      allowClose={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <PageNavigation
          title="多维品牌语料库"
          description="AI智能分析品牌资料，自动构建完整的品牌语料库，支持多维度自定义完善"
          showAdaptButton={false}
          showUpgradeButton={true}
        />

        <div className="container mx-auto px-4 py-8">
          {/* 提示信息 */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>使用提示：</strong>上传品牌资料越多，AI分析越准确。建议上传品牌手册、产品介绍、营销文案等资料。
              所有维度都支持手动编辑，AI会自动补充关键词建议。
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="dimensions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dimensions">品牌语料库</TabsTrigger>
              <TabsTrigger value="assets">资料管理</TabsTrigger>
            </TabsList>

            {/* 品牌语料库维度 */}
            <TabsContent value="dimensions" className="space-y-6">
              <div className="flex justify-end mb-4">
                <Button onClick={() => toast({ title: "保存成功", description: "品牌语料库已保存" })}>
                  <Save className="h-4 w-4 mr-2" />
                  保存语料库
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 基础信息 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                      基础信息
                    </CardTitle>
                    <CardDescription>品牌的基本信息和定位</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <div>
                          <Label className="text-sm font-medium">品牌名称</Label>
                          <p className="text-xs text-gray-500">品牌的名字</p>
                        </div>
                      </div>
                      <Input placeholder="请输入您的品牌名称..." />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <div>
                          <Label className="text-sm font-medium">品牌描述</Label>
                          <p className="text-xs text-gray-500">简要描述品牌定位和特色</p>
                        </div>
                      </div>
                      <Textarea placeholder="请描述您的品牌定位、特色和核心价值..." />
                    </div>
                  </CardContent>
                </Card>
                
                {/* 语调风格 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5 text-orange-600" />
                      语调风格
                    </CardTitle>
                    <CardDescription>品牌的语音特征和表达方式</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <div>
                          <Label className="text-sm font-medium">品牌Slogan</Label>
                          <p className="text-xs text-gray-500">品牌的口号</p>
                        </div>
                      </div>
                      <Input placeholder="请输入您的品牌口号..." />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 资料管理 */}
            <TabsContent value="assets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>品牌资料管理</CardTitle>
                  <CardDescription>管理上传的品牌资料文件</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无品牌资料，请上传文件开始构建语料库</p>
                    <Button className="mt-4">
                      <Upload className="h-4 w-4 mr-2" />
                      上传资料
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PreviewGuard>
  );
}
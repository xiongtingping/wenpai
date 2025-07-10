import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  TrendingUp, Users2, Package
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageNavigation from '@/components/layout/PageNavigation';
import BrandProfileGenerator from '@/components/creative/BrandProfileGenerator';
import BrandProfileViewer from '@/components/creative/BrandProfileViewer';
import { BrandProfile, BrandAsset } from '@/types/brand';

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
  const [activeTab, setActiveTab] = useState('dimensions');
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null);
  const [editingDimension, setEditingDimension] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 品牌语料库维度定义
  const [brandDimensions, setBrandDimensions] = useState<BrandDimension[]>([
    {
      id: 'brandName',
      title: '品牌名称',
      description: '品牌的名字',
      icon: <Target className="h-5 w-5" />,
      placeholder: '请输入您的品牌名称...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'basic'
    },
    {
      id: 'brandDescription',
      title: '品牌描述',
      description: '简要描述品牌定位和特色',
      icon: <FileText className="h-5 w-5" />,
      placeholder: '请描述您的品牌定位、特色和核心价值...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'basic'
    },
    {
      id: 'brandSlogan',
      title: '品牌Slogan',
      description: '品牌的口号',
      icon: <MessageSquare className="h-5 w-5" />,
      placeholder: '请输入您的品牌口号...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'identity'
    },
    {
      id: 'brandValues',
      title: '品牌价值观',
      description: '驱动品牌行为和决策的基本原则是什么？',
      icon: <Heart className="h-5 w-5" />,
      placeholder: '请描述您的品牌价值观和基本原则...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'identity'
    },
    {
      id: 'brandVision',
      title: '品牌愿景与使命',
      description: '你的品牌存在的根本原因是什么？长期目标是什么？',
      icon: <Target className="h-5 w-5" />,
      placeholder: '请描述您的品牌愿景、使命和长期目标...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'identity'
    },
    {
      id: 'brandStory',
      title: '品牌故事',
      description: '品牌起源故事',
      icon: <BookOpen className="h-5 w-5" />,
      placeholder: '请讲述您的品牌起源故事...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'identity'
    },
    {
      id: 'adSlogans',
      title: '广告语集',
      description: '品牌过往广告中使用的标语口号',
      icon: <Zap className="h-5 w-5" />,
      placeholder: '请列出您的品牌广告语和标语...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'content'
    },
    {
      id: 'productKeywords',
      title: '产品描述词库',
      description: '描述品牌产品或服务的核心关键词',
      icon: <Package className="h-5 w-5" />,
      placeholder: '请列出描述您产品的核心关键词...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'content'
    },
    {
      id: 'brandTone',
      title: '品牌语调/语气',
      description: '包括语言风格、语气、情感倾向（如正式、友好、幽默、专业等）',
      icon: <Palette className="h-5 w-5" />,
      placeholder: '请描述您的品牌语调、语气和语言风格...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'voice'
    },
    {
      id: 'brandPersonality',
      title: '品牌个性',
      description: '如果你的品牌是一个人，它会是什么样的性格？',
      icon: <Users2 className="h-5 w-5" />,
      placeholder: '请描述您的品牌个性特征...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'voice'
    },
    {
      id: 'coreTopics',
      title: '品牌核心话题',
      description: '品牌内容的核心主题和指引方向',
      icon: <TrendingUp className="h-5 w-5" />,
      placeholder: '请列出您的品牌核心话题和内容方向...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'content'
    },
    {
      id: 'brandHashtags',
      title: '品牌Hashtags',
      description: '以#话题的形式，在品牌内容结尾出现，推荐用户使用这些',
      icon: <Hash className="h-5 w-5" />,
      placeholder: '请列出您的品牌标签，如：#品牌名 #产品特色...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'content'
    },
    {
      id: 'brandKeywords',
      title: '品牌关键词',
      description: '尽量在品牌内容中使用的词',
      icon: <Tag className="h-5 w-5" />,
      placeholder: '请列出您的品牌关键词...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'content'
    },
    {
      id: 'forbiddenWords',
      title: '品牌禁用词',
      description: '禁止在品牌内容中出现的词',
      icon: <Shield className="h-5 w-5" />,
      placeholder: '请列出您的品牌禁用词...',
      value: '',
      keywords: [],
      isRequired: true,
      category: 'content'
    }
  ]);

  // 初始化品牌档案
  useEffect(() => {
    const defaultProfile: BrandProfile = {
      id: '1',
      name: '我的品牌',
      tone: '专业而亲切',
      slogans: ['专业可靠', '用户友好', '创新引领'],
      keywords: ['专业', '可靠', '创新', '用户友好'],
      forbiddenWords: ['过度营销', '技术术语', '负面词汇'],
      files: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      aiAnalysis: {
        toneAnalysis: '专业而亲切',
        keyThemes: ['专业', '可靠', '创新'],
        brandPersonality: '专业可靠的品牌形象',
        targetAudience: '追求专业解决方案的用户',
        contentSuggestions: ['强调专业性', '突出可靠性', '展现创新性'],
        valueAlignment: ['建议1', '建议2'],
        topicConsistency: ['建议1', '建议2']
      }
    };
    setBrandProfile(defaultProfile);
  }, []);

  /**
   * 处理文件上传
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // 处理每个上传的文件
    const newAssets: BrandAsset[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 根据文件类型生成图标
      let fileIcon = <FileText className="h-8 w-8 text-blue-500" />;
      
      if (file.type.includes('pdf')) {
        fileIcon = <File className="h-8 w-8 text-red-500" />;
      } else if (file.type.includes('image')) {
        fileIcon = <FileImage className="h-8 w-8 text-green-500" />;
      } else if (file.type.includes('word')) {
        fileIcon = <FileText className="h-8 w-8 text-blue-700" />;
      }
      
      // 创建资产对象
      const asset: BrandAsset = {
        id: `asset-${Date.now()}-${i}`,
        name: file.name,
        type: 'document',
        content: '',
        uploadDate: new Date(),
        fileIcon,
        description: '',
        category: '品牌资料',
        processingStatus: 'pending'
      };
      
      newAssets.push(asset);
      
      // 模拟上传进度
      setUploadProgress(((i + 1) / files.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 添加到状态
    setBrandAssets(prev => [...prev, ...newAssets]);
    
    // 重置文件输入
    e.target.value = '';
    setIsUploading(false);
    setUploadProgress(0);
    
    toast({
      title: "文件上传成功",
      description: `已成功上传 ${newAssets.length} 个品牌资料文件，AI将自动分析并补充语料库`,
    });

    // 自动开始AI分析
    setTimeout(() => {
      handleProcessAssets();
    }, 1000);
  };

  /**
   * 处理品牌资料AI分析
   */
  const handleProcessAssets = async () => {
    const unprocessedAssets = brandAssets.filter(asset => asset.processingStatus !== 'completed');
    if (unprocessedAssets.length === 0) {
      toast({
        title: "无需处理",
        description: "所有文件都已处理完成",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    for (let i = 0; i < unprocessedAssets.length; i++) {
      const asset = unprocessedAssets[i];
      
      // 更新处理状态
      setBrandAssets(prev => prev.map(a => 
        a.id === asset.id 
          ? { ...a, processingStatus: 'processing' as const }
          : a
      ));

      // 模拟AI处理
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 生成模拟提取内容
      const mockContent = `这是从 ${asset.name} 中提取的品牌相关内容。包含品牌理念、核心价值观、目标受众等信息。`;
      const mockKeywords = ['品牌', '价值', '理念', '目标', '专业', '创新'];

      // 更新资产数据
      setBrandAssets(prev => prev.map(a => 
        a.id === asset.id 
          ? { 
              ...a, 
              content: mockContent,
              extractedKeywords: mockKeywords,
              processingStatus: 'completed' as const
            }
          : a
      ));

      // 自动补充语料库维度
      updateBrandDimensions(mockKeywords, mockContent);

      setProcessingProgress(((i + 1) / unprocessedAssets.length) * 100);
    }

    setIsProcessing(false);
    setProcessingProgress(0);

    toast({
      title: "AI分析完成",
      description: "已自动分析品牌资料并补充语料库，请查看并完善各维度内容",
    });
  };

  /**
   * 根据AI分析结果更新品牌维度
   */
  const updateBrandDimensions = (keywords: string[], content: string) => {
    setBrandDimensions(prev => prev.map(dimension => {
      // 根据维度类型和关键词自动补充内容
      let newValue = dimension.value;
      let newKeywords = [...dimension.keywords];

      switch (dimension.id) {
        case 'brandKeywords':
          if (dimension.value === '') {
            newValue = keywords.join('、');
            newKeywords = keywords;
          }
          break;
        case 'brandDescription':
          if (dimension.value === '') {
            newValue = content.substring(0, 200) + '...';
          }
          break;
        case 'brandTone':
          if (dimension.value === '') {
            newValue = '专业、可靠、创新';
          }
          break;
        case 'brandPersonality':
          if (dimension.value === '') {
            newValue = '专业可靠、用户友好、创新引领';
          }
          break;
        case 'productKeywords':
          if (dimension.value === '') {
            newValue = keywords.filter(k => k.length > 1).join('、');
          }
          break;
      }

      return {
        ...dimension,
        value: newValue,
        keywords: newKeywords
      };
    }));
  };

  /**
   * 更新维度内容
   */
  const updateDimension = (id: string, value: string) => {
    setBrandDimensions(prev => prev.map(d => 
      d.id === id ? { ...d, value } : d
    ));
  };

  /**
   * 添加关键词到维度
   */
  const addKeywordToDimension = (dimensionId: string, keyword: string) => {
    if (!keyword.trim()) return;
    
    setBrandDimensions(prev => prev.map(d => {
      if (d.id === dimensionId) {
        const newKeywords = [...d.keywords, keyword.trim()];
        const newValue = d.value ? `${d.value}、${keyword.trim()}` : keyword.trim();
        return { ...d, keywords: newKeywords, value: newValue };
      }
      return d;
    }));
  };

  /**
   * 删除维度关键词
   */
  const removeKeywordFromDimension = (dimensionId: string, keyword: string) => {
    setBrandDimensions(prev => prev.map(d => {
      if (d.id === dimensionId) {
        const newKeywords = d.keywords.filter(k => k !== keyword);
        const newValue = newKeywords.join('、');
        return { ...d, keywords: newKeywords, value: newValue };
      }
      return d;
    }));
  };

  /**
   * 保存品牌语料库
   */
  const saveBrandDimensions = () => {
    // 验证必填项
    const requiredDimensions = brandDimensions.filter(d => d.isRequired);
    const emptyRequired = requiredDimensions.filter(d => !d.value.trim());
    
    if (emptyRequired.length > 0) {
      toast({
        title: "请完善必填信息",
        description: `请填写：${emptyRequired.map(d => d.title).join('、')}`,
        variant: "destructive"
      });
      return;
    }

    // 保存到本地存储
    localStorage.setItem('brandDimensions', JSON.stringify(brandDimensions));
    
    toast({
      title: "保存成功",
      description: "品牌语料库已保存",
    });
  };

  /**
   * 获取维度分类
   */
  const getDimensionsByCategory = (category: string) => {
    return brandDimensions.filter(d => d.category === category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PageNavigation
        title="多维品牌语料库"
        description="AI智能分析品牌资料，自动构建完整的品牌语料库，支持多维度自定义完善"
        showAdaptButton={false}
        actions={
          <>
            <Button 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? '上传中...' : '上传资料'}
            </Button>
            <Button 
              onClick={handleProcessAssets}
              disabled={isProcessing || brandAssets.length === 0}
            >
              <Brain className="h-4 w-4 mr-2" />
              {isProcessing ? 'AI分析中...' : 'AI分析'}
            </Button>
            <Button onClick={saveBrandDimensions}>
              <Save className="h-4 w-4 mr-2" />
              保存语料库
            </Button>
          </>
        }
      />

      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.bmp,.webp,.xls,.xlsx,.ppt,.pptx"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* 上传进度 */}
        {isUploading && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">上传进度</span>
                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </CardContent>
          </Card>
        )}

        {/* AI分析进度 */}
        {isProcessing && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">AI分析进度</span>
                <span className="text-sm text-muted-foreground">{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                AI正在分析品牌资料，自动补充语料库内容...
              </p>
            </CardContent>
          </Card>
        )}

        {/* 提示信息 */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>使用提示：</strong>上传品牌资料越多，AI分析越准确。建议上传品牌手册、产品介绍、营销文案等资料。
            所有维度都支持手动编辑，AI会自动补充关键词建议。
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dimensions">品牌语料库</TabsTrigger>
            <TabsTrigger value="assets">资料管理</TabsTrigger>
            <TabsTrigger value="analysis">AI分析</TabsTrigger>
          </TabsList>

          {/* 品牌语料库维度 */}
          <TabsContent value="dimensions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 基础信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    基础信息
                  </CardTitle>
                  <CardDescription>品牌的基本信息和定位</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getDimensionsByCategory('basic').map((dimension) => (
                    <DimensionForm
                      key={dimension.id}
                      dimension={dimension}
                      onUpdate={updateDimension}
                      onAddKeyword={addKeywordToDimension}
                      onRemoveKeyword={removeKeywordFromDimension}
                      isEditing={editingDimension === dimension.id}
                      onEdit={() => setEditingDimension(dimension.id)}
                      onCancel={() => setEditingDimension(null)}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* 品牌身份 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    品牌身份
                  </CardTitle>
                  <CardDescription>品牌的核心价值观和使命愿景</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getDimensionsByCategory('identity').map((dimension) => (
                    <DimensionForm
                      key={dimension.id}
                      dimension={dimension}
                      onUpdate={updateDimension}
                      onAddKeyword={addKeywordToDimension}
                      onRemoveKeyword={removeKeywordFromDimension}
                      isEditing={editingDimension === dimension.id}
                      onEdit={() => setEditingDimension(dimension.id)}
                      onCancel={() => setEditingDimension(null)}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* 内容策略 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                    内容策略
                  </CardTitle>
                  <CardDescription>品牌内容创作的核心要素</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getDimensionsByCategory('content').map((dimension) => (
                    <DimensionForm
                      key={dimension.id}
                      dimension={dimension}
                      onUpdate={updateDimension}
                      onAddKeyword={addKeywordToDimension}
                      onRemoveKeyword={removeKeywordFromDimension}
                      isEditing={editingDimension === dimension.id}
                      onEdit={() => setEditingDimension(dimension.id)}
                      onCancel={() => setEditingDimension(null)}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* 语调风格 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-orange-600" />
                    语调风格
                  </CardTitle>
                  <CardDescription>品牌的语音特征和表达方式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getDimensionsByCategory('voice').map((dimension) => (
                    <DimensionForm
                      key={dimension.id}
                      dimension={dimension}
                      onUpdate={updateDimension}
                      onAddKeyword={addKeywordToDimension}
                      onRemoveKeyword={removeKeywordFromDimension}
                      isEditing={editingDimension === dimension.id}
                      onEdit={() => setEditingDimension(dimension.id)}
                      onCancel={() => setEditingDimension(null)}
                    />
                  ))}
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
                {brandAssets.length === 0 ? (
                  <div className="text-center py-8">
                    <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无品牌资料，请上传文件开始构建语料库</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {brandAssets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {asset.fileIcon}
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-sm text-gray-500">
                              {asset.uploadDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {asset.processingStatus === 'pending' && (
                            <Badge variant="secondary">待处理</Badge>
                          )}
                          {asset.processingStatus === 'processing' && (
                            <Badge variant="outline">处理中</Badge>
                          )}
                          {asset.processingStatus === 'completed' && (
                            <Badge variant="default">已完成</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsAssetDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI分析 */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI分析结果</CardTitle>
                <CardDescription>基于上传资料生成的AI分析报告</CardDescription>
              </CardHeader>
              <CardContent>
                {brandProfile?.aiAnalysis ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">语调分析</h4>
                        <p className="text-sm text-gray-600">{brandProfile.aiAnalysis.toneAnalysis}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">品牌个性</h4>
                        <p className="text-sm text-gray-600">{brandProfile.aiAnalysis.brandPersonality}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">目标受众</h4>
                        <p className="text-sm text-gray-600">{brandProfile.aiAnalysis.targetAudience}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">核心主题</h4>
                        <div className="flex flex-wrap gap-1">
                          {brandProfile.aiAnalysis.keyThemes.map((theme, index) => (
                            <Badge key={index} variant="outline">{theme}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">内容建议</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {brandProfile.aiAnalysis.contentSuggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无AI分析结果，请上传资料并进行分析</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 资料详情弹窗 */}
      <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>资料详情</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {selectedAsset.fileIcon}
                <div>
                  <p className="font-medium">{selectedAsset.name}</p>
                  <p className="text-sm text-gray-500">
                    上传时间：{selectedAsset.uploadDate.toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedAsset.content && (
                <div>
                  <h4 className="font-semibold mb-2">提取内容</h4>
                  <p className="text-sm text-gray-600">{selectedAsset.content}</p>
                </div>
              )}
              {selectedAsset.extractedKeywords && selectedAsset.extractedKeywords.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">提取关键词</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedAsset.extractedKeywords.map((keyword, index) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * 维度表单组件
 */
interface DimensionFormProps {
  dimension: BrandDimension;
  onUpdate: (id: string, value: string) => void;
  onAddKeyword: (dimensionId: string, keyword: string) => void;
  onRemoveKeyword: (dimensionId: string, keyword: string) => void;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

function DimensionForm({
  dimension,
  onUpdate,
  onAddKeyword,
  onRemoveKeyword,
  isEditing,
  onEdit,
  onCancel
}: DimensionFormProps) {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      onAddKeyword(dimension.id, newKeyword);
      setNewKeyword('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {dimension.icon}
          <div>
            <Label className="text-sm font-medium">
              {dimension.title}
              {dimension.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <p className="text-xs text-gray-500">{dimension.description}</p>
          </div>
        </div>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            placeholder={dimension.placeholder}
            value={dimension.value}
            onChange={(e) => onUpdate(dimension.id, e.target.value)}
            className="min-h-[80px]"
          />
          
          {/* 关键词管理 */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">关键词</Label>
            <div className="flex gap-2">
              <Input
                placeholder="添加关键词..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddKeyword}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {dimension.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {dimension.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => onRemoveKeyword(dimension.id, keyword)}
                  >
                    {keyword} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 rounded-md">
          {dimension.value ? (
            <p className="text-sm">{dimension.value}</p>
          ) : (
            <p className="text-sm text-gray-400">暂无内容</p>
          )}
          {dimension.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {dimension.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
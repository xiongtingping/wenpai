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
  TrendingUp, Users2, Package, Share2, MoreHorizontal,
  Loader2
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageNavigation from '@/components/layout/PageNavigation';
import BrandProfileGenerator from '@/components/creative/BrandProfileGenerator';
import BrandProfileViewer from '@/components/creative/BrandProfileViewer';
import { BrandProfile, BrandAsset } from '@/types/brand';
import AIAnalysisService from '@/services/aiAnalysisService';

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
 * 排序选项类型
 */
type SortOption = 'date-new' | 'date-old' | 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc';

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
  const [selectedCategory, setSelectedCategory] = useState('品牌资料');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  
  // 预设的分类选项
  const categoryOptions = [
    '品牌资料',
    '产品介绍',
    '营销素材',
    '用户反馈',
    '竞品分析',
    '行业报告',
    '其他'
  ];
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null);
  const [editingDimension, setEditingDimension] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date-new');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isEditingAsset, setIsEditingAsset] = useState<string | null>(null);
  const [editingAssetName, setEditingAssetName] = useState('');
  const [editingAssetDescription, setEditingAssetDescription] = useState('');
  const [editingAssetCategory, setEditingAssetCategory] = useState('');
  const [isViewingAsset, setIsViewingAsset] = useState<string | null>(null);
  const [isAnalyzingAsset, setIsAnalyzingAsset] = useState<string | null>(null);
  const [assetViewerContent, setAssetViewerContent] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 可用的文件分类
  const categories = ["品牌手册", "文案指南", "产品介绍", "营销素材", "新闻稿", "企业介绍", "VI规范", "品牌故事"];
  
  // 品牌语料库维度定义
  const [brandDimensions, setBrandDimensions] = useState<BrandDimension[]>([
    {
      id: 'brandName',
      title: '品牌名称',
      description: '品牌的名字',
      icon: <Target className="h-4 w-4" />,
      placeholder: '请输入您的品牌名称...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'basic'
    },
    {
      id: 'brandDescription',
      title: '品牌描述',
      description: '简要描述品牌定位和特色',
      icon: <FileText className="h-4 w-4" />,
      placeholder: '请描述您的品牌定位、特色和核心价值...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'basic'
    },
    {
      id: 'brandSlogan',
      title: '品牌Slogan',
      description: '品牌的口号',
      icon: <MessageSquare className="h-4 w-4" />,
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
      icon: <Heart className="h-4 w-4" />,
      placeholder: '请描述您的品牌价值观和基本原则...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'identity'
    },
    {
      id: 'brandVision',
      title: '品牌愿景与使命',
      description: '你的品牌存在的根本原因是什么？长期目标是什么？',
      icon: <Target className="h-4 w-4" />,
      placeholder: '请描述您的品牌愿景、使命和长期目标...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'identity'
    },
    {
      id: 'brandStory',
      title: '品牌故事',
      description: '品牌起源故事',
      icon: <BookOpen className="h-4 w-4" />,
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
      icon: <Zap className="h-4 w-4" />,
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
      icon: <Package className="h-4 w-4" />,
      placeholder: '请列出描述您产品的核心关键词...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'content'
    },
    {
      id: 'brandTone',
      title: '品牌语调/语气',
      description: '包括语言风格、语气、情感倾向（如正式、友好、幽默、专业等）',
      icon: <Palette className="h-4 w-4" />,
      placeholder: '请描述您的品牌语调、语气和语言风格...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'voice'
    },
    {
      id: 'brandPersonality',
      title: '品牌个性',
      description: '如果你的品牌是一个人，它会是什么样的性格？',
      icon: <Users2 className="h-4 w-4" />,
      placeholder: '请描述您的品牌个性特征...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'voice'
    },
    {
      id: 'coreTopics',
      title: '品牌核心话题',
      description: '品牌内容的核心主题和指引方向',
      icon: <TrendingUp className="h-4 w-4" />,
      placeholder: '请列出您的品牌核心话题和内容方向...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'content'
    },
    {
      id: 'brandHashtags',
      title: '品牌Hashtags',
      description: '以#话题的形式，在品牌内容结尾出现，推荐用户使用这些',
      icon: <Hash className="h-4 w-4" />,
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
      icon: <Tag className="h-4 w-4" />,
      placeholder: '请列出您的品牌关键词...',
      value: '',
      keywords: [],
      isRequired: false,
      category: 'content'
    },
    {
      id: 'forbiddenWords',
      title: '品牌禁用词',
      description: '禁止在品牌内容中出现的词',
      icon: <Shield className="h-4 w-4" />,
      placeholder: '请列出您的品牌禁用词...',
      value: '',
      keywords: [],
      isRequired: false,
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
      
      // 使用用户选择的分类
      let category = selectedCategory;
      
      try {
        // 读取文件内容
        const aiService = AIAnalysisService.getInstance();
        let fileContent = '';
        
        if (aiService.isFileTypeSupported(file)) {
          fileContent = await aiService.readFileContent(file);
          console.log(`文件 ${file.name} 内容长度:`, fileContent.length);
        } else {
          fileContent = `不支持的文件类型: ${file.type}`;
        }
        
        // 创建资产对象
      const asset: BrandAsset = {
        id: `asset-${Date.now()}-${i}`,
        name: file.name,
          type: 'document',
          content: fileContent,
        uploadDate: new Date(),
        fileIcon,
        description: '',
          category: category,
        processingStatus: 'pending'
      };
      
      newAssets.push(asset);
      
      } catch (error) {
        console.error(`读取文件 ${file.name} 失败:`, error);
        
        // 创建资产对象（内容为空）
        const asset: BrandAsset = {
          id: `asset-${Date.now()}-${i}`,
          name: file.name,
          type: 'document',
          content: `文件读取失败: ${error instanceof Error ? error.message : '未知错误'}`,
          uploadDate: new Date(),
          fileIcon,
          description: '',
          category: category,
          processingStatus: 'failed'
        };
        
        newAssets.push(asset);
      }
      
      // 更新上传进度
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
      description: `已成功上传 ${newAssets.length} 个品牌资料文件，AI正在自动分析...`,
    });

    // 自动开始AI分析
    setTimeout(() => {
      handleProcessAssets();
    }, 1000);

    // 自动开始AI分析
    setTimeout(() => {
      handleProcessAssets();
    }, 1000);
  };

  /**
   * 查看资料内容
   */
  const handleViewAsset = async (asset: BrandAsset) => {
    setIsViewingAsset(asset.id);
    
    try {
      // 显示原始文件内容，而不是AI分析结果
      const content = `文件名称：${asset.name}\n文件大小：${asset.size || '未知'} KB\n上传时间：${asset.uploadDate.toLocaleString()}\n文件类型：${asset.type}\n\n原始内容：\n${asset.content || '暂无内容'}`;
      setAssetViewerContent(content);
    } catch (error) {
      console.error('读取文件失败:', error);
      setAssetViewerContent('无法读取文件内容');
    }
  };

  /**
   * 处理单个资料的AI分析
   */
  const handleAnalyzeSingleAsset = async (asset: BrandAsset) => {
    setIsAnalyzingAsset(asset.id);
    
    try {
      // 更新处理状态
      setBrandAssets(prev => prev.map(a => 
        a.id === asset.id 
          ? { ...a, processingStatus: 'processing' as const }
          : a
      ));

      // 调用真正的AI分析服务
      const aiService = AIAnalysisService.getInstance();
      
      // 直接使用内容进行分析，不需要创建文件对象
      
      // 调用AI分析
      const analysisResult = await aiService.analyzeBrandContent(asset.content || '品牌资料内容');
      
      // 构建分析结果
      const extractedContent = `AI分析结果：\n\n1. 品牌关键词：${analysisResult.brandKeywords?.join('、') || analysisResult.keywords.join('、')}\n2. 产品关键词：${analysisResult.productKeywords?.join('、') || ''}\n3. 目标受众：${analysisResult.targetAudience?.join('、') || ''}\n4. 品牌故事：${analysisResult.brandStory?.join('、') || ''}\n5. 竞争优势：${analysisResult.competitiveAdvantage?.join('、') || ''}\n6. 品牌语气特征：${analysisResult.tone}\n7. 内容建议：${analysisResult.suggestions.join('、')}`;
      
      // 合并所有关键词用于向后兼容
      const allKeywords = [
        ...(analysisResult.brandKeywords || []),
        ...(analysisResult.productKeywords || []),
        ...(analysisResult.targetAudience || []),
        ...(analysisResult.brandStory || []),
        ...(analysisResult.competitiveAdvantage || [])
      ];

      // 更新资产数据
      setBrandAssets(prev => prev.map(a => 
        a.id === asset.id 
          ? { 
              ...a, 
              content: extractedContent,
              extractedKeywords: allKeywords,
              processingStatus: 'completed' as const
            }
          : a
      ));

      // 自动补充语料库维度
      updateBrandDimensionsWithMultiDimension(analysisResult, extractedContent);

      toast({
        title: "AI分析完成",
        description: `已成功分析 ${asset.name}，并补充到品牌语料库`,
      });

    } catch (error) {
      console.error('AI分析失败:', error);
      setBrandAssets(prev => prev.map(a => 
        a.id === asset.id 
          ? { ...a, processingStatus: 'failed' as const }
          : a
      ));
      
      toast({
        title: "AI分析失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingAsset(null);
    }
  };

  /**
   * 批量处理品牌资料AI分析
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

    try {
      const aiService = AIAnalysisService.getInstance();

    for (let i = 0; i < unprocessedAssets.length; i++) {
      const asset = unprocessedAssets[i];
      
        // 更新处理状态
      setBrandAssets(prev => prev.map(a => 
        a.id === asset.id 
          ? { ...a, processingStatus: 'processing' as const }
          : a
      ));

        try {
                  // 调用AI分析
        const analysisResult = await aiService.analyzeBrandContent(asset.content || '品牌资料内容');
        
        // 构建分析结果
        const extractedContent = `AI分析结果：\n\n1. 品牌关键词：${analysisResult.brandKeywords?.join('、') || analysisResult.keywords.join('、')}\n2. 产品关键词：${analysisResult.productKeywords?.join('、') || ''}\n3. 目标受众：${analysisResult.targetAudience?.join('、') || ''}\n4. 品牌故事：${analysisResult.brandStory?.join('、') || ''}\n5. 竞争优势：${analysisResult.competitiveAdvantage?.join('、') || ''}\n6. 品牌语气特征：${analysisResult.tone}\n7. 内容建议：${analysisResult.suggestions.join('、')}`;
        
        // 合并所有关键词用于向后兼容
        const allKeywords = [
          ...(analysisResult.brandKeywords || []),
          ...(analysisResult.productKeywords || []),
          ...(analysisResult.targetAudience || []),
          ...(analysisResult.brandStory || []),
          ...(analysisResult.competitiveAdvantage || [])
        ];

        // 更新资产数据
      setBrandAssets(prev => prev.map(a => 
        a.id === asset.id 
          ? { 
              ...a, 
                content: extractedContent,
                extractedKeywords: allKeywords,
              processingStatus: 'completed' as const
            }
          : a
      ));

        // 自动补充语料库维度
        updateBrandDimensionsWithMultiDimension(analysisResult, extractedContent);

        } catch (error) {
          console.error(`分析 ${asset.name} 失败:`, error);
          setBrandAssets(prev => prev.map(a => 
            a.id === asset.id 
              ? { ...a, processingStatus: 'failed' as const }
              : a
          ));
        }

      setProcessingProgress(((i + 1) / unprocessedAssets.length) * 100);
    }

      toast({
        title: "批量AI分析完成",
        description: "已自动分析所有品牌资料并补充语料库",
      });

    } catch (error) {
      console.error('批量AI分析失败:', error);
      toast({
        title: "批量AI分析失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      });
    } finally {
    setIsProcessing(false);
    setProcessingProgress(0);
    }
  };

  /**
   * 根据AI分析结果更新品牌维度（多维度版本）
   */
  const updateBrandDimensionsWithMultiDimension = (analysisResult: any, content: string) => {
    setBrandDimensions(prev => prev.map(dimension => {
      // 根据维度类型和关键词自动补充内容
      let newValue = dimension.value;
      let newKeywords = [...dimension.keywords];

      switch (dimension.id) {
        case 'brandKeywords':
          if (dimension.value === '') {
            const brandKeywords = analysisResult.brandKeywords || analysisResult.keywords || [];
            if (brandKeywords.length > 0) {
              newValue = brandKeywords.join('、');
              newKeywords = [...dimension.keywords, ...brandKeywords];
            }
          }
          break;
        case 'productKeywords':
          if (dimension.value === '') {
            const productKeywords = analysisResult.productKeywords || [];
            if (productKeywords.length > 0) {
              newValue = productKeywords.join('、');
              newKeywords = productKeywords;
            }
          }
          break;
        case 'targetAudience':
          if (dimension.value === '') {
            const audienceKeywords = analysisResult.targetAudience || [];
            if (audienceKeywords.length > 0) {
              newValue = audienceKeywords.join('、');
              newKeywords = audienceKeywords;
            }
          }
          break;
        case 'brandStory':
          if (dimension.value === '') {
            const storyKeywords = analysisResult.brandStory || [];
            if (storyKeywords.length > 0) {
              newValue = storyKeywords.join('、');
              newKeywords = storyKeywords;
            }
          }
          break;
        case 'competitiveAdvantage':
          if (dimension.value === '') {
            const advantageKeywords = analysisResult.competitiveAdvantage || [];
            if (advantageKeywords.length > 0) {
              newValue = advantageKeywords.join('、');
              newKeywords = advantageKeywords;
            }
          }
          break;
        case 'brandDescription':
          if (dimension.value === '') {
            newValue = content.substring(0, 200) + '...';
          }
          break;
        case 'brandTone':
          if (dimension.value === '') {
            newValue = analysisResult.tone || '专业、可靠、创新';
          }
          break;
        case 'brandPersonality':
          if (dimension.value === '') {
            newValue = '专业可靠、用户友好、创新引领';
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
   * 根据AI分析结果更新品牌维度（向后兼容版本）
   */
  const updateBrandDimensions = (keywords: string[], content: string) => {
    setBrandDimensions(prev => prev.map(dimension => {
      // 根据维度类型和关键词自动补充内容
      let newValue = dimension.value;
      let newKeywords = [...dimension.keywords];

      switch (dimension.id) {
        case 'brandKeywords':
          if (dimension.value === '') {
            // 品牌关键词：提取品牌核心概念、价值主张、品牌定位相关的词汇
            const brandKeywords = keywords.filter(k => 
              k.length > 1 && 
              !dimension.keywords.includes(k) &&
              (k.includes('品牌') || k.includes('价值') || k.includes('理念') || 
               k.includes('定位') || k.includes('使命') || k.includes('愿景') ||
               k.includes('文化') || k.includes('精神') || k.includes('传承') ||
               k.includes('创新') || k.includes('专业') || k.includes('可靠') ||
               k.includes('品质') || k.includes('服务') || k.includes('体验'))
            );
            if (brandKeywords.length > 0) {
              newValue = brandKeywords.join('、');
              newKeywords = [...dimension.keywords, ...brandKeywords];
            }
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
            // 产品关键词：提取具体产品特征、功能、材质、技术相关的词汇
            const productKeywords = keywords.filter(k => 
              k.length > 1 && 
              !dimension.keywords.includes(k) &&
              !['品牌', '价值', '理念', '目标', '专业', '创新', '用户', '服务', '体验'].includes(k) &&
              (k.includes('产品') || k.includes('功能') || k.includes('技术') || 
               k.includes('材质') || k.includes('设计') || k.includes('工艺') ||
               k.includes('性能') || k.includes('质量') || k.includes('规格') ||
               k.includes('型号') || k.includes('系列') || k.includes('版本') ||
               k.includes('升级') || k.includes('优化') || k.includes('改进') ||
               k.includes('特色') || k.includes('优势') || k.includes('特点'))
            );
            if (productKeywords.length > 0) {
              newValue = productKeywords.join('、');
              newKeywords = productKeywords;
            }
          }
          break;
        case 'targetAudience':
          if (dimension.value === '') {
            // 目标受众：提取用户群体、市场定位相关的词汇
            const audienceKeywords = keywords.filter(k => 
              k.length > 1 && 
              !dimension.keywords.includes(k) &&
              (k.includes('用户') || k.includes('客户') || k.includes('消费者') || 
               k.includes('人群') || k.includes('群体') || k.includes('市场') ||
               k.includes('年龄') || k.includes('性别') || k.includes('职业') ||
               k.includes('收入') || k.includes('地域') || k.includes('偏好') ||
               k.includes('需求') || k.includes('痛点') || k.includes('场景'))
            );
            if (audienceKeywords.length > 0) {
              newValue = audienceKeywords.join('、');
              newKeywords = audienceKeywords;
            }
          }
          break;
        case 'brandStory':
          if (dimension.value === '') {
            // 品牌故事：提取历史、文化、情感相关的词汇
            const storyKeywords = keywords.filter(k => 
              k.length > 1 && 
              !dimension.keywords.includes(k) &&
              (k.includes('历史') || k.includes('文化') || k.includes('传承') || 
               k.includes('故事') || k.includes('情感') || k.includes('记忆') ||
               k.includes('传统') || k.includes('经典') || k.includes('情怀') ||
               k.includes('回忆') || k.includes('时光') || k.includes('岁月') ||
               k.includes('初心') || k.includes('使命') || k.includes('愿景'))
            );
            if (storyKeywords.length > 0) {
              newValue = storyKeywords.join('、');
              newKeywords = storyKeywords;
            }
          }
          break;
        case 'competitiveAdvantage':
          if (dimension.value === '') {
            // 竞争优势：提取差异化、优势、特色相关的词汇
            const advantageKeywords = keywords.filter(k => 
              k.length > 1 && 
              !dimension.keywords.includes(k) &&
              (k.includes('优势') || k.includes('特色') || k.includes('差异化') || 
               k.includes('独特') || k.includes('领先') || k.includes('第一') ||
               k.includes('首创') || k.includes('专利') || k.includes('技术') ||
               k.includes('创新') || k.includes('突破') || k.includes('革命') ||
               k.includes('颠覆') || k.includes('改变') || k.includes('提升'))
            );
            if (advantageKeywords.length > 0) {
              newValue = advantageKeywords.join('、');
              newKeywords = advantageKeywords;
            }
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
    // 移除必填项验证
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

  /**
   * 删除资产
   */
  const handleDeleteAsset = (assetId: string) => {
    setBrandAssets(prev => prev.filter(asset => asset.id !== assetId));
    toast({
      title: "删除成功",
      description: "品牌资料已删除",
    });
  };

  /**
   * 编辑资产
   */
  const handleEditAsset = (asset: BrandAsset) => {
    setSelectedAsset(asset);
    setEditingAssetName(asset.name);
    setEditingAssetDescription(asset.description || '');
    setEditingAssetCategory(asset.category || '品牌资料');
    setIsEditingAsset(asset.id);
  };

  /**
   * 保存资产编辑
   */
  const handleSaveAssetEdit = () => {
    if (!selectedAsset) return;
    
    setBrandAssets(prev => prev.map(asset => 
      asset.id === selectedAsset.id 
        ? { 
            ...asset, 
            name: editingAssetName, 
            description: editingAssetDescription,
            category: editingAssetCategory
          }
        : asset
    ));
    
    setIsEditingAsset(null);
    setSelectedAsset(null);
    setEditingAssetName('');
    setEditingAssetDescription('');
    setEditingAssetCategory('');
    
    toast({
      title: "保存成功",
      description: "品牌资料信息已更新",
    });
  };

  /**
   * 分享资产
   */
  const handleShareAsset = (asset: BrandAsset) => {
    // 生成分享链接
    const shareUrl = `${window.location.origin}/brand-asset/${asset.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "分享链接已复制",
      description: "分享链接已复制到剪贴板",
    });
  };

  /**
   * 切换分类选择
   */
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  /**
   * 获取排序选项显示名称
   */
  const getSortOptionName = (option: SortOption): string => {
    switch (option) {
      case 'date-new': return '最新上传';
      case 'date-old': return '最早上传';
      case 'name-asc': return '名称 A-Z';
      case 'name-desc': return '名称 Z-A';
      case 'size-asc': return '大小（小到大）';
      case 'size-desc': return '大小（大到小）';
      default: return '最新上传';
    }
  };

  /**
   * 过滤和排序资产
   */
  const filteredAndSortedAssets = brandAssets
    .filter(asset => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return asset.name.toLowerCase().includes(query) || 
               asset.description?.toLowerCase().includes(query) ||
               asset.category?.toLowerCase().includes(query);
      }
      if (selectedCategories.length > 0) {
        return asset.category && selectedCategories.includes(asset.category);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'date-new':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'date-old':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-asc':
          return parseFloat(a.size || '0') - parseFloat(b.size || '0');
        case 'size-desc':
          return parseFloat(b.size || '0') - parseFloat(a.size || '0');
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PageNavigation
        title="多维品牌语料库"
        description="AI智能分析品牌资料，自动构建完整的品牌语料库，支持多维度自定义完善"
        showAdaptButton={false}
        showUpgradeButton={true}
      />

            <div className="container mx-auto px-4 py-8">

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dimensions">品牌语料库</TabsTrigger>
            <TabsTrigger value="assets">资料管理</TabsTrigger>
          </TabsList>

          {/* 品牌语料库维度 */}
          <TabsContent value="dimensions" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={saveBrandDimensions}>
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

              {/* 品牌身份 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
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
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
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
                {/* 上传和AI分析按钮 */}
                <div className="flex gap-2 mb-4 items-center">
                  {/* 分类选择器 */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">分类：</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                    {isProcessing ? 'AI分析中...' : '批量AI分析'}
                  </Button>
                </div>

                {/* 文件格式说明 */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-2">支持的文件格式</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>文档：PDF, DOC, DOCX, TXT, MD</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileImage className="h-4 w-4 text-green-600" />
                          <span>图片：JPG, PNG, GIF, BMP, WEBP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-red-600" />
                          <span>表格：XLS, XLSX</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span>演示：PPT, PPTX</span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        <strong>注意：</strong>单个文件大小建议不超过10MB，支持批量上传多个文件。AI将自动分析文件内容并提取品牌相关信息。
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 搜索和筛选 */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="搜索资料..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                  </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="排序方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-new">最新上传</SelectItem>
                        <SelectItem value="date-old">最早上传</SelectItem>
                        <SelectItem value="name-asc">名称 A-Z</SelectItem>
                        <SelectItem value="name-desc">名称 Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[120px]">
                          <Filter className="h-4 w-4 mr-2" />
                          分类
                      </Button>
                    </PopoverTrigger>
                      <PopoverContent className="w-48">
                      <Command>
                          <CommandInput placeholder="搜索分类..." />
                        <CommandList>
                          <CommandEmpty>未找到分类</CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => (
                              <CommandItem 
                                key={category} 
                                onSelect={() => toggleCategory(category)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedCategories.includes(category)}
                                      onChange={() => {}}
                                      className="h-4 w-4"
                                    />
                                    <span>{category}</span>
                                  </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

                {brandAssets.length === 0 ? (
                  <div className="text-center py-8">
                    <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无品牌资料，请上传文件开始构建语料库</p>
                    </div>
                  ) : (
                  <div className="space-y-4">
                      {filteredAndSortedAssets.map((asset) => (
                      <div 
                        key={asset.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleViewAsset(asset)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                                {asset.fileIcon}
                                <div className="flex-1 min-w-0">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{asset.name}</p>
                                {asset.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {asset.category}
                                  </Badge>
                                )}
                                </div>
                              <p className="text-sm text-gray-500">
                                {asset.uploadDate.toLocaleDateString()}
                              </p>
                              {asset.description && (
                                <p className="text-sm text-gray-600 mt-1">{asset.description}</p>
                              )}
                              </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {asset.processingStatus === 'pending' && (
                            <>
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                待分析
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnalyzeSingleAsset(asset);
                                }}
                                disabled={isAnalyzingAsset === asset.id}
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                {isAnalyzingAsset === asset.id ? '分析中...' : 'AI分析'}
                              </Button>
                            </>
                          )}
                          {asset.processingStatus === 'processing' && (
                            <Badge variant="default">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              分析中
                            </Badge>
                          )}
                          {asset.processingStatus === 'completed' && (
                            <Badge variant="default">
                              <Check className="h-3 w-3 mr-1" />
                              已完成
                            </Badge>
                          )}
                          {asset.processingStatus === 'failed' && (
                            <>
                              <Badge variant="destructive">
                                <X className="h-3 w-3 mr-1" />
                                分析失败
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnalyzeSingleAsset(asset);
                                }}
                                disabled={isAnalyzingAsset === asset.id}
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                {isAnalyzingAsset === asset.id ? '分析中...' : '重新分析'}
                              </Button>
                            </>
                          )}
                          
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAsset(asset);
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteAsset(asset.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                              </div>
                      ))}
                    </div>
                  )}
              </CardContent>
            </Card>
                </TabsContent>
              </Tabs>
                </div>

      {/* 资料查看弹窗 */}
      <Dialog open={isViewingAsset !== null} onOpenChange={() => setIsViewingAsset(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
            <DialogTitle>资料内容</DialogTitle>
            </DialogHeader>
              <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[60vh]">
                {assetViewerContent}
              </pre>
                  </div>
                </div>
        </DialogContent>
      </Dialog>

      {/* 资料编辑弹窗 */}
      <Dialog open={isEditingAsset !== null} onOpenChange={() => {
        setIsEditingAsset(null);
        setEditingAssetName('');
        setEditingAssetDescription('');
        setEditingAssetCategory('');
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑资料</DialogTitle>
            <DialogDescription>
              修改资料的基本信息，包括名称、描述和分类
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="asset-name">资料名称</Label>
              <Input
                id="asset-name"
                value={editingAssetName}
                onChange={(e) => setEditingAssetName(e.target.value)}
                placeholder="请输入资料名称"
              />
            </div>
            <div>
              <Label htmlFor="asset-category">分类</Label>
              <Select value={editingAssetCategory} onValueChange={setEditingAssetCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="asset-description">描述</Label>
              <Textarea
                id="asset-description"
                value={editingAssetDescription}
                onChange={(e) => setEditingAssetDescription(e.target.value)}
                placeholder="请输入资料描述（可选）"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditingAsset(null);
              setEditingAssetName('');
              setEditingAssetDescription('');
              setEditingAssetCategory('');
            }}>
              取消
            </Button>
            <Button onClick={handleSaveAssetEdit}>
              保存
            </Button>
          </DialogFooter>
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
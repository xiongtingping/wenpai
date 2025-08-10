/**
 * 修复版品牌语料库页面
 * 解决JSX结构问题
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Database, Upload, FileText, File, FileImage,
  AlertCircle, Info, Search, Check, Clock, Trash2,
  SortAsc, Filter, Download, Eye, Edit, Copy,
  Globe, Users, Target, Zap, Brain, Sparkles, X,
  BookOpen, Palette, MessageSquare, Shield,
  Plus, RotateCcw, Save, FileUp, FolderOpen,
  Tag, Hash, Heart, Star, Lightbulb, Award,
  TrendingUp, Users2, Package, Share2, MoreHorizontal,
  Loader2, CheckCircle, Grid, List, Pin, Ban, AlertTriangle,
  Volume2, MapPin, Layout, CheckSquare
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import PageNavigation from '@/components/layout/PageNavigation';
import BrandProfileGenerator from '@/components/creative/BrandProfileGenerator';
import BrandProfileViewer from '@/components/creative/BrandProfileViewer';
import { PDFChatDialog } from '@/components/creative/PDFChatDialog';
import { BrandProfile, BrandAsset } from '@/types/brand';
import AIAnalysisService from '@/services/aiAnalysisService';
import { WebContentExtractorService, WebExtractionResult } from '@/services/webContentExtractor';
import BrandCorpusService, { BrandCorpus, BrandCorpusExtraction, BrandCorpusSource } from '@/services/brandCorpusService';
import FileFormatSupportService from '@/services/fileFormatSupportService';
import FileFormatDisplay from '@/components/ui/FileFormatDisplay';
import { testDeepSeekAPI, diagnoseAPIIssues } from '@/utils/apiTest';

/**
 * 品牌信息条目接口
 */
interface BrandInfoItem {
  id: string;
  content: string;
  source: string;
  confidence: number;
  isPinned: boolean;
  isBlocked: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  aiGenerated?: boolean; // AI生成的标识
}

/**
 * 品牌语料库维度接口
 */
interface BrandDimension {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  placeholder: string;
  category: string;
  keywords: string[];
  content: string;
  items: BrandInfoItem[]; // 新增：支持多条信息
}

// 系统预定义分类选项
const SYSTEM_CATEGORIES = [
  { value: 'brand-material', label: '品牌资料', description: '品牌手册、VI规范、品牌指南等' },
  { value: 'web-content', label: '网页内容', description: '官网内容、落地页、在线资料等' },
  { value: 'document', label: '文档资料', description: 'PDF、Word、PPT等文档文件' },
  { value: 'image', label: '图片资料', description: '产品图片、宣传图、设计素材等' },
  { value: 'marketing', label: '营销资料', description: '广告文案、营销方案、推广素材等' },
  { value: 'product', label: '产品资料', description: '产品介绍、功能说明、技术文档等' },
  { value: 'legal', label: '法务资料', description: '合同模板、法律条款、合规文件等' },
  { value: 'internal', label: '内部资料', description: '内部培训、流程文档、管理制度等' }
];

export default function BrandLibraryPageFixed() {
  // 基础状态 - 默认显示智能资料管理（上传品牌资料）
  const [activeTab, setActiveTab] = useState<string>('assets');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysisFile, setCurrentAnalysisFile] = useState<string>('');
  const [showBrandProfile, setShowBrandProfile] = useState(false);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [showPDFChat, setShowPDFChat] = useState(false);
  const [selectedPDFAsset, setSelectedPDFAsset] = useState<BrandAsset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('date-new');
  const [showSourceManager, setShowSourceManager] = useState(false);

  // 文件上传相关
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 语料库相关状态
  const [brandDimensions, setBrandDimensions] = useState<BrandDimension[]>([]);
  const [corpusExtractions, setCorpusExtractions] = useState<BrandCorpusExtraction[]>([]);
  const [isExtractingCorpus, setIsExtractingCorpus] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [brandCorpus, setBrandCorpus] = useState<BrandCorpus | null>(null);
  const [isProcessingCorpus, setIsProcessingCorpus] = useState(false);
  const [corpusProcessingProgress, setCorpusProcessingProgress] = useState(0);
  const [analysisAbortController, setAnalysisAbortController] = useState<AbortController | null>(null);

  // 删除确认对话框状态
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    item: BrandInfoItem | null;
    dimensionId: string;
    itemId: string;
  }>({
    isOpen: false,
    item: null,
    dimensionId: '',
    itemId: ''
  });

  // 分析结果对话框状态
  const [analysisResultDialog, setAnalysisResultDialog] = useState<{
    isOpen: boolean;
    asset: BrandAsset | null;
  }>({
    isOpen: false,
    asset: null
  });



  // ✅ FIXED: 2025-08-06 添加后台分析状态管理
  const [backgroundAnalysisQueue, setBackgroundAnalysisQueue] = useState<BrandAsset[]>([]);
  const [isBackgroundAnalysisRunning, setIsBackgroundAnalysisRunning] = useState(false);
  const [editingDimension, setEditingDimension] = useState<string | null>(null);

  // 网页内容提取相关
  const [webUrl, setWebUrl] = useState('');
  const [isExtractingWeb, setIsExtractingWeb] = useState(false);
  const [isWebExtractOpen, setIsWebExtractOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // PDF对话相关
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<BrandAsset | null>(null);

  // 视图模式
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // 弹窗状态管理
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<BrandAsset | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<BrandAsset | null>(null);
  const [newCategory, setNewCategory] = useState('');

  // 批量操作状态
  const [selectedAssetsForBatch, setSelectedAssetsForBatch] = useState<Set<string>>(new Set());
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // 过滤和排序后的资产列表
  const filteredAndSortedAssets = brandAssets
    .filter(asset => {
      // 搜索过滤
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 分类过滤
      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.some(cat => asset.category === cat || asset.type === cat);

      return matchesSearch && matchesCategory;
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
        case 'size-large':
          return parseFloat(b.size.replace(' KB', '')) - parseFloat(a.size.replace(' KB', ''));
        case 'size-small':
          return parseFloat(a.size.replace(' KB', '')) - parseFloat(b.size.replace(' KB', ''));
        default:
          return 0;
      }
    });

  // 服务实例
  const aiService = AIAnalysisService.getInstance();
  const webExtractor = WebContentExtractorService.getInstance();
  const corpusService = BrandCorpusService.getInstance();

  // 检查API配置
  useEffect(() => {
    const checkAPIConfig = async () => {
      try {
        const { getAPIConfig } = await import('@/config/apiConfig');
        const config = getAPIConfig();

        if (!config.deepseek.apiKey || config.deepseek.apiKey === 'your_deepseek_key_here') {
          toast({
            title: "AI服务配置提醒",
            description: "DeepSeek API密钥未配置，AI分析功能将无法使用。请在.env文件中设置VITE_DEEPSEEK_API_KEY",
            variant: "default",
            duration: 8000,
          });
        }
      } catch (error) {
        console.error('API配置检查失败:', error);
      }
    };

    checkAPIConfig();
  }, []);

  // 初始化示例数据已删除 - 保持空状态，等待用户上传

  // 根据维度ID获取对应的图标
  const getIconForDimension = (dimensionId: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      'brand-name': <Tag className="h-4 w-4" />,
      'brand-description': <FileText className="h-4 w-4" />,
      'brand-mission': <Target className="h-4 w-4" />,
      'brand-values': <Heart className="h-4 w-4" />,
      'brand-tone': <MessageSquare className="h-4 w-4" />,
      'brand-personality': <Users className="h-4 w-4" />,
      'brand-voice': <Volume2 className="h-4 w-4" />,
      'brand-style': <Palette className="h-4 w-4" />,
      'brand-positioning': <MapPin className="h-4 w-4" />,
      'brand-audience': <Users className="h-4 w-4" />,
      'brand-differentiation': <Star className="h-4 w-4" />,
      'brand-promise': <Shield className="h-4 w-4" />,
      'content-themes': <BookOpen className="h-4 w-4" />,
      'content-formats': <Layout className="h-4 w-4" />,
      'content-guidelines': <CheckSquare className="h-4 w-4" />,
      'content-examples': <Lightbulb className="h-4 w-4" />
    };

    return iconMap[dimensionId] || <FileText className="h-4 w-4" />;
  };

  // 初始化品牌维度
  useEffect(() => {
    // 清除可能有问题的localStorage数据
    const clearCorruptedData = () => {
      try {
        const saved = localStorage.getItem('brandDimensions');
        if (saved) {
          const parsed = JSON.parse(saved);
          // 检查是否有序列化的JSX对象
          const hasCorruptedData = parsed.some((dim: any) =>
            dim.icon && typeof dim.icon === 'object' && dim.icon.type
          );
          if (hasCorruptedData) {
            console.log('🧹 检测到损坏的localStorage数据，正在清除...');
            localStorage.removeItem('brandDimensions');
            localStorage.removeItem('brandDimensionsTimestamp');
          }
        }
      } catch (error) {
        console.log('🧹 清除localStorage数据时出错，移除所有相关数据');
        localStorage.removeItem('brandDimensions');
        localStorage.removeItem('brandDimensionsTimestamp');
      }
    };

    clearCorruptedData();

    const initializeDimensions = () => {
      const dimensions: BrandDimension[] = [
        // 基础信息
        {
          id: 'brand-name',
          title: '品牌名称',
          description: '品牌的正式名称、简称、英文名等',
          icon: <Tag className="h-4 w-4" />,
          placeholder: '请输入品牌的正式名称、简称、英文名等...',
          category: 'basic',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'brand-description',
          title: '品牌描述',
          description: '品牌的基本介绍和核心定位',
          icon: <FileText className="h-4 w-4" />,
          placeholder: '请描述品牌的基本情况、核心定位、主要业务等...',
          category: 'basic',
          keywords: [],
          content: '',
          items: []
        },
        // 语调风格
        {
          id: 'brand-tone',
          title: '品牌语调/语气',
          description: '品牌的沟通语调和表达风格',
          icon: <MessageSquare className="h-4 w-4" />,
          placeholder: '请描述品牌的语调特点，如：专业严谨、亲切友好、活泼幽默等...',
          category: 'voice',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'brand-personality',
          title: '品牌个性',
          description: '品牌的性格特征和人格化特点',
          icon: <Heart className="h-4 w-4" />,
          placeholder: '请描述品牌的个性特征，如：创新进取、稳重可靠、年轻时尚等...',
          category: 'voice',
          keywords: [],
          content: '',
          items: []
        },
        // 品牌身份
        {
          id: 'brand-slogan',
          title: '品牌Slogan',
          description: '品牌的核心口号和标语',
          icon: <Hash className="h-4 w-4" />,
          placeholder: '请输入品牌的主要Slogan、口号、标语等...',
          category: 'identity',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'brand-values',
          title: '品牌价值观',
          description: '品牌坚持的核心价值观念',
          icon: <Star className="h-4 w-4" />,
          placeholder: '请描述品牌的核心价值观、理念、原则等...',
          category: 'identity',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'brand-vision-mission',
          title: '品牌愿景与使命',
          description: '品牌的长远愿景和使命目标',
          icon: <Target className="h-4 w-4" />,
          placeholder: '请描述品牌的愿景目标、使命责任、发展方向等...',
          category: 'identity',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'brand-story',
          title: '品牌故事',
          description: '品牌的发展历程和核心故事',
          icon: <BookOpen className="h-4 w-4" />,
          placeholder: '请描述品牌的创立背景、发展历程、重要里程碑、创始人故事等...',
          category: 'identity',
          keywords: [],
          content: '',
          items: []
        },
        // 内容策略
        {
          id: 'advertising-slogans',
          title: '广告语集',
          description: '品牌的各类广告语和宣传语',
          icon: <Lightbulb className="h-4 w-4" />,
          placeholder: '请输入品牌的广告语、宣传语、营销文案等...',
          category: 'content',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'product-descriptions',
          title: '产品描述词库',
          description: '产品介绍和描述的常用词汇',
          icon: <Package className="h-4 w-4" />,
          placeholder: '请输入产品描述的常用词汇、特色描述、功能介绍等...',
          category: 'content',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'brand-topics',
          title: '品牌核心话题',
          description: '品牌经常讨论的核心主题',
          icon: <MessageSquare className="h-4 w-4" />,
          placeholder: '请输入品牌的核心话题、讨论主题、内容方向等...',
          category: 'content',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'brand-hashtags',
          title: '品牌Hashtags',
          description: '品牌的标签和话题标签',
          icon: <Hash className="h-4 w-4" />,
          placeholder: '请输入品牌的Hashtags、话题标签、社交媒体标签等...',
          category: 'content',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'brand-keywords',
          title: '品牌关键词',
          description: '品牌的核心关键词和搜索词',
          icon: <Search className="h-4 w-4" />,
          placeholder: '请输入品牌的关键词、搜索词、SEO词汇等...',
          category: 'content',
          keywords: [],
          content: '',
          items: []
        },
        {
          id: 'brand-forbidden-words',
          title: '品牌禁用词',
          description: '品牌不应使用的词汇和表达',
          icon: <X className="h-4 w-4" />,
          placeholder: '请输入品牌应避免使用的词汇、禁用表达、敏感词汇等...',
          category: 'content',
          keywords: [],
          content: '',
          items: []
        }
      ];

      setBrandDimensions(dimensions);
    };

    // ✅ FIXED: 2025-08-06 优先加载保存的品牌维度数据
    const savedDimensions = loadDimensionsFromStorage();
    if (savedDimensions.length > 0) {
      setBrandDimensions(savedDimensions);
      console.log('📂 从localStorage恢复品牌维度数据:', savedDimensions.length, '个维度');
    } else {
      // 如果没有保存的数据，则初始化默认维度
      initializeDimensions();
    }

    // ✅ FIXED: 2025-08-06 页面加载时恢复保存的资产状态
    const savedAssets = loadAssetsFromStorage();
    if (savedAssets.length > 0) {
      setBrandAssets(savedAssets);
      console.log('📂 从localStorage恢复资产:', savedAssets.length, '个文件');

      // 检查是否有未完成的分析任务
      const pendingAssets = savedAssets.filter(asset => asset.status === 'processing');
      if (pendingAssets.length > 0) {
        console.log('🔄 发现未完成的分析任务，继续后台处理:', pendingAssets.length, '个文件');
        setTimeout(() => startBackgroundAnalysis(pendingAssets), 2000);
      }
    }
  }, []);

  // ✅ FIXED: 2025-08-06 状态持久化功能
  const saveAssetsToStorage = (assets: BrandAsset[]) => {
    try {
      localStorage.setItem('brandAssets', JSON.stringify(assets));
      localStorage.setItem('brandAssetsTimestamp', Date.now().toString());
    } catch (error) {
      console.error('保存资产到localStorage失败:', error);
    }
  };

  // ✅ FIXED: 2025-08-06 品牌维度数据持久化功能
  const saveDimensionsToStorage = (dimensions: BrandDimension[]) => {
    try {
      // 保存时移除icon字段，避免JSX序列化问题
      const dimensionsToSave = dimensions.map(({ icon, ...rest }) => rest);
      localStorage.setItem('brandDimensions', JSON.stringify(dimensionsToSave));
      localStorage.setItem('brandDimensionsTimestamp', Date.now().toString());
      console.log('💾 品牌维度数据已保存到localStorage');
    } catch (error) {
      console.error('保存品牌维度到localStorage失败:', error);
    }
  };

  const loadAssetsFromStorage = (): BrandAsset[] => {
    try {
      const saved = localStorage.getItem('brandAssets');
      const timestamp = localStorage.getItem('brandAssetsTimestamp');

      if (saved && timestamp) {
        const savedTime = parseInt(timestamp);
        const now = Date.now();
        // 24小时内的数据有效
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          return JSON.parse(saved);
        }
      }
    } catch (error) {
      console.error('从localStorage加载资产失败:', error);
    }
    return [];
  };

  // ✅ FIXED: 2025-08-06 从localStorage加载品牌维度数据
  const loadDimensionsFromStorage = (): BrandDimension[] => {
    try {
      const saved = localStorage.getItem('brandDimensions');
      const timestamp = localStorage.getItem('brandDimensionsTimestamp');

      if (saved && timestamp) {
        const savedTime = parseInt(timestamp);
        const now = Date.now();
        // 7天内的数据有效（品牌维度数据保存时间更长）
        if (now - savedTime < 7 * 24 * 60 * 60 * 1000) {
          console.log('📂 从localStorage恢复品牌维度数据');
          const savedDimensions = JSON.parse(saved);

          // 重新添加icon字段
          return savedDimensions.map((dim: any) => ({
            ...dim,
            icon: getIconForDimension(dim.id)
          }));
        }
      }
    } catch (error) {
      console.error('从localStorage加载品牌维度失败:', error);
    }
    return [];
  };

  // ✅ FIXED: 2025-08-06 后台异步分析功能
  const startBackgroundAnalysis = async (assets: BrandAsset[]) => {
    if (isBackgroundAnalysisRunning) {
      console.log('后台分析已在运行，添加到队列');
      setBackgroundAnalysisQueue(prev => [...prev, ...assets]);
      return;
    }

    setIsBackgroundAnalysisRunning(true);
    console.log('🔄 开始后台AI分析:', assets.map(a => a.name));

    try {
      for (const asset of assets) {
        // 更新状态为分析中
        setBrandAssets(prev => prev.map(a =>
          a.id === asset.id ? { ...a, status: 'processing' } : a
        ));

        try {
          console.log(`🔍 [后台] 开始分析文件: ${asset.name}`);

          // 动态导入AI服务
          const { BrandCorpusService } = await import('@/services/brandCorpusService');
          const corpusService = BrandCorpusService.getInstance();

          const analysisResultV2 = await corpusService.processDocumentV2(
            asset.id,
            asset.name,
            asset.content || '',
            asset.type
          );

          if (analysisResultV2 && analysisResultV2.extractedFields) {
            // 转换为旧格式以兼容现有逻辑
            const analysisResult = corpusService.convertV2ToLegacyFormat(analysisResultV2);

            // 将提取的信息添加到品牌维度中
            Object.entries(analysisResultV2.extractedFields).forEach(([fieldName, fieldData]) => {
              if (fieldData.value && fieldData.confidence > 0.5) {
                const processedValue = formatBrandKeywords(fieldData.value);
                addItemToDimension(fieldName, processedValue, asset.name, fieldData.confidence);
              }
            });

            // 更新资产状态为已分析
            setBrandAssets(prev => {
              const updated = prev.map(a =>
                a.id === asset.id ? {
                  ...a,
                  status: 'analyzed',
                  analysisResult: analysisResult
                } : a
              );
              // 保存到localStorage
              saveAssetsToStorage(updated);
              return updated;
            });

            console.log(`✅ [后台] 分析完成: ${asset.name}`);
          } else {
            throw new Error('AI分析返回空结果');
          }
        } catch (error) {
          console.error(`❌ [后台] 分析失败: ${asset.name}`, error);

          // 更新状态为错误
          setBrandAssets(prev => {
            const updated = prev.map(a =>
              a.id === asset.id ? { ...a, status: 'error' } : a
            );
            saveAssetsToStorage(updated);
            return updated;
          });
        }

        // 添加延迟避免API频率限制
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 执行全局智能去重
      setBrandDimensions(prev => {
        const { dimensions: deduplicatedDimensions, totalDuplicatesRemoved } = performAutoDeduplication(prev);

        if (totalDuplicatesRemoved > 0) {
          console.log(`🧹 全局去重完成: 移除了 ${totalDuplicatesRemoved} 条重复内容`);
        }

        return deduplicatedDimensions;
      });

      // 显示完成通知
      toast({
        title: "🎉 AI分析完成",
        description: `已完成 ${assets.length} 个文件的智能分析，信息已自动添加到品牌语料库并完成智能去重`,
        duration: 6000,
      });

    } catch (error) {
      console.error('后台分析过程出错:', error);
      toast({
        title: "❌ 后台分析出错",
        description: "部分文件分析失败，请稍后重试",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsBackgroundAnalysisRunning(false);

      // 处理队列中的其他任务
      if (backgroundAnalysisQueue.length > 0) {
        const nextBatch = [...backgroundAnalysisQueue];
        setBackgroundAnalysisQueue([]);
        setTimeout(() => startBackgroundAnalysis(nextBatch), 1000);
      }
    }
  };

  /**
   * 获取维度分类
   */
  const getDimensionsByCategory = (category: string) => {
    return brandDimensions.filter(d => d.category === category);
  };

  /**
   * 更新维度内容
   */
  const updateDimension = (id: string, content: string) => {
    setBrandDimensions(prev => {
      const updated = prev.map(d =>
        d.id === id ? { ...d, content } : d
      );
      saveDimensionsToStorage(updated);
      return updated;
    });
  };

  /**
   * 添加关键词到维度
   */
  const addKeywordToDimension = (dimensionId: string, keyword: string) => {
    setBrandDimensions(prev => {
      const updated = prev.map(d =>
        d.id === dimensionId ? { ...d, keywords: [...d.keywords, keyword] } : d
      );
      saveDimensionsToStorage(updated);
      return updated;
    });
  };

  /**
   * 从维度移除关键词
   */
  const removeKeywordFromDimension = (dimensionId: string, keyword: string) => {
    setBrandDimensions(prev => {
      const updated = prev.map(d =>
        d.id === dimensionId ? { ...d, keywords: d.keywords.filter(k => k !== keyword) } : d
      );
      saveDimensionsToStorage(updated);
      return updated;
    });
  };

  /**
   * 更新维度信息条目
   */
  const updateDimensionItem = (dimensionId: string, itemId: string, updates: Partial<BrandInfoItem>) => {
    setBrandDimensions(prev => {
      const updated = prev.map(d =>
        d.id === dimensionId ? {
          ...d,
          items: d.items.map(item =>
            item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
          )
        } : d
      );
      saveDimensionsToStorage(updated);
      return updated;
    });
  };

  /**
   * 添加维度信息条目
   */
  const addDimensionItem = (dimensionId: string, content: string) => {
    const newItem: BrandInfoItem = {
      id: `item-${Date.now()}`,
      content,
      source: '手动添加',
      confidence: 1.0,
      isPinned: false,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setBrandDimensions(prev => {
      const updated = prev.map(d =>
        d.id === dimensionId ? { ...d, items: [...d.items, newItem] } : d
      );
      saveDimensionsToStorage(updated);
      return updated;
    });
  };

  /**
   * 删除维度信息条目 - 打开删除确认对话框
   */
  const deleteDimensionItem = (dimensionId: string, itemId: string) => {
    // 找到要删除的项目
    const dimension = brandDimensions.find(d => d.id === dimensionId);
    const item = dimension?.items.find(i => i.id === itemId);

    if (!item) {
      console.error('未找到要删除的项目:', { dimensionId, itemId });
      return;
    }

    // 打开删除确认对话框
    setDeleteConfirmDialog({
      isOpen: true,
      item: item,
      dimensionId: dimensionId,
      itemId: itemId
    });
  };

  /**
   * 实际执行删除操作
   */
  const executeDeleteItem = (dimensionId: string, itemId: string) => {
    setBrandDimensions(prev => {
      const updated = prev.map(d =>
        d.id === dimensionId ? { ...d, items: d.items.filter(item => item.id !== itemId) } : d
      );
      saveDimensionsToStorage(updated);
      return updated;
    });
  };

  /**
   * 将AI提取的信息添加到对应的品牌维度中
   * ✅ FIXED: 2025-08-05 真实AI分析结果处理
   */
  // 处理删除确认
  const handleDeleteConfirm = () => {
    const { item, dimensionId, itemId } = deleteConfirmDialog;
    if (!item) return;

    // 如果是已钉住或已屏蔽的信息，先取消状态再删除
    if (item.isPinned || item.isBlocked) {
      updateDimensionItem(dimensionId, itemId, { isPinned: false, isBlocked: false });
      // 延迟删除，让用户看到状态变化
      setTimeout(() => {
        executeDeleteItem(dimensionId, itemId);
      }, 300);
    } else {
      executeDeleteItem(dimensionId, itemId);
    }

    // 关闭对话框
    setDeleteConfirmDialog({
      isOpen: false,
      item: null,
      dimensionId: '',
      itemId: ''
    });
  };

  // 取消删除
  const handleDeleteCancel = () => {
    setDeleteConfirmDialog({
      isOpen: false,
      item: null,
      dimensionId: '',
      itemId: ''
    });
  };

  // API连接测试
  const handleAPITest = async () => {
    try {
      toast({
        title: "开始API测试",
        description: "正在测试DeepSeek API连接...",
      });

      const diagnosis = await diagnoseAPIIssues();

      console.log('🔍 API诊断结果:', diagnosis);

      if (diagnosis.deepseek.success) {
        toast({
          title: "✅ API连接正常",
          description: "DeepSeek API可以正常使用，AI分析功能应该能正常工作",
          duration: 5000,
        });
      } else {
        toast({
          title: "❌ API连接失败",
          description: `${diagnosis.deepseek.message}。建议：${diagnosis.recommendations.slice(0, 2).join('、')}`,
          variant: "destructive",
          duration: 8000,
        });

        // 显示详细的诊断信息
        setTimeout(() => {
          toast({
            title: "诊断建议",
            description: diagnosis.recommendations.join('；'),
            duration: 10000,
          });
        }, 1000);
      }
    } catch (error) {
      console.error('API测试失败:', error);
      toast({
        title: "测试失败",
        description: "无法执行API测试，请检查网络连接",
        variant: "destructive",
      });
    }
  };

  // 简化AI测试
  const handleSimpleAITest = async () => {
    try {
      toast({
        title: "开始简化AI测试",
        description: "测试基础AI调用功能...",
      });

      console.log('🧪 开始简化AI测试');

      // 动态导入AI服务
      const { callAI, AITaskType } = await import('@/api/aiService');

      // 使用最简单的AI调用测试
      const testResult = await callAI({
        prompt: "请回复：测试成功",
        taskType: AITaskType.GENERAL_CHAT,
        model: 'deepseek-chat',
        maxTokens: 50,
        temperature: 0.1
      });

      console.log('🧪 AI测试结果:', testResult);

      if (testResult && testResult.content) {
        toast({
          title: "✅ AI调用成功",
          description: `AI响应: ${testResult.content.substring(0, 50)}...`,
          duration: 5000,
        });
      } else {
        toast({
          title: "⚠️ AI调用异常",
          description: "AI有响应但格式异常，请检查配置",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('❌ 简化AI测试失败:', error);
      toast({
        title: "❌ AI调用失败",
        description: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: "destructive",
        duration: 8000,
      });
    }
  };

  // 停止AI分析
  const handleStopAnalysis = () => {
    if (analysisAbortController) {
      analysisAbortController.abort();
      setAnalysisAbortController(null);
    }

    setIsProcessingCorpus(false);
    setCorpusProcessingProgress(0);

    // 更新所有处理中的资产状态
    setBrandAssets(prev => prev.map(asset =>
      asset.status === 'processing' ? { ...asset, status: 'uploaded' } : asset
    ));

    toast({
      title: "🛑 已停止AI分析",
      description: "AI分析已被用户取消，您可以稍后重新尝试",
      duration: 5000,
    });
  };

  /**
   * 处理指定文件列表的AI分析
   * 解决React状态更新异步问题
   */
  const handleBatchCorpusExtractionForAssets = async (assetsToProcess: BrandAsset[]) => {
    console.log('🔍 开始处理指定文件列表:', assetsToProcess.map(a => ({ id: a.id, name: a.name, status: a.status })));

    if (assetsToProcess.length === 0) {
      console.log('⚠️ 没有文件需要处理');
      return;
    }

    setIsProcessingCorpus(true);
    setCorpusProcessingProgress(0);

    try {
      const extractions: BrandCorpusExtraction[] = [];

      // 动态导入AI服务和品牌语料库服务
      const { callAI, AITaskType } = await import('@/api/aiService');
      const { BrandCorpusService } = await import('@/services/brandCorpusService');
      const corpusService = BrandCorpusService.getInstance();

      for (let i = 0; i < assetsToProcess.length; i++) {
        const asset = assetsToProcess[i];
        setCorpusProcessingProgress((i / assetsToProcess.length) * 100);

        try {
          console.log(`🔍 [v2.0] 开始AI分析文件: ${asset.name}`);

          // 更新文件状态为处理中
          setBrandAssets(prev => prev.map(a =>
            a.id === asset.id ? { ...a, status: 'processing' } : a
          ));

          // 🆕 使用v2.0增强的AI服务进行品牌语料库提取
          const analysisResultV2 = await corpusService.processDocumentV2(
            asset.id,
            asset.name,
            asset.content || '',
            asset.type
          );

          if (!analysisResultV2 || !analysisResultV2.extractedFields) {
            throw new Error('AI分析返回空结果');
          }

          console.log(`✅ [v2.0] AI分析完成: ${asset.name}`, {
            fieldsCount: Object.keys(analysisResultV2.extractedFields).length,
            confidence: analysisResultV2.overallConfidence,
            version: analysisResultV2.version
          });

          // 转换为旧版格式以保持兼容性
          const analysisResult = corpusService.convertV2ToLegacyFormat(analysisResultV2);

          const extraction: BrandCorpusExtraction = {
            id: `extraction-${Date.now()}-${i}`,
            sourceId: asset.id,
            sourceName: asset.name,
            sourceType: asset.type,
            extractedAt: new Date().toISOString(),
            extractedFields: analysisResult.extractedFields,
            status: 'completed',
            aiAnalysisMetadata: {
              model: 'deepseek-chat',
              confidence: analysisResult.overallConfidence || 0.8,
              processingTime: analysisResult.processingTime || 0,
              extractedFieldsCount: Object.keys(analysisResult.extractedFields).length
            }
          };

          extractions.push(extraction);

          // ✅ FIXED: 2025-08-06 修复状态同步和关键词显示问题
          // 将提取的信息添加到品牌维度中
          if (analysisResult.extractedFields) {
            Object.entries(analysisResult.extractedFields).forEach(([fieldName, fieldData]) => {
              if (fieldData.value && fieldData.confidence > 0.5) {
                // 使用格式化函数处理值
                const processedValue = formatBrandKeywords(fieldData.value);
                // 根据字段名称添加到对应的维度
                addItemToDimension(fieldName, processedValue, asset.name, fieldData.confidence);
              }
            });
          }

          // 更新资产状态为已分析
          setBrandAssets(prev => prev.map(a =>
            a.id === asset.id ? {
              ...a,
              status: 'analyzed',
              analysisResult: analysisResult // 保存分析结果
            } : a
          ));

          console.log(`✅ AI分析完成: ${asset.name}`, {
            extractedFields: Object.keys(analysisResult.extractedFields).length,
            confidence: analysisResult.overallConfidence
          });

        } catch (error) {
          console.error(`❌ [v2.0] AI分析文件 ${asset.name} 失败:`, error);
          setBrandAssets(prev => prev.map(a =>
            a.id === asset.id ? { ...a, status: 'error' } : a
          ));

          // 显示具体错误信息
          const errorMessage = error instanceof Error ? error.message : '未知错误';

          toast({
            title: `AI分析失败: ${asset.name}`,
            description: errorMessage,
            variant: "destructive",
            duration: 8000,
          });
        }
      }

      setCorpusProcessingProgress(100);

      console.log(`🎉 [v2.0] 批量AI分析完成，成功处理 ${extractions.length}/${assetsToProcess.length} 个文件`);

    } catch (error) {
      console.error('❌ [v2.0] 批量AI分析失败:', error);
      toast({
        title: "批量AI分析失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive",
      });
    } finally {
      setIsProcessingCorpus(false);
      setCorpusProcessingProgress(0);
    }
  };

  // 格式化品牌关键词显示
  const formatBrandKeywords = (value: any): string => {
    if (typeof value === 'string') {
      // 如果是JSON字符串，尝试解析
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          return formatBrandKeywords(parsed);
        }
        return value;
      } catch {
        return value;
      }
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'object' && value !== null) {
      // 格式化对象为用户友好的格式
      const formatted = Object.entries(value)
        .map(([key, val]) => {
          if (Array.isArray(val)) {
            return `${key}: ${val.join(', ')}`;
          }
          return `${key}: ${val}`;
        })
        .join('\n');
      return formatted;
    }

    return String(value);
  };

  // 计算文本相似度（使用简单的词汇重叠算法）
  const calculateSimilarity = (text1: string, text2: string): number => {
    if (!text1 || !text2) return 0;

    // 标准化文本：转小写，移除标点符号，分词
    const normalize = (text: string) => {
      return text.toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '') // 保留中文、英文、数字和空格
        .split(/\s+/)
        .filter(word => word.length > 0);
    };

    const words1 = normalize(text1);
    const words2 = normalize(text2);

    if (words1.length === 0 || words2.length === 0) return 0;

    // 计算词汇重叠度
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  };

  // 检测重复内容
  const detectDuplicates = (items: BrandInfoItem[]): { duplicates: BrandInfoItem[][], unique: BrandInfoItem[] } => {
    const duplicates: BrandInfoItem[][] = [];
    const processed = new Set<string>();
    const unique: BrandInfoItem[] = [];

    for (let i = 0; i < items.length; i++) {
      if (processed.has(items[i].id)) continue;

      const similarItems = [items[i]];
      processed.add(items[i].id);

      for (let j = i + 1; j < items.length; j++) {
        if (processed.has(items[j].id)) continue;

        const similarity = calculateSimilarity(items[i].content, items[j].content);
        if (similarity > 0.6) { // 相似度阈值60%
          similarItems.push(items[j]);
          processed.add(items[j].id);
        }
      }

      if (similarItems.length > 1) {
        duplicates.push(similarItems);
      } else {
        unique.push(items[i]);
      }
    }

    return { duplicates, unique };
  };

  // 合并重复内容
  const mergeDuplicateItems = (duplicateGroup: BrandInfoItem[]): BrandInfoItem => {
    // 选择最长的内容作为主要内容
    const mainItem = duplicateGroup.reduce((prev, current) =>
      current.content.length > prev.content.length ? current : prev
    );

    // 合并所有来源（使用第一个有效来源）
    const allSources = duplicateGroup.map(item => item.source).filter(Boolean);
    const primarySource = allSources[0] || mainItem.source;

    // 计算平均置信度
    const avgConfidence = duplicateGroup.reduce((sum, item) => sum + item.confidence, 0) / duplicateGroup.length;

    return {
      ...mainItem,
      source: primarySource,
      confidence: Math.round(avgConfidence * 100) / 100,
      updatedAt: new Date()
    };
  };

  // 自动去重函数 - 后台逻辑
  const autoDeduplicateDimension = (items: BrandInfoItem[]): { items: BrandInfoItem[], duplicatesRemoved: number } => {
    if (items.length <= 1) {
      return { items, duplicatesRemoved: 0 };
    }

    const { duplicates, unique } = detectDuplicates(items);

    if (duplicates.length === 0) {
      return { items, duplicatesRemoved: 0 };
    }

    // 计算被移除的重复项数量
    const duplicatesRemoved = duplicates.reduce((sum, group) => sum + group.length - 1, 0);

    // 合并重复项
    const mergedItems = duplicates.map(group => mergeDuplicateItems(group));
    const allItems = [...unique, ...mergedItems];

    return { items: allItems, duplicatesRemoved };
  };

  // 全局自动去重 - 在数据更新后自动执行
  const performAutoDeduplication = (dimensions: BrandDimension[]): { dimensions: BrandDimension[], totalDuplicatesRemoved: number } => {
    let totalDuplicatesRemoved = 0;

    const updatedDimensions = dimensions.map(dimension => {
      const { items, duplicatesRemoved } = autoDeduplicateDimension(dimension.items);
      totalDuplicatesRemoved += duplicatesRemoved;

      return {
        ...dimension,
        items
      };
    });

    return { dimensions: updatedDimensions, totalDuplicatesRemoved };
  };

  // ✅ FIXED: 2025-08-06 修复关键词显示和维度映射问题
  const addItemToDimension = (fieldName: string, value: any, sourceName: string, confidence: number) => {
    console.log('🔍 添加项目到维度:', { fieldName, value, sourceName, confidence });

    // 字段名称到维度ID的映射（更全面的映射）
    const fieldToDimensionMap: { [key: string]: string } = {
      'brandName': 'brand-name',
      'brand-name': 'brand-name',
      'brandMission': 'brand-mission',
      'brand-mission': 'brand-mission',
      'brandVision': 'brand-vision',
      'brand-vision': 'brand-vision',
      'brandValues': 'brand-values',
      'brand-values': 'brand-values',
      'brandStory': 'brand-story',
      'brand-story': 'brand-story',
      'targetAudience': 'target-audience',
      'target-audience': 'target-audience',
      'brandTone': 'brand-tone',
      'brand-tone': 'brand-tone',
      'brandPersonality': 'brand-personality',
      'brand-personality': 'brand-personality',
      'brandKeywords': 'brand-keywords',
      'brand-keywords': 'brand-keywords',
      'keywords': 'brand-keywords',
      'coreTopics': 'core-topics',
      'core-topics': 'core-topics',
      'hashtags': 'hashtags',
      'slogans': 'slogans',
      'productFeatures': 'product-features',
      'competitiveAdvantage': 'competitive-advantage'
    };

    const dimensionId = fieldToDimensionMap[fieldName];
    if (!dimensionId) {
      console.warn(`未找到字段 ${fieldName} 对应的维度，尝试添加到品牌关键词`);
      // 如果没有找到对应维度，默认添加到品牌关键词
      const fallbackDimensionId = 'brand-keywords';
      addToSpecificDimension(fallbackDimensionId, value, sourceName, confidence, fieldName);
      return;
    }

    addToSpecificDimension(dimensionId, value, sourceName, confidence, fieldName);
  };

  // 添加到指定维度的辅助函数
  const addToSpecificDimension = (dimensionId: string, value: any, sourceName: string, confidence: number, originalFieldName?: string) => {
    // 处理不同类型的值
    let processedContent: string;

    if (Array.isArray(value)) {
      // 数组类型：过滤掉对象，只保留字符串
      const stringValues = value.filter(item => typeof item === 'string' && item.trim().length > 0);
      processedContent = stringValues.join('、');
    } else if (typeof value === 'object' && value !== null) {
      // 对象类型：使用格式化函数
      processedContent = formatBrandKeywords(value);
    } else {
      // 基本类型：直接转换为字符串
      processedContent = String(value).trim();
    }

    // 如果处理后的内容为空，跳过
    if (!processedContent || processedContent === 'undefined' || processedContent === 'null') {
      console.warn(`跳过空内容: ${fieldName} -> ${value}`);
      return;
    }

    // 创建新的信息条目
    const newItem: BrandInfoItem = {
      id: `ai-extracted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: processedContent,
      source: `${sourceName}${originalFieldName ? ` (${originalFieldName})` : ''}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: confidence > 0.8, // 高置信度的自动钉住
      isBlocked: false,
      confidence: confidence,
      aiGenerated: true
    };

    console.log('📝 创建新项目:', newItem);

    // 添加到对应维度并自动去重
    setBrandDimensions(prev => {
      const updated = prev.map(dimension => {
        if (dimension.id === dimensionId) {
          // 先添加新项目
          const updatedItems = [...dimension.items, newItem];

          // 自动去重
          const { items: deduplicatedItems, duplicatesRemoved } = autoDeduplicateDimension(updatedItems);

          // 如果有重复项被移除，记录日志
          if (duplicatesRemoved > 0) {
            console.log(`🧹 自动去重: 在维度 ${dimension.title} 中移除了 ${duplicatesRemoved} 条重复内容`);
          }

          console.log(`✅ 添加到维度 ${dimensionId}:`, newItem.content);
          return {
            ...dimension,
            items: deduplicatedItems
          };
        }
        return dimension;
      });
      saveDimensionsToStorage(updated);
      return updated;
    });
  };

  /**
   * 保存品牌维度
   */
  const saveBrandDimensions = async () => {
    try {
      // ✅ FIXED: 2025-08-06 实际保存到localStorage
      saveDimensionsToStorage(brandDimensions);

      toast({
        title: "保存成功",
        description: "品牌语料库已保存到本地存储",
      });
    } catch (error) {
      console.error('保存品牌维度失败:', error);
      toast({
        title: "保存失败",
        description: "保存过程中出现错误",
        variant: "destructive",
      });
    }
  };

  /**
   * 批量处理品牌语料库提取 v2.0 - 使用增强的AI分析
   * 🆕 v2.0 更新: 多资料支持、增强溯源、置信度评估
   * ✅ FIXED: 2025-08-05 接入真实AI服务进行品牌语料库分析
   * 🔒 LOCKED: 禁止使用模拟数据或降级方案
   */
  const handleBatchCorpusExtraction = async () => {
    console.log('🔍 开始批量AI分析，当前所有资产:', brandAssets.map(a => ({ id: a.id, name: a.name, status: a.status })));

    const unprocessedAssets = brandAssets.filter(asset =>
      asset.status === 'uploaded' || asset.status === 'error' || asset.status === 'analyzing' || asset.status === 'processing'
    );

    console.log('📋 找到待处理资产:', unprocessedAssets.map(a => ({ id: a.id, name: a.name, status: a.status })));

    if (unprocessedAssets.length === 0) {
      console.log('⚠️ 没有找到可处理的文件');
      toast({
        title: "没有可处理的文件",
        description: "所有文件都已处理完成",
      });
      return;
    }

    setIsProcessingCorpus(true);
    setCorpusProcessingProgress(0);

    try {
      const extractions: BrandCorpusExtraction[] = [];

      // 动态导入AI服务和品牌语料库服务
      const { callAI, AITaskType } = await import('@/api/aiService');
      const { BrandCorpusService } = await import('@/services/brandCorpusService');
      const corpusService = BrandCorpusService.getInstance();

      for (let i = 0; i < unprocessedAssets.length; i++) {
        const asset = unprocessedAssets[i];
        setCorpusProcessingProgress((i / unprocessedAssets.length) * 100);

        try {
          console.log(`🔍 [v2.0] 开始AI分析文件: ${asset.name}`);

          // 更新文件状态为处理中
          setBrandAssets(prev => prev.map(a =>
            a.id === asset.id ? { ...a, status: 'processing' } : a
          ));

          // 🆕 使用v2.0增强的AI服务进行品牌语料库提取
          const analysisResultV2 = await corpusService.processDocumentV2(
            asset.id,
            asset.name,
            asset.content || '',
            asset.type
          );

          if (!analysisResultV2 || !analysisResultV2.extractedFields) {
            throw new Error('AI分析返回空结果');
          }

          console.log(`✅ [v2.0] AI分析完成: ${asset.name}`, {
            fieldsCount: Object.keys(analysisResultV2.extractedFields).length,
            confidence: analysisResultV2.overallConfidence,
            version: analysisResultV2.version
          });

          // 转换为旧版格式以保持兼容性
          const analysisResult = corpusService.convertV2ToLegacyFormat(analysisResultV2);

          const extraction: BrandCorpusExtraction = {
            id: `extraction-${Date.now()}-${i}`,
            sourceId: asset.id,
            sourceName: asset.name,
            sourceType: asset.type,
            extractedAt: new Date().toISOString(),
            extractedFields: analysisResult.extractedFields,
            status: 'completed',
            aiAnalysisMetadata: {
              model: 'deepseek-chat',
              confidence: analysisResult.overallConfidence || 0.8,
              processingTime: analysisResult.processingTime || 0,
              extractedFieldsCount: Object.keys(analysisResult.extractedFields).length
            }
          };

          extractions.push(extraction);

          // ✅ FIXED: 2025-08-06 修复状态同步和关键词显示问题（批量处理）
          // 将提取的信息添加到品牌维度中
          if (analysisResult.extractedFields) {
            Object.entries(analysisResult.extractedFields).forEach(([fieldName, fieldData]) => {
              if (fieldData.value && fieldData.confidence > 0.5) {
                // 使用格式化函数处理值
                const processedValue = formatBrandKeywords(fieldData.value);
                // 根据字段名称添加到对应的维度
                addItemToDimension(fieldName, processedValue, asset.name, fieldData.confidence);
              }
            });
          }

          // 更新资产状态为已分析
          setBrandAssets(prev => prev.map(a =>
            a.id === asset.id ? {
              ...a,
              status: 'analyzed',
              analysisResult: analysisResult // 保存分析结果
            } : a
          ));

          console.log(`✅ AI分析完成: ${asset.name}`, {
            extractedFields: Object.keys(analysisResult.extractedFields).length,
            confidence: analysisResult.overallConfidence
          });

        } catch (error) {
          console.error(`❌ [v2.0] AI分析文件 ${asset.name} 失败:`, error);
          setBrandAssets(prev => prev.map(a =>
            a.id === asset.id ? { ...a, status: 'error' } : a
          ));

          // 显示具体错误信息
          const errorMessage = error instanceof Error ? error.message : '未知错误';

          toast({
            title: `AI分析失败: ${asset.name}`,
            description: errorMessage,
            variant: "destructive",
            duration: 8000, // 延长显示时间以便用户阅读
          });

          // 如果是API配置错误，提供额外的帮助信息
          if (errorMessage.includes('API密钥')) {
            setTimeout(() => {
              toast({
                title: "配置提示",
                description: "请在项目根目录的.env文件中配置正确的VITE_DEEPSEEK_API_KEY",
                variant: "default",
                duration: 10000,
              });
            }, 1000);
          }
        }
      }

      setCorpusExtractions(prev => [...prev, ...extractions]);
      setCorpusProcessingProgress(100);

      toast({
        title: "批量语料库提取完成",
        description: `已成功处理 ${extractions.length} 个资料，信息已追加到语料库`,
      });

    } catch (error) {
      console.error('批量语料库提取失败:', error);
      toast({
        title: "批量处理失败",
        description: "部分资料处理失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsProcessingCorpus(false);
      setCorpusProcessingProgress(0);
    }
  };

  /**
   * 处理删除资产
   */
  const handleDeleteAsset = (asset: BrandAsset) => {
    setAssetToDelete(asset);
    setShowDeleteDialog(true);
  };

  /**
   * 确认删除资产
   */
  const confirmDeleteAsset = () => {
    if (!assetToDelete) return;

    console.log('🗑️ 开始删除资产:', assetToDelete.name);

    // 从品牌资料库中删除文件
    const updatedAssets = brandAssets.filter(a => a.id !== assetToDelete.id);
    setBrandAssets(updatedAssets);

    // 从品牌语料库中删除相关信息 - 修复版本
    let deletedItemsCount = 0;
    const updatedDimensions = brandDimensions.map(dimension => {
      // 删除来源匹配的items
      const filteredItems = dimension.items.filter(item => {
        const shouldDelete = item.source === assetToDelete.name ||
                           item.source.includes(assetToDelete.name) ||
                           (item.source.startsWith(assetToDelete.name.split('.')[0])); // 处理文件名变化
        if (shouldDelete) {
          deletedItemsCount++;
          console.log(`🗑️ 删除语料项目: ${item.content.substring(0, 50)}... (来源: ${item.source})`);
        }
        return !shouldDelete;
      });

      // 删除来源匹配的keywords（保持向后兼容）
      const filteredKeywords = dimension.keywords.filter(keyword =>
        !keyword.source || keyword.source !== assetToDelete.name
      );

      return {
        ...dimension,
        items: filteredItems,
        keywords: filteredKeywords
      };
    });

    setBrandDimensions(updatedDimensions);
    saveDimensionsToStorage(updatedDimensions);

    console.log(`✅ 删除完成: 共删除 ${deletedItemsCount} 条语料信息`);

    toast({
      title: "删除成功",
      description: `${assetToDelete.name} 及其相关的 ${deletedItemsCount} 条语料信息已被删除`,
    });

    setShowDeleteDialog(false);
    setAssetToDelete(null);
  };

  /**
   * 批量删除资产及其语料信息
   */
  const confirmBatchDeleteAssets = () => {
    if (selectedAssetsForBatch.size === 0) return;

    console.log('🗑️ 开始批量删除资产:', Array.from(selectedAssetsForBatch));

    // 获取要删除的资产信息
    const assetsToDelete = brandAssets.filter(asset => selectedAssetsForBatch.has(asset.id));
    const assetNames = assetsToDelete.map(asset => asset.name);

    // 从品牌资料库中删除文件
    const updatedAssets = brandAssets.filter(asset => !selectedAssetsForBatch.has(asset.id));
    setBrandAssets(updatedAssets);

    // 从品牌语料库中删除相关信息
    let totalDeletedItemsCount = 0;
    const updatedDimensions = brandDimensions.map(dimension => {
      // 删除来源匹配的items
      const filteredItems = dimension.items.filter(item => {
        const shouldDelete = assetNames.some(assetName =>
          item.source === assetName ||
          item.source.includes(assetName) ||
          item.source.startsWith(assetName.split('.')[0])
        );
        if (shouldDelete) {
          totalDeletedItemsCount++;
          console.log(`🗑️ 删除语料项目: ${item.content.substring(0, 50)}... (来源: ${item.source})`);
        }
        return !shouldDelete;
      });

      // 删除来源匹配的keywords（保持向后兼容）
      const filteredKeywords = dimension.keywords.filter(keyword =>
        !keyword.source || !assetNames.includes(keyword.source)
      );

      return {
        ...dimension,
        items: filteredItems,
        keywords: filteredKeywords
      };
    });

    setBrandDimensions(updatedDimensions);
    saveDimensionsToStorage(updatedDimensions);

    console.log(`✅ 批量删除完成: 删除了 ${assetsToDelete.length} 个资产和 ${totalDeletedItemsCount} 条语料信息`);

    toast({
      title: "批量删除成功",
      description: `已删除 ${assetsToDelete.length} 个资产及其相关的 ${totalDeletedItemsCount} 条语料信息`,
    });

    // 清理状态
    setSelectedAssetsForBatch(new Set());
    setShowBatchDeleteDialog(false);
    setIsSelectMode(false);
  };

  /**
   * 切换资产选择状态
   */
  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetsForBatch(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (selectedAssetsForBatch.size === filteredAndSortedAssets.length) {
      setSelectedAssetsForBatch(new Set());
    } else {
      setSelectedAssetsForBatch(new Set(filteredAndSortedAssets.map(asset => asset.id)));
    }
  };

  /**
   * 清理孤立的语料信息（来源文件已不存在）
   */
  const cleanupOrphanedCorpusData = () => {
    const existingAssetNames = brandAssets.map(asset => asset.name);
    let cleanedItemsCount = 0;

    console.log('🧹 开始清理孤立语料信息...');
    console.log('📂 当前存在的资产:', existingAssetNames);

    const updatedDimensions = brandDimensions.map(dimension => {
      // 清理items中的孤立数据
      const filteredItems = dimension.items.filter(item => {
        // 检查来源是否还存在
        const sourceExists = existingAssetNames.some(assetName =>
          item.source === assetName ||
          item.source.includes(assetName) ||
          item.source.startsWith(assetName.split('.')[0])
        );

        // 如果来源不存在且不是手动添加的，则删除
        const shouldKeep = sourceExists || !item.source || item.source === '手动添加' || item.source === 'manual';

        if (!shouldKeep) {
          cleanedItemsCount++;
          console.log(`🗑️ 清理孤立语料: ${item.content.substring(0, 50)}... (来源: ${item.source})`);
        }

        return shouldKeep;
      });

      // 清理keywords中的孤立数据（保持向后兼容）
      // keywords是字符串数组，不需要清理
      const filteredKeywords = dimension.keywords;

      return {
        ...dimension,
        items: filteredItems,
        keywords: filteredKeywords
      };
    });

    if (cleanedItemsCount > 0) {
      setBrandDimensions(updatedDimensions);
      saveDimensionsToStorage(updatedDimensions);

      console.log(`✅ 清理完成: 删除了 ${cleanedItemsCount} 条孤立语料信息`);

      toast({
        title: "清理完成",
        description: `已清理 ${cleanedItemsCount} 条孤立的语料信息`,
      });
    } else {
      console.log('✅ 没有发现孤立的语料信息');
      toast({
        title: "清理完成",
        description: "没有发现需要清理的孤立语料信息",
      });
    }
  };

  /**
   * 处理分类编辑
   */
  const handleEditCategory = (asset: BrandAsset) => {
    setAssetToEdit(asset);
    setNewCategory(asset.category || '');
    setShowCategoryDialog(true);
  };

  /**
   * 确认分类编辑
   */
  const confirmEditCategory = () => {
    if (!assetToEdit || !newCategory) return;

    const selectedCategory = SYSTEM_CATEGORIES.find(cat => cat.value === newCategory);
    const categoryLabel = selectedCategory ? selectedCategory.label : newCategory;

    const updatedAssets = brandAssets.map(asset =>
      asset.id === assetToEdit.id
        ? { ...asset, category: newCategory }
        : asset
    );
    setBrandAssets(updatedAssets);

    toast({
      title: "分类更新成功",
      description: `${assetToEdit.name} 已更新为 ${categoryLabel} 分类`,
    });

    setShowCategoryDialog(false);
    setAssetToEdit(null);
    setNewCategory('');
  };

  /**
   * 处理下载文件
   */
  const handleDownloadFile = (asset: BrandAsset) => {
    // 创建一个虚拟的下载链接
    const link = document.createElement('a');
    link.href = asset.url || '#';
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "下载开始",
      description: `正在下载 ${asset.name}`,
    });
  };

  /**
   * 读取文件内容
   * ✅ FIXED: 2025-08-05 支持多种文件格式的内容读取
   */
  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          resolve(''); // 对于二进制文件，返回空字符串
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      // 根据文件类型选择读取方式
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file, 'UTF-8');
      } else if (file.type === 'application/pdf') {
        // PDF文件需要特殊处理，这里先返回文件名作为占位符
        resolve(`PDF文件: ${file.name}`);
      } else if (file.type.startsWith('image/')) {
        // 图片文件返回文件信息
        resolve(`图片文件: ${file.name}`);
      } else {
        // 其他文件类型尝试读取为文本
        reader.readAsText(file, 'UTF-8');
      }
    });
  };

  // ✅ FIXED: 2025-08-06 修复文件上传功能 - 实现后台异步处理
  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newAssets: BrandAsset[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);

        // 检查文件类型
        if (!aiService.isFileTypeSupported(file)) {
          toast({
            title: "文件格式不支持",
            description: `文件 ${file.name} 的格式不受支持`,
            variant: "destructive",
          });
          continue;
        }

        // 创建资产对象
        let fileType = 'document';
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type === 'application/pdf') {
          fileType = 'pdf';
        } else if (file.name.endsWith('.html') || file.name.endsWith('.htm') || file.name.endsWith('.mhtml')) {
          fileType = 'web';
        }

        // 读取文件内容
        const content = await readFileContent(file);

        // ✅ FIXED: 2025-08-06 修复文件状态初始化
        const asset: BrandAsset = {
          id: `asset-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          uploadDate: new Date().toISOString(),
          status: 'uploaded', // 上传完成，等待AI分析
          file: file,
          content: content, // 添加文件内容
          category: 'brand-material',
          analysisResult: null // 初始化分析结果
        };

        newAssets.push(asset);
      }

      // 立即更新状态，显示上传成功
      setBrandAssets(prev => [...prev, ...newAssets]);
      setUploadProgress(100);

      // 保存到localStorage实现状态持久化
      saveAssetsToStorage([...brandAssets, ...newAssets]);

      console.log('📁 文件上传完成，新增资产:', newAssets.map(a => ({ id: a.id, name: a.name, status: a.status })));

      // ✅ 立即显示上传成功，不等待AI分析
      toast({
        title: "✅ 上传成功",
        description: `成功上传 ${newAssets.length} 个文件。AI分析将在后台进行，您可以自由导航到其他页面。`,
        duration: 6000,
      });

      // 显示用户友好提醒
      toast({
        title: "💡 温馨提示",
        description: "AI分析正在后台进行，您可以离开此页面。分析完成后会有通知提醒。",
        duration: 8000,
      });

      // ✅ 后台异步AI分析 - 不阻塞用户操作
      startBackgroundAnalysis(newAssets);

    } catch (error) {
      console.error('文件上传失败:', error);
      toast({
        title: "上传失败",
        description: "文件上传过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理网页内容提取
  const handleWebExtraction = async () => {
    if (!webUrl.trim()) {
      toast({
        title: "请输入URL",
        description: "请输入有效的网页链接",
        variant: "destructive",
      });
      return;
    }

    setIsExtractingWeb(true);
    setExtractionProgress(0);

    try {
      // 验证URL格式
      try {
        new URL(webUrl);
      } catch {
        throw new Error('无效的URL格式，请输入有效的网页地址');
      }

      console.log('🔍 开始网页内容提取:', webUrl);
      setExtractionProgress(10);

      // 使用WebContentExtractorService进行内容提取
      const extractionResult = await webExtractor.extractFromUrl(webUrl, {
        includeBrandAnalysis: true,
        maxContentLength: 5000
      });

      setExtractionProgress(80);

      if (extractionResult.status === 'error') {
        throw new Error(extractionResult.error || '内容提取失败');
      }

      console.log('✅ 网页内容提取成功:', {
        title: extractionResult.title,
        contentLength: extractionResult.content?.length || 0,
        domain: extractionResult.metadata?.domain
      });

      // 转换为品牌资产并添加到列表
      const actualCategory = selectedCategory === 'all' ? '品牌资料' : selectedCategory;
      const brandAsset = webExtractor.convertToBrandAsset(extractionResult, actualCategory);

      setBrandAssets(prev => [brandAsset, ...prev]);

      // 如果有品牌分析结果，可以自动更新语料库
      if (extractionResult.brandAnalysis) {
        console.log('🎯 检测到品牌分析结果，可用于语料库更新');
        // 这里可以添加自动分析逻辑
      }

      setExtractionProgress(100);

      toast({
        title: "网页内容提取成功",
        description: `已成功提取 ${extractionResult.title} 的内容并添加到品牌资料库`,
      });

      // 清空URL输入
      setWebUrl('');

    } catch (error) {
      console.error('❌ 网页内容提取失败:', error);

      let errorMessage = "网页内容提取失败";
      if (error instanceof Error) {
        if (error.message.includes('无效的URL')) {
          errorMessage = "请检查URL格式是否正确";
        } else if (error.message.includes('网络')) {
          errorMessage = "网络连接失败，请检查网络或稍后重试";
        } else if (error.message.includes('访问')) {
          errorMessage = "无法访问该网页，可能需要登录或权限";
        } else if (error.message.includes('超时')) {
          errorMessage = "请求超时，请稍后重试";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "提取失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExtractingWeb(false);
      setExtractionProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageNavigation
        title="多维品牌语料库"
        description="AI智能分析品牌资料，自动构建完整的品牌语料库，支持多维度自定义完善"
        showAdaptButton={false}
        showUpgradeButton={true}
      />

      <div className="container mx-auto px-4 py-8">
        {/* 使用提示 */}
        <Alert className="mb-6 bg-card/90 backdrop-blur-sm border-border rounded-xl">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-muted-foreground">
            <strong className="text-foreground">使用提示：</strong>上传品牌资料越多，AI分析越准确。建议上传品牌手册、产品介绍、营销文案等资料。
            所有维度都支持手动编辑。
          </AlertDescription>
        </Alert>


        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.bmp,.webp,.xls,.xlsx,.ppt,.pptx,.html,.htm,.mhtml"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* 上传进度 */}
        {isUploading && (
          <Card variant="soft" className="mb-6 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">上传进度</span>
                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </CardContent>
          </Card>
        )}



        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="unified-tabs-list grid w-full grid-cols-2">
            <TabsTrigger value="assets" className="unified-tab-trigger">
              <Upload className="tab-icon" />
              <span className="tab-text-mobile">上传资料</span>
              <span className="tab-text-desktop">上传品牌资料</span>
            </TabsTrigger>
            <TabsTrigger value="dimensions" className="unified-tab-trigger">
              <Database className="tab-icon" />
              <span className="tab-text-mobile">语料库</span>
              <span className="tab-text-desktop">品牌语料库</span>
            </TabsTrigger>
          </TabsList>

          {/* 上传品牌资料标签页 */}
          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 flex-shrink-0" style={{ marginTop: '1px' }} />
                  <span>上传品牌资料</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-muted-foreground hover:text-primary ml-1"
                    title="上传品牌资料功能说明：支持PDF、Word、PPT、图片、HTML等多种格式，AI会自动分析文件内容并提取关键信息，分析结果会自动添加到品牌语料库，建议上传品牌手册、产品介绍、营销文案等资料"
                  >
                    <Info className="h-3 w-3" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  支持多种格式的品牌资料上传，AI将自动分析并提取关键信息
                </CardDescription>
                <div className="flex justify-end gap-2 -mt-2">
                  {isProcessingCorpus && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleStopAnalysis}
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      停止分析
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 文件上传区域 */}
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-accent rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        点击上传或拖拽文件到此处
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        支持 PDF、Word、Excel、PowerPoint、图片等多种格式
                      </p>
                    </div>
                    <Button variant="outline" className="bg-card">
                      <FileUp className="h-4 w-4 mr-2" />
                      选择文件
                    </Button>

                    {/* 支持的文件格式 - 使用新的格式展示组件 */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <FileFormatDisplay 
                        mode="compact" 
                        showCategories={true}
                        showQuality={false}
                        className="text-center"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        单个文件建议不超过10MB，支持批量上传和网页内容提取
                      </p>
                    </div>
                  </div>
                </div>

                {/* 网页内容提取 */}
                <div className="border border-border rounded-lg p-4 bg-card">
                  <h4 className="font-medium mb-3 flex items-center gap-3">
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <span className="leading-none">网页内容提取</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="输入网页链接，如：https://example.com"
                        value={webUrl}
                        onChange={(e) => setWebUrl(e.target.value)}
                        className="flex-1"
                        disabled={isExtractingWeb}
                      />
                      <Button
                        onClick={handleWebExtraction}
                        disabled={isExtractingWeb || !webUrl.trim()}
                      >
                        {isExtractingWeb ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {isExtractingWeb ? '提取中...' : '提取内容'}
                      </Button>
                    </div>

                    {/* 提取进度显示 */}
                    {isExtractingWeb && extractionProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">提取进度</span>
                          <span className="font-medium">{extractionProgress}%</span>
                        </div>
                        <Progress value={extractionProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {extractionProgress < 20 && "正在验证URL..."}
                          {extractionProgress >= 20 && extractionProgress < 60 && "正在提取网页内容..."}
                          {extractionProgress >= 60 && extractionProgress < 90 && "正在分析内容..."}
                          {extractionProgress >= 90 && "正在保存到资料库..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* 智能资料管理 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain className="h-5 w-5 flex-shrink-0" />
                  <span className="leading-none">智能资料管理</span>
                </CardTitle>
                <CardDescription>
                  管理已上传的品牌资料，支持AI分析、PDF对话、分类搜索和批量操作
                </CardDescription>
              </CardHeader>

              {/* AI分析状态提示 - 移动到智能资料管理内 */}
              {isBackgroundAnalysisRunning && (
                <div className="mx-6 mb-4">
                  <Alert className="border-border bg-accent">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <AlertDescription className="text-foreground">
                      <strong>🔄 AI分析进行中：</strong>正在后台分析您的品牌资料，您可以自由导航到其他页面。分析完成后会有通知提醒。
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {backgroundAnalysisQueue.length > 0 && (
                <div className="mx-6 mb-4">
                  <Alert className="border-border bg-accent">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <AlertDescription className="text-foreground">
                      <strong>⏳ 分析队列：</strong>还有 {backgroundAnalysisQueue.length} 个文件等待分析。
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <CardContent className="space-y-6">
                {/* 搜索和筛选工具栏 */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  {/* 左侧：搜索和筛选 */}
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="搜索资料名称..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedCategories[0] || 'all'} onValueChange={(value) => {
                        if (value === 'all') {
                          setSelectedCategories([]);
                        } else {
                          setSelectedCategories([value]);
                        }
                      }}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部分类</SelectItem>
                          {SYSTEM_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="排序" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-new">最新上传</SelectItem>
                          <SelectItem value="date-old">最早上传</SelectItem>
                          <SelectItem value="name-asc">名称A-Z</SelectItem>
                          <SelectItem value="name-desc">名称Z-A</SelectItem>
                          <SelectItem value="size-large">文件最大</SelectItem>
                          <SelectItem value="size-small">文件最小</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 右侧：操作按钮组 */}
                  <div className="flex gap-2 items-center">
                    {/* PDF智能对话按钮 */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!brandAssets.some(asset => asset.type === 'pdf')}
                      onClick={() => setShowPdfDialog(true)}
                      className="border-border text-primary hover:bg-accent"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      PDF对话
                    </Button>

                    {/* 视图切换按钮 */}
                    <div className="flex border rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-none border-0"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-none border-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 批量操作栏 */}
                {selectedAssets.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-accent rounded-lg border border-border">
                    <span className="text-sm text-muted-foreground">
                      已选择 {selectedAssets.length} 个文件
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        批量下载
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-1" />
                        批量复制
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4 mr-1" />
                        批量删除
                      </Button>
                    </div>
                  </div>
                )}

                {/* 资料统计 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-card rounded-lg border border-border">
                    <div className="text-2xl font-bold text-foreground">{brandAssets.length}</div>
                    <div className="text-sm text-muted-foreground">总文件数</div>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg border border-border">
                    <div className="text-2xl font-bold text-foreground">
                      {brandAssets.filter(a => a.status === 'analyzed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">已分析</div>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg border border-border">
                    <div className="text-2xl font-bold text-foreground">
                      {brandAssets.filter(a => a.status === 'uploaded').length}
                    </div>
                    <div className="text-sm text-muted-foreground">待分析</div>
                  </div>
                </div>

                {/* 资料列表 */}
                {filteredAndSortedAssets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    {brandAssets.length === 0 ? (
                      <>
                        <p className="text-sm">暂无上传的品牌资料</p>
                        <p className="text-xs mt-1">上传文件后即可使用智能分析功能</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">没有找到匹配的资料</p>
                        <p className="text-xs mt-1">请尝试调整搜索条件或筛选选项</p>
                      </>
                    )}
                  </div>
                ) : viewMode === 'grid' ? (
                  // 网格视图
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedAssets.map((asset) => (
                      <Card key={asset.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent rounded">
                              {asset.type === 'image' ? (
                                <FileImage className="h-5 w-5" />
                              ) : asset.type === 'pdf' ? (
                                <FileText className="h-5 w-5" />
                              ) : asset.type === 'web' ? (
                                <Globe className="h-5 w-5" />
                              ) : (
                                <FileText className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium truncate">{asset.name}</h5>
                              <Badge variant={
                                asset.status === 'uploaded' ? 'secondary' :
                                (asset.status === 'analyzing' || asset.status === 'processing') ? 'default' :
                                asset.status === 'analyzed' ? 'default' : 'destructive'
                              } className="text-xs">
                                {asset.status === 'uploaded' ? '待分析' :
                                 (asset.status === 'analyzing' || asset.status === 'processing') ? '分析中' :
                                 asset.status === 'analyzed' ? '已分析' : '错误'}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {asset.size} • {new Date(asset.uploadDate).toLocaleDateString()}
                          </div>

                          {asset.content && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {asset.content.substring(0, 120)}...
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {/* AI分析按钮 */}
                            {/* ✅ FIXED: 2025-08-06 改进状态按钮和重试机制 */}
                            <Button
                              variant={asset.status === 'analyzed' ? 'default' : asset.status === 'error' ? 'destructive' : 'outline'}
                              size="sm"
                              className={
                                asset.status === 'analyzed' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' :
                                asset.status === 'processing' ? 'bg-accent text-foreground' :
                                asset.status === 'error' ? 'bg-destructive text-primary-foreground' :
                                'border border-border text-foreground hover:bg-accent'
                              }
                              disabled={asset.status === 'processing' || isBackgroundAnalysisRunning}
                              onClick={() => {
                                if (asset.status === 'analyzed') {
                                  // 查看分析结果 - 打开分析结果对话框
                                  setAnalysisResultDialog({
                                    isOpen: true,
                                    asset: asset
                                  });
                                } else if (asset.status === 'uploaded' || asset.status === 'error') {
                                  console.log('开始分析文件:', asset.name);
                                  // 使用后台分析功能
                                  startBackgroundAnalysis([asset]);

                                  toast({
                                    title: "开始AI分析",
                                    description: `正在分析 ${asset.name}，您可以继续其他操作`,
                                    duration: 3000,
                                  });
                                }
                              }}
                            >
                              {asset.status === 'analyzed' ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  查看结果
                                </>
                              ) : asset.status === 'processing' ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  分析中
                                </>
                              ) : asset.status === 'error' ? (
                                <>
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  重试分析
                                </>
                              ) : (
                                <>
                                  <Brain className="h-3 w-3 mr-1" />
                                  分析
                                </>
                              )}
                            </Button>

                            {/* 对话按钮 */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPdfFile(asset);
                                setShowPdfDialog(true);
                                console.log('开始与文件对话:', asset.name);
                              }}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              对话
                            </Button>

                            {/* 更多操作菜单 */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" side="bottom" sideOffset={5}>
                                <DropdownMenuItem
                                  onClick={() => handleDownloadFile(asset)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  下载文件
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditCategory(asset)}
                                >
                                  <Tag className="h-4 w-4 mr-2" />
                                  分类编辑
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteAsset(asset)}
                                  className="text-destructive hover:text-destructive/80 hover:bg-accent"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除文件
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // 列表视图
                  <div className="space-y-3">
                    {filteredAndSortedAssets.map((asset) => (
                      <Card key={asset.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-accent rounded">
                            {asset.type === 'image' ? (
                              <FileImage className="h-5 w-5" />
                            ) : asset.type === 'pdf' ? (
                              <FileText className="h-5 w-5" />
                            ) : asset.type === 'web' ? (
                              <Globe className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{asset.name}</h5>
                              <Badge variant={
                                asset.status === 'uploaded' ? 'secondary' :
                                (asset.status === 'analyzing' || asset.status === 'processing') ? 'default' :
                                asset.status === 'analyzed' ? 'default' : 'destructive'
                              }>
                                {asset.status === 'uploaded' ? '待分析' :
                                 (asset.status === 'analyzing' || asset.status === 'processing') ? '分析中' :
                                 asset.status === 'analyzed' ? '已分析' : '错误'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {asset.size} • {new Date(asset.uploadDate).toLocaleDateString()}
                            </p>
                            {asset.content && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {asset.content.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {/* AI分析状态按钮 */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant={asset.status === 'analyzed' ? 'default' : asset.status === 'error' ? 'destructive' : 'outline'}
                              size="sm"
                              className={
                                asset.status === 'analyzed' ? 'bg-primary text-primary-foreground hover:bg-primary/90' :
                                (asset.status === 'analyzing' || asset.status === 'processing') ? 'bg-muted text-muted-foreground' :
                                asset.status === 'error' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' :
                                'border border-border text-foreground hover:bg-accent'
                              }
                              disabled={(asset.status === 'analyzing' || asset.status === 'processing') || isBackgroundAnalysisRunning}
                              onClick={() => {
                                if (asset.status === 'analyzed') {
                                  // 查看分析结果 - 打开分析结果对话框
                                  setAnalysisResultDialog({
                                    isOpen: true,
                                    asset: asset
                                  });
                                } else if (asset.status === 'uploaded' || asset.status === 'error') {
                                  console.log('开始分析文件:', asset.name);
                                  // 使用后台分析功能
                                  startBackgroundAnalysis([asset]);

                                  toast({
                                    title: "开始AI分析",
                                    description: `正在分析 ${asset.name}，您可以继续其他操作`,
                                    duration: 3000,
                                  });
                                }
                              }}
                            >
                              {asset.status === 'analyzed' ? (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  查看结果
                                </>
                              ) : (asset.status === 'analyzing' || asset.status === 'processing') ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  分析中
                                </>
                              ) : (
                                <>
                                  <Brain className="h-4 w-4 mr-1" />
                                  {asset.status === 'uploaded' ? '待分析' :
                                   asset.status === 'error' ? '重试分析' : '分析'}
                                </>
                              )}
                            </Button>

                            {/* 重新分析按钮 */}
                            {asset.status === 'analyzed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  console.log('重新分析文件:', asset.name);
                                  const updatedAssets = brandAssets.map(a =>
                                    a.id === asset.id ? { ...a, status: 'analyzing' as const } : a
                                  );
                                  setBrandAssets(updatedAssets);

                                  setTimeout(() => {
                                    const finalAssets = brandAssets.map(a =>
                                      a.id === asset.id ? { ...a, status: 'analyzed' as const } : a
                                    );
                                    setBrandAssets(finalAssets);
                                  }, 3000);
                                }}
                                title="重新分析"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            )}
                          </div>

                          {/* 对话按钮 - 所有文件都可以对话 */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPdfFile(asset);
                              setShowPdfDialog(true);
                              console.log('开始与文件对话:', asset.name);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            对话
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="bottom" sideOffset={5}>
                              <DropdownMenuItem
                                onClick={() => handleDownloadFile(asset)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                下载文件
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditCategory(asset)}
                              >
                                <Tag className="h-4 w-4 mr-2" />
                                分类编辑
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteAsset(asset)}
                                className="text-destructive hover:text-destructive/80 hover:bg-accent"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除文件
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 品牌语料库标签页 */}
          <TabsContent value="dimensions" className="space-y-6">



            {/* 语料库状态和操作栏 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* 语料库统计信息 */}
                {brandCorpus && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {`${brandCorpus.sources?.length || 0} 个来源文档`}
                    </span>
                  </div>
                )}

                {/* 提取进度 */}
                {isProcessingCorpus && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-primary">语料库提取中...</span>
                    {corpusProcessingProgress > 0 && (
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${corpusProcessingProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 提取结果统计 */}
                {corpusExtractions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>已提取 {corpusExtractions.length} 个文档</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* 来源管理按钮 */}
                {brandCorpus && brandCorpus.sources && brandCorpus.sources.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSourceManager(true)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    管理来源
                  </Button>
                )}
              </div>
            </div>

            {/* 语料库提取结果预览 */}
            {corpusExtractions.length > 0 && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  已从 {corpusExtractions.length} 个文档中提取语料库信息，所有信息已追加到对应维度。
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-primary ml-2"
                    onClick={() => setShowSourceManager(true)}
                  >
                    查看详细提取结果
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* 四大板块布局 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 基础信息 */}
              <Card className="h-fit">
                <CardHeader className="pb-4 brand-card-header">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 icon-container-brand rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-foreground font-semibold">基础信息</span>
                    </div>
                    <CardDescription className="text-muted-foreground text-sm">
                      品牌的基本信息和核心定位
                    </CardDescription>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 brand-card-content">
                  {getDimensionsByCategory('basic').map((dimension) => (
                    <div key={dimension.id} className="brand-dimension-item">
                      <div className="flex items-center gap-2 mb-3">
                        {dimension.icon}
                        <h4 className="font-medium text-sm text-foreground">{dimension.title}</h4>
                      </div>
                      <DimensionForm
                        dimension={dimension}
                        onUpdate={updateDimension}
                        onAddKeyword={addKeywordToDimension}
                        onRemoveKeyword={removeKeywordFromDimension}
                        isEditing={editingDimension === dimension.id}
                        onEdit={() => setEditingDimension(dimension.id)}
                        onCancel={() => setEditingDimension(null)}
                        onUpdateItem={updateDimensionItem}
                        onAddItem={addDimensionItem}
                        onDeleteItem={deleteDimensionItem}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 语调风格 */}
              <Card className="h-fit">
                <CardHeader className="pb-4 brand-card-header">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 icon-container-brand rounded-lg">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <span className="text-foreground font-semibold">语调风格</span>
                    </div>
                    <CardDescription className="text-muted-foreground text-sm">
                      品牌的语音特征和表达方式
                    </CardDescription>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 brand-card-content">
                  {getDimensionsByCategory('voice').map((dimension) => (
                    <div key={dimension.id} className="brand-dimension-item">
                      <div className="flex items-center gap-2 mb-3">
                        {dimension.icon}
                        <h4 className="font-medium text-sm text-foreground">{dimension.title}</h4>
                      </div>
                      <DimensionForm
                        dimension={dimension}
                        onUpdate={updateDimension}
                        onAddKeyword={addKeywordToDimension}
                        onRemoveKeyword={removeKeywordFromDimension}
                        isEditing={editingDimension === dimension.id}
                        onEdit={() => setEditingDimension(dimension.id)}
                        onCancel={() => setEditingDimension(null)}
                        onUpdateItem={updateDimensionItem}
                        onAddItem={addDimensionItem}
                        onDeleteItem={deleteDimensionItem}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 品牌身份 */}
              <Card className="h-fit">
                <CardHeader className="pb-4 brand-card-header">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 icon-container-brand rounded-lg">
                        <Shield className="h-5 w-5" />
                      </div>
                      <span className="text-foreground font-semibold">品牌身份</span>
                    </div>
                    <CardDescription className="text-muted-foreground text-sm">
                      品牌的核心价值观和使命愿景
                    </CardDescription>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 brand-card-content">
                  {getDimensionsByCategory('identity').map((dimension) => (
                    <div key={dimension.id} className="brand-dimension-item">
                      <div className="flex items-center gap-2 mb-3">
                        {dimension.icon}
                        <h4 className="font-medium text-sm text-foreground">{dimension.title}</h4>
                      </div>
                      <DimensionForm
                        dimension={dimension}
                        onUpdate={updateDimension}
                        onAddKeyword={addKeywordToDimension}
                        onRemoveKeyword={removeKeywordFromDimension}
                        isEditing={editingDimension === dimension.id}
                        onEdit={() => setEditingDimension(dimension.id)}
                        onCancel={() => setEditingDimension(null)}
                        onUpdateItem={updateDimensionItem}
                        onAddItem={addDimensionItem}
                        onDeleteItem={deleteDimensionItem}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 内容策略 */}
              <Card className="h-fit">
                <CardHeader className="pb-4 brand-card-header">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 icon-container-brand rounded-lg">
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <span className="text-foreground font-semibold">内容策略</span>
                    </div>
                    <CardDescription className="text-muted-foreground text-sm">
                      品牌内容创作的核心要素和策略
                    </CardDescription>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 brand-card-content">
                  {getDimensionsByCategory('content').map((dimension) => (
                    <div key={dimension.id} className="brand-dimension-item">
                      <div className="flex items-center gap-2 mb-3">
                        {dimension.icon}
                        <h4 className="font-medium text-sm text-foreground">{dimension.title}</h4>
                      </div>
                      <DimensionForm
                        dimension={dimension}
                        onUpdate={updateDimension}
                        onAddKeyword={addKeywordToDimension}
                        onRemoveKeyword={removeKeywordFromDimension}
                        isEditing={editingDimension === dimension.id}
                        onEdit={() => setEditingDimension(dimension.id)}
                        onCancel={() => setEditingDimension(null)}
                        onUpdateItem={updateDimensionItem}
                        onAddItem={addDimensionItem}
                        onDeleteItem={deleteDimensionItem}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>


        </Tabs>



        {/* PDF智能对话组件 */}
        <PDFChatDialog
          documents={brandAssets
            .filter(asset => asset.type === 'pdf')
            .map(asset => ({
              id: asset.id,
              name: asset.name,
              content: asset.content || '文档内容暂未提取',
              uploadDate: new Date(asset.uploadDate),
              size: asset.size
            }))
          }
          isOpen={showPdfDialog}
          onOpenChange={setShowPdfDialog}
        />

        {/* 删除确认弹窗 */}
        {showDeleteDialog && assetToDelete && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent rounded-lg">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">确认删除</h3>
                  <p className="text-sm text-muted-foreground">此操作无法撤销</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-muted-foreground mb-3">
                  确定要删除 <span className="font-medium">"{assetToDelete.name}"</span> 吗？
                </p>
                <div className="bg-accent border border-border rounded-lg p-3">
                  <div className="text-sm text-foreground">
                    <div className="font-medium mb-1">此操作将：</div>
                    <ul className="space-y-1 text-xs">
                      <li>• 从品牌资料库中删除该文件</li>
                      <li>• 从品牌语料库中删除相关信息</li>
                      <li>• 无法恢复，请谨慎操作</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setAssetToDelete(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmDeleteAsset}
                >
                  确认删除
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 批量删除确认弹窗 */}
        {showBatchDeleteDialog && selectedAssetsForBatch.size > 0 && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent rounded-lg">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">批量删除确认</h3>
                  <p className="text-sm text-muted-foreground">此操作无法撤销</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-muted-foreground mb-3">
                  确定要删除选中的 <span className="font-medium">{selectedAssetsForBatch.size}</span> 个资产吗？
                </p>
                <div className="bg-accent border border-border rounded-lg p-3">
                  <div className="text-sm text-foreground">
                    <div className="font-medium mb-1">此操作将：</div>
                    <ul className="space-y-1 text-xs">
                      <li>• 从品牌资料库中删除所有选中文件</li>
                      <li>• 从品牌语料库中删除所有相关信息</li>
                      <li>• 无法恢复，请谨慎操作</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowBatchDeleteDialog(false);
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmBatchDeleteAssets}
                >
                  确认删除 ({selectedAssetsForBatch.size})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 分类编辑弹窗 */}
        {showCategoryDialog && assetToEdit && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent rounded-lg">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">编辑分类</h3>
                  <p className="text-sm text-muted-foreground">为文件设置新的分类</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  文件名称
                </label>
                <p className="text-muted-foreground mb-4">{assetToEdit.name}</p>

                <label className="block text-sm font-medium text-foreground mb-2">
                  选择分类
                </label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择文件分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{category.label}</span>
                          <span className="text-xs text-muted-foreground">{category.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCategoryDialog(false);
                    setAssetToEdit(null);
                    setNewCategory('');
                  }}
                >
                  取消
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmEditCategory}
                  disabled={!newCategory}
                >
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      {deleteConfirmDialog.isOpen && (
        <Dialog open={deleteConfirmDialog.isOpen} onOpenChange={(open) => !open && handleDeleteCancel()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                确认删除信息
              </DialogTitle>
              <DialogDescription>
                {deleteConfirmDialog.item && (
                  <div className="space-y-3 mt-4">
                    {/* 显示要删除的信息内容 */}
                    <div className="p-3 bg-accent rounded-lg border border-border">
                      <div className="text-sm text-muted-foreground mb-1">要删除的信息：</div>
                      <div className="text-sm font-medium text-foreground line-clamp-3">
                        {deleteConfirmDialog.item.content}
                      </div>
                    </div>

                    {/* 状态提示 */}
                    {(deleteConfirmDialog.item.isPinned || deleteConfirmDialog.item.isBlocked) && (
                      <div className="p-3 bg-accent border border-border rounded-lg">
                        <div className="flex items-center gap-2 text-foreground">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">注意</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          此信息当前为
                          <span className="font-medium">
                            {deleteConfirmDialog.item.isPinned ? '已钉住' : '已屏蔽'}
                          </span>
                          状态，系统将先
                          <span className="font-medium">
                            {deleteConfirmDialog.item.isPinned ? '取消钉住' : '取消屏蔽'}
                          </span>
                          ，然后删除此信息。
                        </div>
                      </div>
                    )}

                    {/* 警告提示 */}
                    <div className="p-3 bg-accent border border-border rounded-lg">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">警告</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        删除后无法恢复，请确认是否继续？
                      </div>
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleDeleteCancel}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                <Trash2 className="h-4 w-4 mr-2" />
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 分析结果对话框 */}
      {analysisResultDialog.isOpen && analysisResultDialog.asset && (
        <Dialog open={analysisResultDialog.isOpen} onOpenChange={(open) => !open && setAnalysisResultDialog({ isOpen: false, asset: null })}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                AI分析结果
              </DialogTitle>
              <DialogDescription>
                文件：{analysisResultDialog.asset.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-accent rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">文件类型</label>
                  <p className="text-sm text-foreground">{analysisResultDialog.asset.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">文件大小</label>
                  <p className="text-sm text-foreground">{analysisResultDialog.asset.size}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">上传时间</label>
                  <p className="text-sm text-foreground">
                    {new Date(analysisResultDialog.asset.uploadDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">分析状态</label>
                  <Badge variant="default" className="text-xs">
                    {analysisResultDialog.asset.status === 'analyzed' ? '已完成' : '处理中'}
                  </Badge>
                </div>
              </div>

              {/* 文件内容预览 */}
              {analysisResultDialog.asset.content && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">文件内容预览</label>
                  <div className="bg-accent rounded-lg p-3 text-sm text-foreground max-h-40 overflow-y-auto">
                    {analysisResultDialog.asset.content.substring(0, 500)}
                    {analysisResultDialog.asset.content.length > 500 && '...'}
                  </div>
                </div>
              )}

              {/* AI分析结果 */}
              {analysisResultDialog.asset.analysisResult && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">AI提取的品牌信息</label>
                  <div className="bg-accent rounded-lg p-3 text-sm">
                    <p className="text-foreground">
                      AI已从此文件中提取了 {Object.keys(analysisResultDialog.asset.analysisResult.extractedFields || {}).length} 个品牌维度的信息，
                      并已自动添加到品牌语料库中。您可以在"品牌语料库"标签页中查看和编辑这些信息。
                    </p>
                  </div>
                </div>
              )}

              {/* 操作提示 */}
              <div className="bg-accent border border-border rounded-lg p-3">
                <p className="text-sm text-foreground">
                  💡 <strong>提示：</strong>AI分析的结果已自动整合到品牌语料库中。您可以在各个品牌维度中查看、编辑或删除提取的信息。
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAnalysisResultDialog({ isOpen: false, asset: null })}
              >
                关闭
              </Button>
              <Button
                onClick={() => {
                  setAnalysisResultDialog({ isOpen: false, asset: null });
                  setActiveTab('corpus');
                }}
              >
                查看语料库
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
  onUpdateItem: (dimensionId: string, itemId: string, updates: Partial<BrandInfoItem>) => void;
  onAddItem: (dimensionId: string, content: string) => void;
  onDeleteItem: (dimensionId: string, itemId: string) => void;
}

function DimensionForm({
  dimension,
  onUpdate,
  onAddKeyword,
  onRemoveKeyword,
  isEditing,
  onEdit,
  onCancel,
  onUpdateItem,
  onAddItem,
  onDeleteItem
}: DimensionFormProps) {
  const [newItemContent, setNewItemContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [selectedSourceItem, setSelectedSourceItem] = useState<BrandInfoItem | null>(null);

  const handleAddItem = () => {
    if (newItemContent.trim()) {
      onAddItem(dimension.id, newItemContent.trim());
      setNewItemContent('');
      setShowAddForm(false);
    }
  };

  const handleEditItem = (item: BrandInfoItem) => {
    setEditingItemId(item.id);
    setEditingContent(item.content);
  };

  const handleSaveEdit = () => {
    if (editingItemId && editingContent.trim()) {
      onUpdateItem(dimension.id, editingItemId, { content: editingContent.trim() });
      setEditingItemId(null);
      setEditingContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingContent('');
  };

  const handleShowSource = (item: BrandInfoItem) => {
    setSelectedSourceItem(item);
    setShowSourceDialog(true);
  };

  const handleSaveConfirm = (item: BrandInfoItem) => {
    onUpdateItem(dimension.id, item.id, {
      isPinned: true,
      updatedAt: new Date()
    });
  };

  return (
    <div className="space-y-4">
      {/* 信息条目列表 */}
      <div className="space-y-3">
        {dimension.items.map((item) => (
          <div key={item.id} className="border border-border rounded-lg p-3 bg-card hover:bg-accent transition-colors">
            {/* 信息内容 */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {editingItemId === item.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="min-h-[60px] text-sm resize-none"
                      placeholder="编辑信息内容..."
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editingContent.trim()}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        保存
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3 mr-1" />
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">
                    {item.content}
                  </p>
                )}

                {/* 来源和置信度信息 */}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>来源: {item.source}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span>置信度: {Math.round(item.confidence * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{
                      item.updatedAt instanceof Date
                        ? item.updatedAt.toLocaleDateString()
                        : new Date(item.updatedAt).toLocaleDateString()
                    }</span>
                  </div>
                </div>
              </div>

              {/* 工具融合按钮 */}
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent"
                      title="信息条目操作菜单：可以钉住、屏蔽、编辑或查看来源等操作"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('钉住/取消钉住点击事件触发', { dimensionId: dimension.id, itemId: item.id, isPinned: item.isPinned });
                        // 钉住时自动取消屏蔽状态
                        if (!item.isPinned && item.isBlocked) {
                          onUpdateItem(dimension.id, item.id, { isPinned: true, isBlocked: false });
                        } else {
                          onUpdateItem(dimension.id, item.id, { isPinned: !item.isPinned });
                        }
                      }}
                      className={item.isPinned ? "text-primary" : ""}
                      disabled={item.isBlocked}
                    >
                      <Pin className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <div>{item.isPinned ? '取消钉住' : '📌 钉住'}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.isPinned ? '取消固定，允许修改此信息' : '固定此条信息，不再改动'}
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('屏蔽/取消屏蔽点击事件触发', { dimensionId: dimension.id, itemId: item.id, isBlocked: item.isBlocked });
                        // 屏蔽时自动取消钉住状态
                        if (!item.isBlocked && item.isPinned) {
                          onUpdateItem(dimension.id, item.id, { isBlocked: true, isPinned: false });
                        } else {
                          onUpdateItem(dimension.id, item.id, { isBlocked: !item.isBlocked });
                        }
                      }}
                      className={item.isBlocked ? "text-muted-foreground" : ""}
                      disabled={item.isPinned}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <div>{item.isBlocked ? '取消屏蔽' : '🚫 屏蔽'}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.isBlocked ? '重新显示此信息' : '隐藏此信息，不再显示'}
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleEditItem(item)}
                      disabled={editingItemId === item.id}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <div>✏️ 编辑内容</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          修改信息内容，调整文字表述
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleShowSource(item)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <div>📄 查看来源</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          查看原始文档和提取上下文
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('删除点击事件触发', { dimensionId: dimension.id, itemId: item.id });
                        // 调用传入的删除处理函数
                        onDeleteItem(dimension.id, item.id);
                      }}
                      className="text-destructive hover:text-destructive/80 hover:bg-accent"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <div>🗑 删除</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.isPinned || item.isBlocked
                            ? '需要先取消钉住/屏蔽状态才能删除'
                            : '永久删除此信息，无法恢复'
                          }
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* 状态指示器 */}
            <div className="flex items-center gap-2 mt-2">
              {item.isPinned && (
                <Badge variant="secondary" className="text-xs">
                  📌 已钉住
                </Badge>
              )}
              {item.isBlocked && (
                <Badge variant="secondary" className="text-xs">
                  🚫 已屏蔽
                </Badge>
              )}
            </div>
          </div>
        ))}

        {/* 空状态 */}
        {dimension.items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm">暂无信息条目</p>
            <p className="text-xs mt-1">上传资料后将自动提取相关信息</p>
          </div>
        )}
      </div>

      {/* 添加新信息 */}
      <div className="border-t pt-3">
        {!showAddForm ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加新信息
          </Button>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder={dimension.placeholder}
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              className="min-h-[80px] text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddItem}
                disabled={!newItemContent.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemContent('');
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 来源详情弹窗 */}
      {showSourceDialog && selectedSourceItem && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">信息来源详情</h3>
                <p className="text-sm text-muted-foreground">查看信息的提取来源和详细信息</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* 信息内容 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  信息内容
                </label>
                <div className="bg-accent rounded-lg p-3 text-sm text-foreground">
                  {selectedSourceItem.content}
                </div>
              </div>

              {/* 来源信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    来源文件
                  </label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{selectedSourceItem.source}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    置信度
                  </label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>{Math.round(selectedSourceItem.confidence * 100)}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    创建时间
                  </label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{
                      selectedSourceItem.createdAt instanceof Date
                        ? selectedSourceItem.createdAt.toLocaleString()
                        : new Date(selectedSourceItem.createdAt).toLocaleString()
                    }</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    最后更新
                  </label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{
                      selectedSourceItem.updatedAt instanceof Date
                        ? selectedSourceItem.updatedAt.toLocaleString()
                        : new Date(selectedSourceItem.updatedAt).toLocaleString()
                    }</span>
                  </div>
                </div>
              </div>

              {/* 状态信息 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  当前状态
                </label>
                <div className="flex gap-2">
                  {selectedSourceItem.isPinned && (
                    <Badge variant="secondary" className="text-xs">
                      📌 已钉住
                    </Badge>
                  )}
                  {selectedSourceItem.isBlocked && (
                    <Badge variant="secondary" className="text-xs">
                      🚫 已屏蔽
                    </Badge>
                  )}
                  {!selectedSourceItem.isPinned && !selectedSourceItem.isBlocked && (
                    <Badge variant="secondary" className="text-xs">
                      ✅ 正常
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSourceDialog(false);
                  setSelectedSourceItem(null);
                }}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

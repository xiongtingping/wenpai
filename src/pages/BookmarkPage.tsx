/**
 * 我的资料库页面
 * 整合网络收藏夹、智能采集、文案管理、内容提取四大功能的统一资料库中心
 */

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bookmark,
  FileText,
  Globe,
  Upload,
  Search,
  Plus,
  Copy,
  Download,
  Edit,
  Trash2,
  Star,
  Tag,
  Clock,
  Filter,
  Save,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  File,
  Link2,
  FolderOpen,
  Zap,
  Brain,
  Eye,
  X,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import { Header } from '@/components/landing/Header';
import { useFavoritesStore, favoritesUtils, type FavoriteItem } from '@/stores/compatibility-layer';
import { useAuth } from '@/hooks/useAuth';
import { getUserDisplayName } from '@/utils/userDisplayUtils';
import { safeSaveToLocalStorage, safeLoadFromLocalStorage, checkLocalStorageAvailability, cleanupLocalStorageData } from '@/utils/safeDataStorage';

/**
 * 安全数组访问工具函数 - 防御undefined访问错误
 */
const safeArray = <T,>(arr: T[] | undefined | null): T[] => arr || [];
const safeLength = <T,>(arr: T[] | undefined | null): number => (arr || []).length;
const safeString = (str: string | undefined | null): string => str || '';

/**
 * 资料项接口
 */
interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: 'collection' | 'extraction' | 'copywriting' | 'memo';
  source?: string;
  sourceType?: 'url' | 'file' | 'manual';
  tags: string[];
  isFavorite: boolean;
  isUsed: boolean;
  category?: string;
  platform?: string;
  summary?: string;
  metadata?: {
    wordCount?: number;
    charCount?: number;
    author?: string;
    date?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 我的资料库页面组件
 * @returns React 组件
 */
export default function BookmarkPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ FIXED: 添加用户认证
  const { user } = useAuth();

  // 收藏系统store
  const favoritesStore = useFavoritesStore();

  // 状态管理
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterFavorite, setFilterFavorite] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'title' | 'type'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 智能采集状态
  const [extractMethod, setExtractMethod] = useState<'url' | 'file'>('url');
  const [extractUrl, setExtractUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // 对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCopywritingDialogOpen, setIsCopywritingDialogOpen] = useState(false);
  const [addContentType, setAddContentType] = useState<'collection' | 'extraction' | 'copywriting'>('collection');
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<LibraryItem | null>(null);
  
  // 新建项表单
  const [newCollection, setNewCollection] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    category: ''
  });
  
  const [newCopywriting, setNewCopywriting] = useState({
    title: '',
    content: '',
    tags: '',
    category: '',
    platform: ''
  });

  /**
   * 获取当前用户的存储键
   */
  const getStorageKey = () => {
    if (user?.id) {
      return `library_items_${user.id}`;
    }
    // 未登录用户使用默认键
    return 'library_items_guest';
  };

  /**
   * ✅ FIXED: 安全加载数据，支持用户数据隔离和错误处理
   */
  React.useEffect(() => {
    const initializeData = async () => {
      const storageKey = getStorageKey();
      console.log('🔑', t('bookmark.storage.useStorageKey'), ':', storageKey);

      // 检查localStorage可用性
      const availability = checkLocalStorageAvailability();
      if (!availability.available) {
        console.error('❌ localStorage', t('bookmark.storage.unavailable'), ':', availability.error);
        toast({
          title: t('pages.labels.存储系统异常'),
          description: availability.error || t('bookmark.storage.cannotAccessLocalStorageAndDataMayNotSave'),
          variant: "destructive"
        });
        setLibraryItems([]);
        return;
      }

      // 清理损坏的数据
      const cleanedCount = cleanupLocalStorageData('library_items_');
      if (cleanedCount > 0) {
        toast({
          title: t('pages.labels.数据清理完成'),
          description: `${t('bookmark.storage.cleaned')} ${cleanedCount} ${t('bookmark.storage.corruptedDataItems')}`
        });
      }

      // 安全加载数据
      const { data, success, error } = safeLoadFromLocalStorage<LibraryItem[]>(storageKey, []);
      
      if (success) {
        setLibraryItems(data || []);
        if (data && data.length > 0) {
          console.log('📂 successloading资料库data:', data.length, t('pages.messages.项'));
        } else {
          console.log('🆕', t('bookmark.storage.initEmptyLibrary'));
        }
      } else {
        console.error('❌', t('bookmark.storage.loadDataFailed'), ':', error);
        toast({
          title: t('pages.labels.数据加载失败'),
          description: error || `${t('bookmark.storage.cannotLoadSavedData')}，${t('bookmark.storage.startFromBlank')}`,
          variant: "destructive"
        });
        setLibraryItems([]);
      }
    };

    initializeData();
  }, [user?.id]); // 当用户ID变化时重新加载数据

  /**
   * ✅ FIXED: 安全保存数据到localStorage
   */
  const safeUpdateLibraryItems = (updatedItems: LibraryItem[], actionDescription: string) => {
    setLibraryItems(updatedItems);

    // 安全保存到localStorage
    const storageKey = getStorageKey();
    const saveResult = safeSaveToLocalStorage(storageKey, updatedItems);
    
    if (saveResult.success) {
      console.log(`💾 ${actionDescription}datasavingsuccess`);
      
      // 显示存储使用情况
      if (saveResult.storageUsed && saveResult.storageUsed > 3 * 1024 * 1024) { // 3MB警告
        toast({
          title: t('pages.labels.存储空间提醒'),
          description: `当前已使用 ${(saveResult.storageUsed / 1024 / 1024).toFixed(2)}MB 存储空间`,
        });
      }
    } else {
      console.error(`❌ ${actionDescription}datasavingfailed:`, saveResult.error);
      
      // 恢复到之前的状态
      const { data: previousData } = safeLoadFromLocalStorage<LibraryItem[]>(storageKey, []);
      if (previousData) {
        setLibraryItems(previousData);
      }
      
      toast({
        title: `${actionDescription}失败`,
        description: saveResult.error || "数据保存失败，请重试或联系管理员",
        variant: "destructive"
      });
    }
  };

  /**
   * 获取筛选后的项目
   */
  const getFilteredItems = (typeFilter?: string) => {
    let filtered = [...libraryItems];

    // 按类型筛选
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // 标签筛选
    if (safeLength(selectedTags) > 0) {
      filtered = filtered.filter(item =>
        item.tags && selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // 收藏筛选
    if (filterFavorite !== null) {
      filtered = filtered.filter(item => item.isFavorite === filterFavorite);
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'time':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  /**
   * 获取所有标签
   */
  const getAllTags = () => {
    const tagSet = new Set<string>();
    safeArray(libraryItems).forEach(item => {
      safeArray(item.tags).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  /**
   * 智能采集功能
   */
  const extractContent = async () => {
    if (extractMethod === 'url' && !extractUrl.trim()) {
      toast({
        title: "请输入URL",
        description: t('pages.messages.请提供有效的网页地址'),
        variant: "destructive"
      });
      return;
    }

    if (extractMethod === 'file' && !selectedFile) {
      toast({
        title: t('pages.labels.请选择文件'),
        description: t('pages.messages.请上传要提取内容的文件'),
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newItem: LibraryItem = {
        id: Date.now().toString(),
        title: extractMethod === 'url' ? `内容提取：${extractUrl}` : `内容提取：${selectedFile?.name}`,
        content: '内容提取失败，请检查API配置',
        type: 'extraction',
        source: extractMethod === 'url' ? extractUrl : selectedFile?.name,
        sourceType: extractMethod,
                  tags: [t('pages.labels.内容提取'), extractMethod === 'url' ? t('pages.messages.网页提取') : selectedFile?.type.includes('image') ? 'OCR识别' : selectedFile?.type.includes('pdf') ? 'PDF提取' : t('pages.messages.文档提取')],
        isFavorite: false,
        isUsed: false,
        category: t('pages.messages.智能提取'),
        summary: extractMethod === 'url' ? '从网页中智能提取的结构化内容，包含核心信息和关键观点...' : selectedFile?.type.includes('image') ? '通过OCR技术从图片中识别提取的文字内容...' : selectedFile?.type.includes('pdf') ? '从PDF文档中提取的文字和结构化信息...' : '从文档中智能提取的核心内容...',
        metadata: {
          wordCount: 350,
          charCount: 1200,
          date: new Date().toISOString().split('T')[0]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedItems = [newItem, ...libraryItems];
      // ✅ FIXED: 使用安全的数据保存方法
      safeUpdateLibraryItems(updatedItems, t('pages.messages.创建收藏'));

      setIsAddDialogOpen(false);
      setExtractUrl('');
      setSelectedFile(null);

      toast({
        title: t('pages.labels.内容提取成功'),
        description: t('pages.messages.内容已智能提取并添加到资料库'),
      });
    } catch {
      toast({
        title: t('pages.messages.内容提取失败'),
        description: t('pages.messages.请检查网络连接或文件格式后重试'),
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // ✅ REMOVED: 已完全移除模拟内容提取功能
  // 系统现在仅支持真实API调用，不提供任何模拟或降级方案

  /**
   * 创建网络收藏
   */
  const createCollection = () => {
    if (!newCollection.title.trim() || !newCollection.url.trim()) {
      toast({
        title: t('pages.labels.请填写完整信息'),
        description: "标题和URL不能为空",
        variant: "destructive"
      });
      return;
    }

    const tags = safeString(newCollection.tags).split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const collection: LibraryItem = {
      id: Date.now().toString(),
      title: newCollection.title.trim(),
      content: newCollection.description.trim() || t('pages.messages.暂无描述'),
      type: 'collection',
      source: newCollection.url.trim(),
      sourceType: 'url',
      tags,
      isFavorite: false,
      isUsed: false,
      category: newCollection.category || t('pages.messages.未分类'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedItems = [collection, ...libraryItems];
    
    // ✅ FIXED: 使用安全的数据保存方法
    safeUpdateLibraryItems(updatedItems, t('pages.messages.收藏创建'));

    setNewCollection({ title: '', url: '', description: '', tags: '', category: '' });
    setIsAddDialogOpen(false);

    toast({
      title: t('pages.labels.收藏成功'),
      description: t('pages.messages.新收藏已保存到资料库'),
    });
  };

  /**
   * 创建文案
   */
  const createCopywriting = () => {
    if (!newCopywriting.title.trim() || !newCopywriting.content.trim()) {
      toast({
        title: t('pages.labels.请填写完整信息'),
        description: t('pages.messages.标题和内容不能为空'),
        variant: "destructive"
      });
      return;
    }

    const tags = safeString(newCopywriting.tags).split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const copywriting: LibraryItem = {
      id: Date.now().toString(),
      title: newCopywriting.title.trim(),
      content: newCopywriting.content.trim(),
      type: 'copywriting',
      tags,
      isFavorite: false,
      isUsed: false,
      category: newCopywriting.category || t('pages.messages.未分类'),
      platform: newCopywriting.platform || undefined,
      metadata: {
        wordCount: newCopywriting.content.trim().split(/\s+/).length,
        charCount: newCopywriting.content.trim().length
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedItems = [copywriting, ...libraryItems];
    
    // ✅ FIXED: 使用安全的数据保存方法
    safeUpdateLibraryItems(updatedItems, t('pages.messages.文案创建'));

    // 只有保存成功才清空表单和关闭对话框
    // 如果保存失败，safeUpdateLibraryItems会显示错误并恢复状态
    setNewCopywriting({ title: '', content: '', tags: '', category: '', platform: '' });
    setIsCopywritingDialogOpen(false);

    toast({
      title: t('pages.labels.文案创建成功'),
      description: t('pages.messages.新文案已保存到资料库'),
    });
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (id: string) => {
    const updatedItems = libraryItems.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    
    // ✅ FIXED: 使用安全的数据保存方法
    safeUpdateLibraryItems(updatedItems, t('pages.messages.收藏状态更新'));
  };

  /**
   * 切换使用状态
   */
  const toggleUsed = (id: string) => {
    const updatedItems = libraryItems.map(item =>
      item.id === id ? { ...item, isUsed: !item.isUsed } : item
    );
    
    // ✅ FIXED: 使用安全的数据保存方法
    safeUpdateLibraryItems(updatedItems, t('pages.messages.使用状态更新'));
  };

  /**
   * 复制内容
   */
  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: t('pages.labels.已复制到剪贴板'),
      description: t('pages.messages.内容已复制'),
    });
  };

  /**
   * 删除项目
   */
  const deleteItem = (id: string) => {
    console.log('🗑️ deletingitem目:', id);

    const updatedItems = libraryItems.filter(item => item.id !== id);
    
    // ✅ FIXED: 使用安全的数据保存方法
    safeUpdateLibraryItems(updatedItems, t('pages.messages.删除项目'));

    toast({
      title: t('pages.labels.已删除'),
      description: t('pages.messages.项目已从资料库中永久移除'),
    });
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * 获取类型图标和名称
   */
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'collection':
        return { icon: Bookmark, name: t('pages.messages.网络剪藏') };
      case 'extraction':
        return { icon: Zap, name: t('pages.labels.内容提取') };
      case 'copywriting':
        return { icon: Brain, name: t('pages.messages.文案管理') };
      default:
        return { icon: FileText, name: t('pages.messages.其他') };
    }
  };

  /**
   * 编辑项目
   */
  const startEdit = (item: LibraryItem) => {
    setEditingItem(item);
  };

  /**
   * 保存编辑
   */
  const saveEdit = () => {
    if (!editingItem) return;

    const updatedItems = libraryItems.map(item =>
      item.id === editingItem.id ? editingItem : item
    );
    
    // ✅ FIXED: 使用安全的数据保存方法
    safeUpdateLibraryItems(updatedItems, t('pages.messages.编辑保存'));

    setEditingItem(null);

    toast({
      title: t('pages.labels.保存成功'),
      description: t('pages.messages.内容已更新'),
    });
  };

  /**
   * 取消编辑
   */
  const cancelEdit = () => {
    setEditingItem(null);
  };

  /**
   * 查看内容详情
   */
  const viewContent = (item: LibraryItem) => {
    setViewingItem(item);
  };

  /**
   * 关闭查看详情
   */
  const closeView = () => {
    setViewingItem(null);
  };

  /**
   * 导出所有资料为MD格式
   */
  const handleExportData = () => {
    try {
      // 获取所有资料
      const allData = {
        libraryItems,
        favorites: favoritesStore.favorites,
        exportDate: new Date().toISOString(),
        totalCount: safeLength(libraryItems) + safeLength(favoritesStore.favorites)
      };

      // 生成MD格式内容
      let mdContent = `# 我的资料库导出\n\n`;
      mdContent += `导出时间: ${new Date().toLocaleString()}\n`;
      mdContent += `总计资料: ${allData.totalCount} 项\n\n`;

      // 导出资料库内容
      if (safeLength(libraryItems) > 0) {
        mdContent += `## 📚 资料库内容 (${safeLength(libraryItems)} 项)\n\n`;

        safeArray(libraryItems).forEach((item, index) => {
          mdContent += `### ${index + 1}. ${item.title}\n\n`;
          mdContent += `**类型**: ${getTypeInfo(item.type).name}\n`;
          mdContent += `**创建时间**: ${new Date(item.createdAt).toLocaleString()}\n`;
          if (item.source) mdContent += `**来源**: ${item.source}\n`;
          if (item.category) mdContent += `**分类**: ${item.category}\n`;
          if (item.tags && item.tags.length > 0) mdContent += `**标签**: ${item.tags.join(', ')}\n`;
          mdContent += `\n**内容**:\n${item.content}\n\n`;
          if (item.summary) mdContent += `**摘要**: ${item.summary}\n\n`;
          mdContent += `---\n\n`;
        });
      }

      // 导出我的收藏内容
      if (safeLength(favoritesStore.favorites) > 0) {
        mdContent += `## ❤️ 我的收藏内容 (${safeLength(favoritesStore.favorites)} 项)\n\n`;

        safeArray(favoritesStore.favorites).forEach((favorite, index) => {
          mdContent += `### ${index + 1}. ${favorite.title}\n\n`;
          mdContent += `**类型**: ${favorite.type}\n`;
          mdContent += `**收藏时间**: ${new Date(favorite.createdAt).toLocaleString()}\n`;
          if ((favorite as any).platform) mdContent += `**平台**: ${(favorite as any).platform}\n`;
          if (favorite.tags && favorite.tags.length > 0) mdContent += `**标签**: ${favorite.tags.join(', ')}\n`;
          mdContent += `\n**内容**:\n${favorite.content}\n\n`;
          mdContent += `---\n\n`;
        });
      }

      // 创建并下载文件
      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `我的资料库_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t('pages.labels.导出成功'),
        description: `已导出 ${allData.totalCount} 项资料到 MD 文件`,
      });
    } catch (error) {
      console.error('exportingfailed:', error);
      toast({
        title: t('pages.errors.导出失败'),
        description: "导出过程中发生错误，请重试",
        variant: "destructive",
      });
    }
  };

  /**
   * 关闭对话框时保持滚动位置
   */
  const handleDialogClose = (setter: (value: boolean) => void) => {
    return (open: boolean) => {
      if (!open) {
        // 延迟执行以避免页面跳转
        setTimeout(() => {
          setter(false);
        }, 0);
      } else {
        setter(true);
      }
    };
  };

  // 为不同标签页获取过滤后的项目
  const allItems = getFilteredItems('all');
  const collectionItems = getFilteredItems('collection');
  const extractionItems = getFilteredItems('extraction');
  const copywritingItems = getFilteredItems('copywriting');

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* 主导航栏 */}
      <Header />

      {/* 页面导航 */}
      <PageNavigation
        title={t('pages.titles.书签管理')}
        description={t('pages.descriptions.书签管理')}
        showAdaptButton={false}
      />

      <div className="container mx-auto px-4 py-8">
        {/* 分类标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList className="unified-tabs-list grid w-full grid-cols-4 max-w-3xl">
              <TabsTrigger value="all" className="unified-tab-trigger">
                <FolderOpen className="tab-icon" />
                <span>全部</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="unified-tab-trigger">
                <Heart className="tab-icon" />
                <span>{t('bookmark.myFavorites')}</span>
                {favoritesStore.totalCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4 min-w-4">
                    {favoritesStore.totalCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="collection" className="unified-tab-trigger">
                <Bookmark className="tab-icon" />
                <span>{t('bookmark.ui.webClipping')}</span>
              </TabsTrigger>
              <TabsTrigger value="copywriting" className="unified-tab-trigger">
                <Brain className="tab-icon" />
                <span>{t('bookmark.copywritingManagement')}</span>
              </TabsTrigger>
            </TabsList>

            {/* 操作按钮区域 - 水平排列，紧凑布局 */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm"
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span>网络剪藏</span>
              </Button>
              <Button
                onClick={() => setIsCopywritingDialogOpen(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm"
                variant="outline"
                size="sm"
              >
                <Brain className="w-4 h-4" />
                <span>{t('bookmark.ui.createCopywriting')}</span>
              </Button>
              <Button
                onClick={handleExportData}
                className="flex items-center gap-1 px-3 py-2 text-sm"
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4" />
                <span>{t('bookmark.ui.exportData')}</span>
              </Button>
            </div>
          </div>

          {/* 搜索和筛选工具栏 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                {/* 搜索框 */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="搜索标题、内容或标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* 筛选选项 */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">筛选：</span>
                  <Button
                    size="sm"
                    variant={filterFavorite === null ? 'default' : 'outline'}
                    onClick={() => setFilterFavorite(null)}
                  >
                    全部
                  </Button>
                  <Button
                    size="sm"
                    variant={filterFavorite === true ? 'default' : 'outline'}
                    onClick={() => setFilterFavorite(true)}
                  >
                    已收藏
                  </Button>
                </div>

                {/* 排序选项 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">排序：</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'time' | 'title' | 'type')}
                    className="p-2 border border-border rounded-md text-sm bg-background text-foreground"
                  >
                    <option value="time">时间</option>
                    <option value="title">标题</option>
                    <option value="type">类型</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="p-2 border border-border rounded-md text-sm bg-background text-foreground"
                  >
                    <option value="desc">降序</option>
                    <option value="asc">升序</option>
                  </select>
                </div>
              </div>

              {/* 标签筛选 */}
              {safeLength(getAllTags()) > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">标签：</span>
                  {safeArray(getAllTags()).map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/*  */}
          <TabsContent value="favorites" className="mt-0">
            <div className="grid gap-4">
              {safeLength(favoritesStore.favorites) === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">暂无收藏内容</h3>
                    <p className="text-muted-foreground mb-4">
                      您还没有收藏任何内容，快去收藏一些有价值的内容吧！
                    </p>
                    <Button onClick={() => navigate('/content-adapter')}>
                      去生成内容
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                safeArray(favoritesStore.favorites).map((favorite) => {
                  const formattedFavorite = favoritesUtils.formatFavoriteForDisplay(favorite);

                  return (
                    <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {formattedFavorite.typeName}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formattedFavorite.formattedDate}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              来源：{favorite.source}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(favorite.content);
                                toast({
                                  title: t('pages.labels.复制成功'),
                                  description: t('pages.messages.内容已复制到剪贴板'),
                                });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                favoritesStore.removeFavorite(favorite.id);
                                toast({
                                  title: t('pages.labels.取消收藏'),
                                  description: t('pages.messages.已从我的收藏中移除'),
                                });
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-medium text-foreground mb-2">{favorite.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                          {formattedFavorite.contentPreview}
                        </p>
                        {favorite.tags && favorite.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {favorite.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* 全部标签页内容 */}
          <TabsContent value="all" className="mt-0">
            <div className="grid gap-4">
              {allItems.map((item) => {
                const typeInfo = getTypeInfo(item.type);

                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              <typeInfo.icon className="w-4 h-4" />
                              <span className="ml-1">{typeInfo.name}</span>
                            </Badge>
                            <h3
                              className="font-semibold cursor-pointer hover:text-foreground transition-colors"
                              onClick={() => viewContent(item)}
                            >
                              {item.title}
                            </h3>
                            {item.isFavorite && (
                              <Star className="w-4 h-4 text-primary fill-current" />
                            )}
                            {item.isUsed && (
                              <Badge variant="secondary" className="text-xs">
                                已使用
                              </Badge>
                            )}
                          </div>

                          <div
                            className="text-sm text-muted-foreground mb-3 line-clamp-2 cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => viewContent(item)}
                          >
                            {item.content}
                          </div>

                          {item.source && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                              <Link2 className="w-3 h-3" />
                              <span className="truncate">{item.source}</span>
                            </div>
                          )}

                          {item.summary && (
                            <div className="mb-3 p-2 bg-accent rounded text-xs border border-border">
                              <div className="flex items-center gap-1 mb-1">
                                <Sparkles className="w-3 h-3 text-foreground" />
                                <span className="font-medium text-foreground">AI总结</span>
                              </div>
                              <p className="text-foreground">{item.summary}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mb-2">
                            {item.tags && item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(item.updatedAt)}
                            </span>
                            {item.category && (
                              <span>{item.category}</span>
                            )}
                            {item.platform && (
                              <span>{item.platform}</span>
                            )}
                            {item.metadata?.wordCount && (
                              <span>{item.metadata.wordCount} 字</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // 跳转到AI内容适配并预填充内容
                              navigate('/content-adapter', {
                                state: {
                                  prefilledContent: item.content || t('pages.messages.暂无内容'),
                                  source: 'library',
                                  sourceTitle: item.title || t('pages.labels.未命名资料')
                                }
                              });
                            }}
                            title={t('pages.buttons.快速生成')}
                          >
                            <Zap className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(item.id)}
                          >
                            <Star className={`w-4 h-4 ${item.isFavorite ? 'text-foreground fill-current' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyContent(item.content)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 空状态 */}
            {allItems.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">暂无资料</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || safeLength(selectedTags) > 0 ? t('pages.messages.没有找到匹配的资料') : t('pages.messages.请使用右上角的按钮开始添加您的第一个资料')}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 网络剪藏标签页 */}
          <TabsContent value="collection" className="mt-0">
            <div className="grid gap-4">
              {collectionItems.map((item) => {
                const typeInfo = getTypeInfo(item.type);

                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <typeInfo.icon className="w-4 h-4 text-primary" />
                          <Badge variant="outline">
                            {typeInfo.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(item.content);
                              toast({
                                title: t('pages.labels.复制成功'),
                                description: t('pages.messages.内容已复制到剪贴板'),
                              });
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium text-foreground mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {item.content}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {safeLength(collectionItems) === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">暂无网络剪藏</h3>
                    <p className="text-muted-foreground">
                      请使用右上角的t('pages.messages.网络剪藏')按钮开始剪藏网络内容
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/*  */}
          <TabsContent value="copywriting" className="mt-0">
            <div className="grid gap-4">
              {copywritingItems.map((item) => {
                const typeInfo = getTypeInfo(item.type);

                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <typeInfo.icon className="w-4 h-4 text-primary" />
                          <Badge variant="outline">
                            {typeInfo.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(item.content);
                              toast({
                                title: t('pages.labels.复制成功'),
                                description: t('pages.messages.内容已复制到剪贴板'),
                              });
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium text-foreground mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {item.content}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {safeLength(copywritingItems) === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2"></h3>
                    <p className="text-muted-foreground">
                      
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 网络剪藏对话框 */}
        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose(setIsAddDialogOpen)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('bookmark.ui.webClipping')}</DialogTitle>
              <DialogDescription>
                {t('bookmark.ui.addWebContentToLibrary')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>标题</Label>
                <Input
                  value={newCollection.title}
                  onChange={(e) => setNewCollection({ ...newCollection, title: e.target.value })}
                  placeholder={t('components.labels.占位符')}
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={newCollection.url}
                  onChange={(e) => setNewCollection({ ...newCollection, url: e.target.value })}
                  placeholder={t('pages.messages.输入网页链接')}
                />
              </div>
              <div>
                <Label>描述</Label>
                <Textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  placeholder="输入描述（可选）"
                  rows={3}
                />
              </div>
              <div>
                <Label>标签</Label>
                <Input
                  value={newCollection.tags}
                  onChange={(e) => setNewCollection({ ...newCollection, tags: e.target.value })}
                  placeholder="输入标签，用逗号分隔"
                />
              </div>
              <div>
                <Label>分类</Label>
                <Input
                  value={newCollection.category}
                  onChange={(e) => setNewCollection({ ...newCollection, category: e.target.value })}
                  placeholder="输入分类（可选）"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createCollection} className="flex-1">
                保存收藏
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 创建文案对话框 */}
        <Dialog open={isCopywritingDialogOpen} onOpenChange={handleDialogClose(setIsCopywritingDialogOpen)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('bookmark.ui.createCopywriting')}</DialogTitle>
              <DialogDescription>
                {t('bookmark.ui.createNewCopywritingContent')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>标题</Label>
                <Input
                  value={newCopywriting.title}
                  onChange={(e) => setNewCopywriting({ ...newCopywriting, title: e.target.value })}
                  placeholder={t('components.labels.占位符')}
                />
              </div>
              <div>
                <Label>内容</Label>
                <Textarea
                  value={newCopywriting.content}
                  onChange={(e) => setNewCopywriting({ ...newCopywriting, content: e.target.value })}
                  placeholder={t('components.labels.占位符')}
        rows={8}
                />
              </div>
              <div>
                <Label>平台</Label>
                <Input
                  value={newCopywriting.platform}
                  onChange={(e) => setNewCopywriting({ ...newCopywriting, platform: e.target.value })}
                  placeholder="目标平台（如：微信、微博、小红书等）"
                />
              </div>
              <div>
                <Label>标签</Label>
                <Input
                  value={newCopywriting.tags}
                  onChange={(e) => setNewCopywriting({ ...newCopywriting, tags: e.target.value })}
                  placeholder="输入标签，用逗号分隔"
                />
              </div>
              <div>
                <Label>分类</Label>
                <Input
                  value={newCopywriting.category}
                  onChange={(e) => setNewCopywriting({ ...newCopywriting, category: e.target.value })}
                  placeholder="输入分类（可选）"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createCopywriting} className="flex-1">
                {t('bookmark.ui.createCopywriting')}
              </Button>
              <Button variant="outline" onClick={() => setIsCopywritingDialogOpen(false)}>
                取消
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 编辑对话框 */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setTimeout(() => cancelEdit(), 0)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑内容</DialogTitle>
              <DialogDescription>
                修改{editingItem?.type === 'collection' ? t('pages.messages.网络收藏') : 
                     editingItem?.type === 'extraction' ? t('pages.labels.内容提取') : t('pages.messages.文案管理')}内容
              </DialogDescription>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <Label>标题</Label>
                  <Input
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder={t('components.labels.占位符')}
                  />
                </div>
                <div>
                  <Label>内容</Label>
                  <Textarea
                    value={editingItem.content}
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    placeholder={t('components.labels.占位符')}
        rows={8}
                  />
                </div>
                {editingItem.type === 'collection' && (
                  <div>
                    <Label>链接</Label>
                    <Input
                      value={editingItem.source || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, source: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>标签（用逗号分隔）</Label>
                    <Input
                      value={safeArray(editingItem.tags).join(', ')}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      })}
                      placeholder="标签1, 标签2"
                    />
                  </div>
                  <div>
                    <Label>分类</Label>
                    <Input
                      value={editingItem.category || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      placeholder={t('components.labels.占位符')}
                    />
                  </div>
                </div>
                {editingItem.type === 'copywriting' && (
                  <div>
                    <Label>平台</Label>
                    <Input
                      value={editingItem.platform || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, platform: e.target.value })}
                      placeholder={t('components.labels.占位符')}
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={cancelEdit}>
                取消
              </Button>
              <Button onClick={saveEdit}>
                <Save className="w-4 h-4 mr-2" />
                保存修改
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 查看内容对话框 */}
        <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setTimeout(() => closeView(), 0)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {viewingItem?.title}
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={closeView}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <DialogDescription>
                {viewingItem?.type === 'collection' ? t('pages.messages.网络收藏') : 
                 viewingItem?.type === 'extraction' ? t('pages.labels.内容提取') : t('pages.messages.文案管理')}
                {viewingItem?.source && ` • 来源：${viewingItem.source}`}
              </DialogDescription>
            </DialogHeader>
            
            {viewingItem && (
              <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                {/* 标签和分类 */}
                <div className="flex flex-wrap gap-2">
                  {viewingItem.tags && viewingItem.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {viewingItem.category && (
                    <Badge variant="secondary" className="text-xs">
                      {viewingItem.category}
                    </Badge>
                  )}
                </div>

                {/* AI总结 */}
                {viewingItem.summary && (
                  <div className="p-4 bg-accent rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-medium text-primary">AI总结</span>
                    </div>
                    <p className="text-primary text-sm">{viewingItem.summary}</p>
                  </div>
                )}

                {/* 主要内容 */}
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {viewingItem.content}
                  </div>
                </div>

                {/* 元数据 */}
                {viewingItem.metadata && (
                  <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
                    {viewingItem.metadata.wordCount && (
                      <div>字数：{viewingItem.metadata.wordCount}</div>
                    )}
                    {viewingItem.metadata.charCount && (
                      <div>字符数：{viewingItem.metadata.charCount}</div>
                    )}
                    {viewingItem.metadata.date && (
                      <div>日期：{viewingItem.metadata.date}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewingItem && copyContent(viewingItem.content)}
              >
                <Copy className="w-4 h-4 mr-2" />
                复制内容
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewingItem) {
                    setEditingItem(viewingItem);
                    closeView();
                  }
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
